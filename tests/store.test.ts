import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getStoreFromEnv } from "@/lib/db";
import { createEnquiryStore, fingerprintOf, type NewEnquiry } from "@/lib/enquiry-store";
import { validateEventEnquiry } from "@/lib/enquiries";
import { validateRoomEnquiry } from "@/lib/room-enquiry";
import { LIMITS, parseLimit, readServerLimits } from "@/config/enquiry-limits";
import { TODAY, validEvent, validRoom } from "./helpers";
import { brokenDb, createTestDb } from "./db-helpers";

type TestDb = Awaited<ReturnType<typeof createTestDb>>;
let t: TestDb;

const roomPayload = () => {
  const r = validateRoomEnquiry(validRoom, TODAY);
  if (!r.ok) throw new Error("fixture invalid");
  return { kind: "room" as const, value: r.value };
};
const eventPayload = () => {
  const r = validateEventEnquiry(validEvent, TODAY);
  if (!r.ok) throw new Error("fixture invalid");
  return { kind: "event" as const, value: r.value };
};
const record = (over: Partial<NewEnquiry> = {}): NewEnquiry => {
  const payload = over.payload ?? roomPayload();
  return { reference: "NVR-261029-AAAAA", submissionId: "sub-12345678", fingerprint: fingerprintOf(payload), payload, ...over };
};

beforeAll(async () => {
  t = await createTestDb();
});
afterAll(async () => {
  await t.pg.close();
});
beforeEach(async () => {
  await t.reset();
});

