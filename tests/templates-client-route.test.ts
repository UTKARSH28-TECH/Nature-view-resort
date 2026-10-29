import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildEnquiryEmail, escapeHtml, oneLine } from "@/lib/email-templates";
import { addDays, todayInIndia } from "@/lib/contact-validation";
import { validateEventEnquiry } from "@/lib/enquiries";
import { validateRoomEnquiry } from "@/lib/room-enquiry";
import { submitEnquiry } from "@/lib/submit-enquiry";
import { NOW, TODAY, HOST, makeRequest, validEvent, validRoom } from "./helpers";

describe("email templates", () => {
  it("escapes HTML and strips control and line-separator characters from one-line text", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
    expect(oneLine("a\r\nb c\u0000d")).toBe("a b c d");
    expect(oneLine("x".repeat(200), 50)).toHaveLength(50);
  });

  it("includes every submitted room field plus the enquiry-not-booking note", () => {
    const r = validateRoomEnquiry(validRoom, TODAY);
    if (!r.ok) throw new Error("fixture invalid");
    const m = buildEnquiryEmail({ kind: "room", value: r.value }, "NVR-261029-ABCDE", NOW);
    for (const s of ["NVR-261029-ABCDE", "Deluxe Room with Lake View", "10 December 2026", "12 December 2026", "2 nights", "Adults: 2", "Children: 1", "Asha Verma", "9876543210", "asha@example.com", "Ground floor if possible.", "29 October 2026", "IST"])
      expect(m.text).toContain(s);
    expect(m.text).toMatch(/not a confirmed reservation/i);
    expect(m.html).toMatch(/not a confirmed reservation/i);
  });

  it("includes every submitted event field", () => {
    const r = validateEventEnquiry(validEvent, TODAY);
    if (!r.ok) throw new Error("fixture invalid");
    const m = buildEnquiryEmail({ kind: "event", value: r.value }, "NVR-261029-ZZZZZ", NOW);
    for (const s of ["Wedding", "20 January 2027", "Approximate guests: 150", "Lawn / outdoor area", "Ravi Kumar", "9876543210", "ravi@example.com", "Vegetarian catering."])
      expect(m.text).toContain(s);
    expect(m.text).toMatch(/not a confirmed .*event booking/i);
  });
});

describe("browser submit helper (mock fetch)", () => {
  const send = (res: Response | Error) =>
    submitEnquiry("room", validRoom, { submissionId: "id-12345678", honeypot: "" }, (async () => {
      if (res instanceof Error) throw res;
      return res;
    }) as unknown as typeof fetch);
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

  it("maps API responses to outcomes", async () => {
    expect(await send(json(200, { ok: true, status: "sent", reference: "NVR-1" }))).toEqual({ status: "sent", reference: "NVR-1", saved: false });
    expect(await send(json(200, { ok: true, status: "sent", reference: "NVR-1", saved: true }))).toEqual({ status: "sent", reference: "NVR-1", saved: true });
    expect(await send(json(200, { ok: true, status: "saved", reference: "NVR-3", saved: true }))).toEqual({ status: "saved", reference: "NVR-3" });
    expect(await send(json(422, { ok: false, status: "invalid", errors: { name: "Bad" } }))).toEqual({ status: "invalid", errors: { name: "Bad" } });
    expect(await send(json(429, { ok: false, status: "rate-limited", retryAfterSeconds: 90 }))).toEqual({ status: "rate-limited", retryAfterSeconds: 90 });
    expect(await send(json(503, { ok: false, status: "not-configured" }))).toEqual({ status: "not-configured" });
    expect(await send(json(502, { ok: false, status: "delivery-failed", reference: "NVR-2" }))).toEqual({ status: "delivery-failed", reference: "NVR-2" });
  });

  it("treats network errors and non-JSON failures as failures, never success", async () => {
    expect(await send(new TypeError("offline"))).toEqual({ status: "network-error" });
    expect(await send(new Response("<html>Bad gateway</html>", { status: 504 }))).toEqual({ status: "network-error" });
    expect((await send(new Response("oops", { status: 500 }))).status).toBe("delivery-failed");
  });

  it("posts JSON with kind, submission id and honeypot", async () => {
    const f = vi.fn(async () => json(200, { ok: true, status: "sent" }));
    await submitEnquiry("event", { name: "A" }, { submissionId: "abc-12345678", honeypot: "bot" }, f as unknown as typeof fetch);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/enquiries");
    expect(JSON.parse(String(init.body))).toMatchObject({ kind: "event", submissionId: "abc-12345678", website: "bot", name: "A" });
  });
});

