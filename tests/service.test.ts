import { describe, expect, it } from "vitest";
import { handleEnquiryRequest, MAX_BODY_BYTES } from "@/lib/enquiry-service";
import { createRateLimiter } from "@/lib/rate-limit";
import { makeDeps, makeMailer, makeRequest, validEvent, validRoom } from "./helpers";

describe("enquiry service: success paths", () => {
  it("sends a room enquiry to the resort email with a reference, and reports 'sent'", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);

    expect(r.httpStatus).toBe(200);
    expect(r.body).toEqual({ ok: true, status: "sent", reference: "NVR-261029-TEST1", saved: false });
    expect(sent).toHaveLength(1);
    const mail = sent[0];
    expect(mail.to).toBe("natureviewresort1@gmail.com");
    expect(mail.from).toBe("Nature View <enquiries@mail.nvr.test>");
    expect(mail.replyTo).toBe("asha@example.com");
    expect(mail.subject).toContain("NVR-261029-TEST1");
    expect(mail.subject).toMatch(/room booking enquiry/i);
    for (const text of [mail.text, mail.html]) {
      expect(text).toContain("NVR-261029-TEST1");
      expect(text).toContain("Deluxe Room with Lake View");
      expect(text).toContain("9876543210");
      expect(text).toContain("asha@example.com");
      expect(text).toContain("Ground floor if possible.");
      expect(text).toMatch(/not a confirmed (reservation|booking)/i);
    }
    expect(mail.text).toContain("2026-10-29T08:00:00.000Z"); // submission timestamp
  });

  it("sends an event enquiry through the same pipeline", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest(validEvent), deps);
    expect(r.httpStatus).toBe(200);
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toMatch(/event enquiry/i);
    expect(sent[0].text).toContain("Wedding");
    expect(sent[0].text).toContain("Lawn / outdoor area");
    expect(sent[0].text).toContain("Approximate guests: 150");
    expect(sent[0].text).toMatch(/not a confirmed/i);
  });

  it("states an unfixed event date honestly", async () => {
    const { deps, sent } = makeDeps();
    await handleEnquiryRequest(makeRequest({ ...validEvent, eventDate: "", dateFlexible: true }), deps);
    expect(sent[0].text).toContain("Preferred date: Not fixed yet");
  });
});

