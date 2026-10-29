import { describe, expect, it } from "vitest";
import { validateEventEnquiry } from "@/lib/enquiries";
import { roomFromQuery, validateRoomEnquiry } from "@/lib/room-enquiry";
import { ROOM_LIST } from "@/lib/rooms";
import { TODAY, validEvent, validRoom } from "./helpers";

const room = (over: Record<string, unknown> = {}) => validateRoomEnquiry({ ...validRoom, ...over }, TODAY);
const event = (over: Record<string, unknown> = {}) => validateEventEnquiry({ ...validEvent, ...over }, TODAY);
const errorsOf = (r: ReturnType<typeof room> | ReturnType<typeof event>) => (r.ok ? {} : (r.errors as Record<string, string>));

describe("room enquiry validation", () => {
  it("accepts a valid enquiry and normalises values", () => {
    const r = room();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.phone).toBe("9876543210");
      expect(r.value.nights).toBe(2);
      expect(r.value.room).toBe("deluxe-room-with-lake-view");
    }
  });

  it("accepts each of the three real room slugs", () => {
    expect(ROOM_LIST.map((r) => r.slug)).toEqual([
      "deluxe-room-with-lake-view",
      "deluxe-twin-room-with-balcony-hill-and-lake-view",
      "executive-suite-with-private-balcony",
    ]);
    for (const { slug } of ROOM_LIST) expect(room({ room: slug }).ok).toBe(true);
  });

  it("accepts 'no preference' (empty room)", () => {
    const r = room({ room: "" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.room).toBe("");
  });

  it("rejects unknown room slugs and never maps them to a room", () => {
    for (const bad of ["penthouse", "Deluxe-Room-With-Lake-View", "../rooms", "deluxe", "<script>"]) {
      const r = room({ room: bad });
      expect(r.ok).toBe(false);
      expect(errorsOf(r).room).toBeTruthy();
    }
  });

  it("roomFromQuery only returns known slugs", () => {
    expect(roomFromQuery("executive-suite-with-private-balcony")).toBe("executive-suite-with-private-balcony");
    expect(roomFromQuery("unknown")).toBe("");
    expect(roomFromQuery(undefined)).toBe("");
    expect(roomFromQuery("")).toBe("");
  });

  it("requires dates and checks their order", () => {
    expect(errorsOf(room({ checkIn: "", checkOut: "" }))).toMatchObject({ checkIn: expect.any(String), checkOut: expect.any(String) });
    expect(errorsOf(room({ checkOut: "2026-12-10" })).checkOut).toMatch(/after check-in/i); // same day
    expect(errorsOf(room({ checkOut: "2026-12-09" })).checkOut).toMatch(/after check-in/i); // before
    expect(room({ checkOut: "2026-12-11" }).ok).toBe(true); // one night is fine
  });

  it("rejects past, impossible and malformed dates", () => {
    expect(errorsOf(room({ checkIn: "2026-10-28", checkOut: "2026-10-30" })).checkIn).toMatch(/past/i);
    expect(room({ checkIn: TODAY, checkOut: "2026-10-30" }).ok).toBe(true); // today is allowed
    expect(errorsOf(room({ checkIn: "2026-02-30" })).checkIn).toMatch(/valid/i);
    expect(errorsOf(room({ checkIn: "10/12/2026" })).checkIn).toMatch(/valid/i);
    expect(errorsOf(room({ checkOut: "not-a-date" })).checkOut).toMatch(/valid/i);
  });

  it("applies only documented technical sanity limits", () => {
    expect(errorsOf(room({ checkIn: "2029-01-01", checkOut: "2029-01-03" })).checkIn).toMatch(/too far ahead/i);
    expect(errorsOf(room({ checkIn: "2026-12-01", checkOut: "2027-06-01" })).checkOut).toMatch(/call us/i);
    expect(room({ checkIn: "2026-12-01", checkOut: "2027-02-28" }).ok).toBe(true); // 89 nights
  });

  it("validates guest counts", () => {
    expect(errorsOf(room({ adults: 0 })).adults).toBeTruthy();
    expect(errorsOf(room({ adults: 21 })).adults).toBeTruthy();
    expect(errorsOf(room({ adults: "two" })).adults).toBeTruthy();
    expect(errorsOf(room({ adults: 1.5 })).adults).toBeTruthy();
    expect(errorsOf(room({ children: -1 })).children).toBeTruthy();
    expect(errorsOf(room({ children: 21 })).children).toBeTruthy();
    expect(errorsOf(room({ adults: 20, children: 11 })).adults).toMatch(/call us/i);
    expect(room({ children: "" }).ok).toBe(true); // blank children means none
  });

  it("validates contact details", () => {
    expect(errorsOf(room({ name: "" })).name).toBeTruthy();
    expect(errorsOf(room({ name: "A" })).name).toBeTruthy();
    expect(errorsOf(room({ name: "x".repeat(81) })).name).toBeTruthy();
    expect(errorsOf(room({ phone: "12345" })).phone).toBeTruthy();
    expect(errorsOf(room({ phone: "5876543210" })).phone).toBeTruthy(); // Indian mobiles start 6-9
    expect(room({ phone: "098765 43210" }).ok).toBe(true);
    expect(errorsOf(room({ email: "nope" })).email).toBeTruthy();
    expect(errorsOf(room({ email: "a@b" })).email).toBeTruthy();
  });

  it("rejects header-injection attempts in email and control characters in name", () => {
    expect(errorsOf(room({ email: "a@b.com\nBcc: evil@x.com" })).email).toBeTruthy();
    expect(errorsOf(room({ email: "a@b.com\r\nSubject: hi" })).email).toBeTruthy();
    expect(errorsOf(room({ email: "a@b.com,evil@x.com" })).email).toBeTruthy();
    expect(errorsOf(room({ name: "Asha\u0000Verma" })).name).toBeTruthy();
  });

  it("limits the length of special requests", () => {
    expect(room({ requests: "x".repeat(1500) }).ok).toBe(true);
    expect(errorsOf(room({ requests: "x".repeat(1501) })).requests).toBeTruthy();
  });

  it("reports every problem at once for an empty submission", () => {
    const r = validateRoomEnquiry({}, TODAY);
    expect(r.ok).toBe(false);
    expect(Object.keys(errorsOf(r))).toEqual(expect.arrayContaining(["checkIn", "checkOut", "adults", "name", "phone", "email"]));
  });

  it("ignores non-string garbage safely", () => {
    const r = validateRoomEnquiry({ ...validRoom, name: { a: 1 }, email: ["x"], phone: null }, TODAY);
    expect(r.ok).toBe(false);
  });
});