describe("API route with environment configuration", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "info").mockImplementation(() => {});
    delete process.env.RESEND_API_KEY;
    delete process.env.ENQUIRY_FROM_EMAIL;
    delete process.env.ENQUIRY_TO_EMAIL;
    delete process.env.DATABASE_URL;
  });
  afterEach(() => {
    process.env = { ...saved };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // The route uses the real clock, so build dates relative to today.
  const body = { ...validRoom, checkIn: addDays(todayInIndia(), 30), checkOut: addDays(todayInIndia(), 32) };
  const post = (route: { POST: (r: Request) => Promise<Response> }, b: unknown = body, ip = "203.0.113.50") =>
    route.POST(makeRequest(b, { headers: { "x-forwarded-for": ip } }));

  it("reports not-configured, sends nothing and calls no provider when credentials are missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const route = await import("@/app/api/enquiries/route");
    const res = await post(route);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, status: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("sends through the provider when configured, using server-side env only", async () => {
    process.env.RESEND_API_KEY = "re_test_SECRET_VALUE";
    process.env.ENQUIRY_FROM_EMAIL = "enquiries@mail.nvr.test";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "m1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const route = await import("@/app/api/enquiries/route");
    const res = await post(route);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe("sent");
    expect(data.reference).toMatch(/^NVR-\d{6}-[A-Z2-9]{5}$/);
    expect(JSON.stringify(data)).not.toContain("SECRET_VALUE");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_SECRET_VALUE");
    expect(JSON.parse(String(init.body)).to).toEqual(["natureviewresort1@gmail.com"]);
  });

  it("returns a safe error when the provider fails and does not echo provider details", async () => {
    process.env.RESEND_API_KEY = "re_test_SECRET_VALUE";
    process.env.ENQUIRY_FROM_EMAIL = "enquiries@mail.nvr.test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"message":"Invalid API key re_test_SECRET_VALUE"}', { status: 401 })));
    const route = await import("@/app/api/enquiries/route");
    const res = await post(route, body, "203.0.113.51");
    const text = await res.text();
    expect(res.status).toBe(502);
    expect(text).toContain("delivery-failed");
    expect(text).not.toContain("SECRET_VALUE");
    expect(text).not.toContain("Invalid API key");
  });

  it("rate limits at the route level", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.ENQUIRY_FROM_EMAIL = "enquiries@mail.nvr.test";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const route = await import("@/app/api/enquiries/route");
    const codes: number[] = [];
    for (let i = 0; i < 8; i++) codes.push((await post(route, { ...body, name: `Guest ${i}` }, "203.0.113.60")).status);
    expect(codes.slice(0, 6).every((c) => c === 200)).toBe(true);
    expect(codes.slice(6)).toEqual([429, 429]);
  });

  it("degrades honestly when DATABASE_URL points at an unreachable database", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.ENQUIRY_FROM_EMAIL = "enquiries@mail.nvr.test";
    process.env.DATABASE_URL = "postgres://dbuser:SuperSecretDbPassword@127.0.0.1:1/nvr";
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const route = await import("@/app/api/enquiries/route");
    const res = await post(route, body, "203.0.113.70");
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ status: "sent", saved: false }); // emailed, but NOT claimed as saved
    expect(text).not.toContain("SuperSecretDbPassword");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports failure (not success) when the database is unreachable and email is not configured", async () => {
    process.env.DATABASE_URL = "postgres://dbuser:SuperSecretDbPassword@127.0.0.1:1/nvr";
    const route = await import("@/app/api/enquiries/route");
    const res = await post(route, body, "203.0.113.71");
    const text = await res.text();
    expect(res.status).toBe(502);
    expect(JSON.parse(text)).toMatchObject({ status: "delivery-failed", saved: false });
    expect(text).not.toContain("SuperSecretDbPassword");
  });

  it("answers GET with 405 and exposes no enquiry data", async () => {
    const route = (await import("@/app/api/enquiries/route")) as unknown as { GET: () => Response };
    const res = route.GET();
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ ok: false, status: "method-not-allowed" });
  });

  it("uses the request host for the same-origin check", async () => {
    const route = await import("@/app/api/enquiries/route");
    const res = await route.POST(makeRequest(body, { headers: { origin: `https://${HOST}.evil.test` } }));
    expect(res.status).toBe(403);
  });
});