describe("enquiry service: validation and abuse protection", () => {
  it("returns 422 with field errors and sends nothing for invalid data", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest({ ...validRoom, room: "penthouse", checkOut: "2026-12-01" }), deps);
    expect(r.httpStatus).toBe(422);
    expect(r.body.status).toBe("invalid");
    expect(r.body.errors).toMatchObject({ room: expect.any(String), checkOut: expect.any(String) });
    expect(sent).toHaveLength(0);
  });

  it("validates on the server even if the browser skipped validation", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest({ kind: "event" }), deps);
    expect(r.httpStatus).toBe(422);
    expect(sent).toHaveLength(0);
  });

  it("silently ignores honeypot submissions without sending email", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest({ ...validRoom, website: "http://spam.example" }), deps);
    expect(r.httpStatus).toBe(200);
    expect(r.body.status).toBe("received");
    expect(r.body.reference).toBeUndefined();
    expect(sent).toHaveLength(0);
  });

  it("rejects cross-origin and origin-less posts", async () => {
    const { deps, sent } = makeDeps();
    const cross = await handleEnquiryRequest(makeRequest(validRoom, { headers: { origin: "https://evil.example" } }), deps);
    const none = await handleEnquiryRequest(makeRequest(validRoom, { headers: { origin: "" } }), deps);
    expect(cross.httpStatus).toBe(403);
    expect(none.httpStatus).toBe(403);
    expect(sent).toHaveLength(0);
  });

  it("only accepts POST with a JSON content type", async () => {
    const { deps } = makeDeps();
    expect((await handleEnquiryRequest(makeRequest(null, { method: "GET" }), deps)).httpStatus).toBe(405);
    const form = await handleEnquiryRequest(makeRequest(null, { raw: "a=b", headers: { "content-type": "application/x-www-form-urlencoded" } }), deps);
    expect(form.httpStatus).toBe(415);
  });

  it("enforces a request size limit", async () => {
    const { deps, sent } = makeDeps();
    const declared = await handleEnquiryRequest(makeRequest(validRoom, { headers: { "content-length": String(MAX_BODY_BYTES + 1) } }), deps);
    expect(declared.httpStatus).toBe(413);
    const big = await handleEnquiryRequest(makeRequest({ ...validRoom, requests: "x".repeat(MAX_BODY_BYTES) }), deps);
    expect(big.httpStatus).toBe(413);
    expect(sent).toHaveLength(0);
  });

  it("returns 400 for malformed or unexpected JSON", async () => {
    const { deps } = makeDeps();
    expect((await handleEnquiryRequest(makeRequest(null, { raw: "{not json" }), deps)).httpStatus).toBe(400);
    expect((await handleEnquiryRequest(makeRequest(null, { raw: "[1,2]" }), deps)).httpStatus).toBe(400);
    expect((await handleEnquiryRequest(makeRequest({ ...validRoom, kind: "spa" }), deps)).httpStatus).toBe(400);
    expect((await handleEnquiryRequest(makeRequest({ ...validRoom, kind: undefined }), deps)).httpStatus).toBe(400);
  });

  it("rate limits repeated requests from one client and sets Retry-After", async () => {
    const { deps, sent } = makeDeps({ rateLimiter: createRateLimiter({ windowMs: 600_000, max: 3 }) });
    const statuses: number[] = [];
    let last;
    for (let i = 0; i < 5; i++) {
      last = await handleEnquiryRequest(makeRequest({ ...validRoom, name: `Guest ${i}` }), deps);
      statuses.push(last.httpStatus);
    }
    expect(statuses).toEqual([200, 200, 200, 429, 429]);
    expect(last?.headers?.["Retry-After"]).toBeDefined();
    expect(last?.body.retryAfterSeconds).toBeGreaterThan(0);
    expect(sent).toHaveLength(3);
  });

  it("rate limits per client: a different IP is unaffected", async () => {
    const { deps } = makeDeps({ rateLimiter: createRateLimiter({ windowMs: 600_000, max: 1 }) });
    expect((await handleEnquiryRequest(makeRequest(validRoom), deps)).httpStatus).toBe(200);
    expect((await handleEnquiryRequest(makeRequest({ ...validRoom, name: "Second Guest" }), deps)).httpStatus).toBe(429);
    const other = await handleEnquiryRequest(makeRequest({ ...validRoom, name: "Third Guest" }, { headers: { "x-forwarded-for": "198.51.100.9" } }), deps);
    expect(other.httpStatus).toBe(200);
  });
});

describe("enquiry service: email safety", () => {
  it("escapes guest text in the HTML email", async () => {
    const { deps, sent } = makeDeps();
    await handleEnquiryRequest(makeRequest({ ...validRoom, requests: '<script>alert("x")</script> & <img src=x onerror=1>' }), deps);
    expect(sent[0].html).not.toContain("<script>");
    expect(sent[0].html).not.toContain("<img");
    expect(sent[0].html).toContain("&lt;script&gt;");
    expect(sent[0].html).toContain("&amp;");
  });

  it("cannot inject email headers through the name or subject", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest({ ...validRoom, name: "Eve\r\nBcc: evil@example.com\r\nSubject: Hacked" }), deps);
    expect(r.httpStatus).toBe(200);
    expect(sent[0].subject).not.toMatch(/[\r\n]/);
    expect(sent[0].from).not.toMatch(/[\r\n]/);
    expect(sent[0].replyTo).toBe("asha@example.com");
  });

  it("rejects an email address carrying extra headers", async () => {
    const { deps, sent } = makeDeps();
    const r = await handleEnquiryRequest(makeRequest({ ...validRoom, email: "a@b.com\r\nBcc: evil@example.com" }), deps);
    expect(r.httpStatus).toBe(422);
    expect(sent).toHaveLength(0);
  });
});