describe("enquiries table (real migration SQL on in-memory Postgres)", () => {
  it("stores a room enquiry with every field and sensible defaults", async () => {
    const store = createEnquiryStore(t.db);
    expect(await store.insert(record())).toEqual({ ok: true });
    const [row] = await t.rows();
    expect(row).toMatchObject({
      reference: "NVR-261029-AAAAA",
      submission_id: "sub-12345678",
      kind: "room",
      status: "new",
      guest_name: "Asha Verma",
      phone: "9876543210",
      email: "asha@example.com",
      email_status: "pending",
    });
    expect(row.payload).toMatchObject({ room: "deluxe-room-with-lake-view", checkIn: "2026-12-10", checkOut: "2026-12-12", adults: 2, children: 1, requests: "Ground floor if possible." });
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("does not duplicate contact details inside the JSON payload (data minimisation)", async () => {
    await createEnquiryStore(t.db).insert(record());
    const [row] = await t.rows();
    const payload = row.payload as Record<string, unknown>;
    for (const key of ["name", "phone", "email"]) expect(payload).not.toHaveProperty(key);
    expect(row).toMatchObject({ guest_name: "Asha Verma", phone: "9876543210", email: "asha@example.com" });
  });

  it("stores an event enquiry", async () => {
    const store = createEnquiryStore(t.db);
    await store.insert(record({ payload: eventPayload(), reference: "NVR-261029-BBBBB", submissionId: null }));
    const [row] = await t.rows();
    expect(row).toMatchObject({ kind: "event", guest_name: "Ravi Kumar", submission_id: null });
    expect(row.payload).toMatchObject({ eventType: "wedding", guests: 150, space: "lawn" });
  });

  it("refuses a duplicate reference or submission id instead of overwriting", async () => {
    const store = createEnquiryStore(t.db);
    await store.insert(record());
    expect(await store.insert(record({ submissionId: "other-12345678" }))).toEqual({ ok: false, reason: "conflict" }); // same reference
    expect(await store.insert(record({ reference: "NVR-261029-CCCCC" }))).toEqual({ ok: false, reason: "conflict" }); // same submission
    expect(await t.rows()).toHaveLength(1);
  });

  it("allows many rows with no submission id", async () => {
    const store = createEnquiryStore(t.db);
    await store.insert(record({ reference: "R1", submissionId: null }));
    await store.insert(record({ reference: "R2", submissionId: null }));
    expect(await t.rows()).toHaveLength(2);
  });

  it("has no 'confirmed' status: the site cannot mark a booking confirmed", async () => {
    await createEnquiryStore(t.db).insert(record());
    await expect(t.pg.query("UPDATE enquiries SET status = 'confirmed'")).rejects.toThrow();
    await expect(t.pg.query("UPDATE enquiries SET status = 'contacted'")).resolves.toBeDefined();
    await expect(t.pg.query("UPDATE enquiries SET kind = 'spa'")).rejects.toThrow();
    await expect(t.pg.query("UPDATE enquiries SET email_status = 'delivered'")).rejects.toThrow();
  });

  it("finds an enquiry by submission id", async () => {
    const store = createEnquiryStore(t.db);
    await store.insert(record());
    expect(await store.findBySubmissionId("sub-12345678")).toMatchObject({ reference: "NVR-261029-AAAAA", emailStatus: "pending" });
    expect(await store.findBySubmissionId("nope-12345678")).toBeNull();
  });

  it("finds a recent identical enquiry by fingerprint, but not an old one", async () => {
    const store = createEnquiryStore(t.db);
    const rec = record();
    await store.insert(rec);
    expect((await store.findRecentByFingerprint(rec.fingerprint, 30))?.reference).toBe("NVR-261029-AAAAA");
    await t.pg.exec("UPDATE enquiries SET created_at = now() - interval '2 hours'");
    expect(await store.findRecentByFingerprint(rec.fingerprint, 30)).toBeNull();
    expect(await store.findRecentByFingerprint(rec.fingerprint, 180)).not.toBeNull();
    expect(await store.findRecentByFingerprint("different", 30)).toBeNull();
  });

  it("records the email result", async () => {
    const store = createEnquiryStore(t.db);
    await store.insert(record());
    expect(await store.markEmail("NVR-261029-AAAAA", { status: "sent", providerId: "email_123" })).toBe(true);
    let [row] = await t.rows();
    expect(row).toMatchObject({ email_status: "sent", email_provider_id: "email_123", email_failure: null });
    expect(row.email_attempted_at).toBeTruthy();

    await store.markEmail("NVR-261029-AAAAA", { status: "failed", failure: "rejected:403" });
    [row] = await t.rows();
    expect(row).toMatchObject({ email_status: "failed", email_failure: "rejected:403" });

    expect(await store.markEmail("NVR-DOES-NOT-EXIST", { status: "sent" })).toBe(false);
  });

  it("is safe against SQL injection in guest text (values are parameters)", async () => {
    const evil = { ...validRoom, name: "Robert'); DROP TABLE enquiries;--", requests: "'; DELETE FROM enquiries; --" };
    const r = validateRoomEnquiry(evil, TODAY);
    if (!r.ok) throw new Error("fixture invalid");
    const store = createEnquiryStore(t.db);
    await store.insert(record({ payload: { kind: "room", value: r.value }, fingerprint: "x" }));
    const rows = await t.rows();
    expect(rows).toHaveLength(1);
    expect(rows[0].guest_name).toBe("Robert'); DROP TABLE enquiries;--");
  });

  it("reports failure honestly when the database is down", async () => {
    const store = createEnquiryStore(brokenDb);
    expect(await store.insert(record())).toEqual({ ok: false, reason: "error" });
    expect(await store.markEmail("x", { status: "sent" })).toBe(false);
    await expect(store.findBySubmissionId("sub-12345678")).rejects.toThrow();
  });
});

describe("fingerprint", () => {
  it("is stable, case-insensitive on email, and differs when the enquiry differs", () => {
    const a = roomPayload();
    const b = { kind: "room" as const, value: { ...a.value, email: "ASHA@example.com" } };
    const c = { kind: "room" as const, value: { ...a.value, checkOut: "2026-12-13" } };
    expect(fingerprintOf(a)).toBe(fingerprintOf(roomPayload()));
    expect(fingerprintOf(a)).toBe(fingerprintOf(b));
    expect(fingerprintOf(a)).not.toBe(fingerprintOf(c));
    expect(fingerprintOf(a)).not.toBe(fingerprintOf(eventPayload()));
    expect(fingerprintOf(a)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("database configuration", () => {
  it("returns no store without DATABASE_URL, so persistence is clearly inactive", () => {
    expect(getStoreFromEnv({})).toBeNull();
    expect(getStoreFromEnv({ DATABASE_URL: "  " })).toBeNull();
    expect(getStoreFromEnv({ DATABASE_URL: "mysql://x" })).toBeNull();
    expect(getStoreFromEnv({ DATABASE_URL: "not a url" })).toBeNull();
  });

  it("creates a store lazily for a postgres URL without connecting", () => {
    expect(getStoreFromEnv({ DATABASE_URL: "postgresql://user:pw@127.0.0.1:1/db" })).not.toBeNull();
  });
});

describe("configurable limits", () => {
  it("uses safe defaults and ignores invalid overrides", () => {
    expect(LIMITS).toMatchObject({ maxAdults: 20, maxChildren: 20, maxTotalGuests: 30, maxNights: 90, maxDaysAhead: 730, maxEventGuests: 5000 });
    expect(parseLimit(undefined, 20, 1, 200)).toBe(20);
    expect(parseLimit("35", 20, 1, 200)).toBe(35);
    expect(parseLimit("0", 20, 1, 200)).toBe(20); // below minimum
    expect(parseLimit("9999", 20, 1, 200)).toBe(20); // above maximum
    expect(parseLimit("ten", 20, 1, 200)).toBe(20);
    expect(parseLimit("2.5", 20, 1, 200)).toBe(20);
    expect(parseLimit("", 20, 1, 200)).toBe(20);
  });

  it("reads server abuse controls from the environment", () => {
    expect(readServerLimits({})).toEqual({ rateLimitMax: 6, rateLimitWindowMinutes: 10, duplicateWindowMinutes: 30 });
    expect(readServerLimits({ ENQUIRY_RATE_LIMIT_MAX: "3", ENQUIRY_RATE_LIMIT_WINDOW_MINUTES: "60", ENQUIRY_DUPLICATE_WINDOW_MINUTES: "5" })).toEqual({
      rateLimitMax: 3,
      rateLimitWindowMinutes: 60,
      duplicateWindowMinutes: 5,
    });
    expect(readServerLimits({ ENQUIRY_RATE_LIMIT_MAX: "-1" }).rateLimitMax).toBe(6);
  });
});