describe("event enquiry validation (server)", () => {
  it("accepts a valid enquiry", () => {
    const r = event();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ eventType: "wedding", guests: 150, space: "lawn", eventDate: "2027-01-20" });
  });

  it("accepts the 'date not fixed' option without a date", () => {
    const r = event({ eventDate: "", dateFlexible: true });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.eventDate).toBe("");
  });

  it("requires a date unless flexible, and rejects past or invalid dates", () => {
    expect(errorsOf(event({ eventDate: "" })).eventDate).toBeTruthy();
    expect(errorsOf(event({ eventDate: "2026-10-01" })).eventDate).toMatch(/future/i);
    expect(errorsOf(event({ eventDate: "2027-02-31" })).eventDate).toMatch(/valid/i);
    expect(event({ eventDate: TODAY }).ok).toBe(true);
  });

  it("validates event type, space and guest count", () => {
    expect(errorsOf(event({ eventType: "" })).eventType).toBeTruthy();
    expect(errorsOf(event({ eventType: "rave" })).eventType).toBeTruthy();
    expect(errorsOf(event({ space: "ballroom" })).space).toBeTruthy();
    expect(event({ space: "" }).ok).toBe(true);
    expect(errorsOf(event({ guests: 0 })).guests).toBeTruthy();
    expect(errorsOf(event({ guests: 5001 })).guests).toBeTruthy();
    expect(errorsOf(event({ guests: 12.5 })).guests).toBeTruthy();
    expect(errorsOf(event({ guests: "" })).guests).toBeTruthy();
    expect(event({ guests: "200" }).ok).toBe(true);
  });

  it("validates contact details and requirement length", () => {
    expect(errorsOf(event({ name: "" })).name).toBeTruthy();
    expect(errorsOf(event({ phone: "123" })).phone).toBeTruthy();
    expect(errorsOf(event({ email: "x@y.com\nBcc: a@b.com" })).email).toBeTruthy();
    expect(errorsOf(event({ requirements: "x".repeat(1501) })).requirements).toBeTruthy();
  });
});