describe("enquiry service: reliability and truthful responses", () => {
  it("reports not-configured honestly when credentials are missing, and sends nothing", async () => {
    const { deps, sent } = makeDeps({ mail: null });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(503);
    expect(r.body).toEqual({ ok: false, status: "not-configured" });
    expect(sent).toHaveLength(0);
  });

  it("still validates before reporting not-configured", async () => {
    const { deps } = makeDeps({ mail: null });
    expect((await handleEnquiryRequest(makeRequest({ ...validRoom, adults: 0 }), deps)).httpStatus).toBe(422);
  });

  it("reports delivery-failed when the provider rejects the email, never 'sent'", async () => {
    const { mailer } = makeMailer({ ok: false, reason: "rejected", status: 403 });
    const { deps, logs } = makeDeps({ mail: { mailer, from: "enquiries@mail.nvr.test", to: "natureviewresort1@gmail.com" } });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(502);
    expect(r.body.status).toBe("delivery-failed");
    expect(r.body.reference).toBeDefined();
    expect(logs.some((l) => l.providerStatus === 403)).toBe(true);
  });

  it("reports delivery-failed for timeouts and network errors", async () => {
    for (const reason of ["timeout", "network"] as const) {
      const { mailer } = makeMailer({ ok: false, reason });
      const { deps } = makeDeps({ mail: { mailer, from: "enquiries@mail.nvr.test", to: "natureviewresort1@gmail.com" } });
      const r = await handleEnquiryRequest(makeRequest(validEvent), deps);
      expect(r.body.status).toBe("delivery-failed");
    }
  });

  it("turns an unexpected exception into a generic error without leaking details", async () => {
    const mailer = {
      async send() {
        throw new Error("SECRET_TOKEN_abc123 stack trace /var/app/secret.js");
      },
    };
    const { deps } = makeDeps({ mail: { mailer, from: "enquiries@mail.nvr.test", to: "natureviewresort1@gmail.com" } });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(502);
    const body = JSON.stringify(r.body);
    expect(body).not.toContain("SECRET_TOKEN");
    expect(body).not.toContain("stack");
    expect(body).not.toContain("/var/app");
  });

  it("does not log personal details", async () => {
    const { deps, logs } = makeDeps();
    await handleEnquiryRequest(makeRequest(validRoom), deps);
    await handleEnquiryRequest(makeRequest({ ...validRoom, adults: 0 }), deps);
    const logged = JSON.stringify(logs);
    for (const pii of ["Asha", "asha@example.com", "9876543210", "98765", "Ground floor"]) expect(logged).not.toContain(pii);
    expect(logs.length).toBeGreaterThan(0);
  });

  it("prevents duplicate sends for the same submissionId, including simultaneous ones", async () => {
    const { deps, sent } = makeDeps();
    const body = { ...validRoom, submissionId: "form-abc-12345678" };
    const [a, b] = await Promise.all([
      handleEnquiryRequest(makeRequest(body), deps),
      handleEnquiryRequest(makeRequest(body), deps),
    ]);
    const c = await handleEnquiryRequest(makeRequest(body), deps);
    expect(sent).toHaveLength(1);
    expect(a.body.reference).toBe(b.body.reference);
    expect(c.body.reference).toBe(a.body.reference);
  });

  it("lets the same form retry after a failed send", async () => {
    let calls = 0;
    const mailer = {
      async send() {
        calls++;
        return calls === 1 ? ({ ok: false, reason: "network" } as const) : ({ ok: true } as const);
      },
    };
    const { deps } = makeDeps({ mail: { mailer, from: "enquiries@mail.nvr.test", to: "natureviewresort1@gmail.com" } });
    const body = { ...validRoom, submissionId: "form-retry-12345678" };
    expect((await handleEnquiryRequest(makeRequest(body), deps)).body.status).toBe("delivery-failed");
    expect((await handleEnquiryRequest(makeRequest(body), deps)).body.status).toBe("sent");
    expect(calls).toBe(2);
  });
});
