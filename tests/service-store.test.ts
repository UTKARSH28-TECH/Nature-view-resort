import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { handleEnquiryRequest, type ApiResult } from "@/lib/enquiry-service";
import { createEnquiryStore } from "@/lib/enquiry-store";
import { brokenDb, createTestDb } from "./db-helpers";
import { makeDeps, makeMailer, makeRequest, validEvent, validRoom } from "./helpers";

type TestDb = Awaited<ReturnType<typeof createTestDb>>;
let t: TestDb;
const FROM = "enquiries@mail.nvr.test";
const TO = "natureviewresort1@gmail.com";

beforeAll(async () => {
  t = await createTestDb();
});
afterAll(async () => {
  await t.pg.close();
});
beforeEach(async () => {
  await t.reset();
});

const withStore = (mailer = makeMailer()) => {
  const base = makeDeps({
    store: createEnquiryStore(t.db),
    mail: { mailer: mailer.mailer, from: FROM, to: TO },
  });
  return { ...base, sent: mailer.sent };
};

describe("enquiry saved to Postgres and emailed", () => {
  it("saves the room enquiry, emails the resort, and records the email result", async () => {
    const { deps, sent } = withStore(makeMailer({ ok: true, id: "email_abc" }));
    const r = await handleEnquiryRequest(makeRequest({ ...validRoom, submissionId: "form-0001-abcdef" }), deps);

    expect(r.body).toEqual({ ok: true, status: "sent", reference: "NVR-261029-TEST1", saved: true });
    expect(sent).toHaveLength(1);
    const rows = await t.rows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      reference: "NVR-261029-TEST1",
      submission_id: "form-0001-abcdef",
      kind: "room",
      status: "new",
      guest_name: "Asha Verma",
      email_status: "sent",
      email_provider_id: "email_abc",
    });
  });

  it("saves and emails an event enquiry", async () => {
    const { deps, sent } = withStore();
    const r = await handleEnquiryRequest(makeRequest(validEvent), deps);
    expect(r.body.status).toBe("sent");
    expect(r.body.saved).toBe(true);
    expect(sent).toHaveLength(1);
    expect((await t.rows())[0]).toMatchObject({ kind: "event", guest_name: "Ravi Kumar", email_status: "sent" });
  });

  it("keeps the enquiry and says so honestly when the email fails", async () => {
    const { deps } = withStore(makeMailer({ ok: false, reason: "rejected", status: 403 }));
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(200);
    expect(r.body).toEqual({ ok: true, status: "saved", reference: "NVR-261029-TEST1", saved: true });
    expect((await t.rows())[0]).toMatchObject({ email_status: "failed", email_failure: "rejected:403" });
  });

  it("saves but reports 'saved', never 'sent', when email is not configured", async () => {
    const { deps, sent } = makeDeps({ store: createEnquiryStore(t.db), mail: null });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.body.status).toBe("saved");
    expect(r.body.saved).toBe(true);
    expect(sent).toHaveLength(0);
    expect((await t.rows())[0]).toMatchObject({ email_status: "not-configured" });
  });

  it("does not claim the enquiry is saved when the database is down but the email goes out", async () => {
    const { deps, sent, logs } = makeDeps({ store: createEnquiryStore(brokenDb) });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(200);
    expect(r.body.status).toBe("sent");
    expect(r.body.saved).toBe(false);
    expect(sent).toHaveLength(1);
    expect(JSON.stringify(logs)).not.toContain("connection refused");
  });

  it("reports failure when both the database and the email fail", async () => {
    const mailer = makeMailer({ ok: false, reason: "network" });
    const { deps } = makeDeps({ store: createEnquiryStore(brokenDb), mail: { mailer: mailer.mailer, from: FROM, to: TO } });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(502);
    expect(r.body.status).toBe("delivery-failed");
    expect(r.body.saved).toBe(false);
  });

  it("reports failure when the database is down and email is not configured", async () => {
    const { deps } = makeDeps({ store: createEnquiryStore(brokenDb), mail: null });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(502);
    expect(r.body.saved).toBe(false);
  });

  it("says 'not-configured' only when neither storage nor email is set up", async () => {
    const { deps } = makeDeps({ store: null, mail: null });
    const r = await handleEnquiryRequest(makeRequest(validRoom), deps);
    expect(r.httpStatus).toBe(503);
    expect(r.body).toEqual({ ok: false, status: "not-configured" });
  });
});

describe("duplicates and spam with storage", () => {
  it("never creates a second record or email for the same form, even across server instances", async () => {
    const a = withStore();
    const b = withStore(); // a second instance: separate in-memory state, same database
    const body = { ...validRoom, submissionId: "form-dupe-123456" };
    const r1 = await handleEnquiryRequest(makeRequest(body), a.deps);
    const r2 = await handleEnquiryRequest(makeRequest(body), b.deps);
    expect(r2.body).toEqual({ ok: true, status: "sent", reference: r1.body.reference, saved: true });
    expect(a.sent).toHaveLength(1);
    expect(b.sent).toHaveLength(0);
    expect(await t.rows()).toHaveLength(1);
  });

  it("handles simultaneous double submits with one record and one email", async () => {
    const { deps, sent } = withStore();
    const body = { ...validRoom, submissionId: "form-race-1234567" };
    const [x, y] = await Promise.all([handleEnquiryRequest(makeRequest(body), deps), handleEnquiryRequest(makeRequest(body), deps)]);
    expect(x.body.reference).toBe(y.body.reference);
    expect(sent).toHaveLength(1);
    expect(await t.rows()).toHaveLength(1);
  });

  it("retries the email for a saved enquiry using the same record", async () => {
    let calls = 0;
    const mailer = {
      async send() {
        calls++;
        return calls === 1 ? ({ ok: false, reason: "timeout" } as const) : ({ ok: true, id: "email_ok" } as const);
      },
    };
    const { deps } = makeDeps({ store: createEnquiryStore(t.db), mail: { mailer, from: FROM, to: TO } });
    const body = { ...validRoom, submissionId: "form-retry-654321" };
    const first = await handleEnquiryRequest(makeRequest(body), deps);
    expect(first.body.status).toBe("saved");
    const second = await handleEnquiryRequest(makeRequest(body), deps);
    expect(second.body).toEqual({ ok: true, status: "sent", reference: first.body.reference, saved: true });
    const rows = await t.rows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email_status: "sent", email_provider_id: "email_ok" });
    expect(calls).toBe(2);
  });

  it("treats an identical enquiry from a new form within the window as a duplicate", async () => {
    const { deps, sent } = withStore();
    const r1 = await handleEnquiryRequest(makeRequest({ ...validRoom, submissionId: "form-one-1234567" }), deps);
    const r2 = await handleEnquiryRequest(makeRequest({ ...validRoom, submissionId: "form-two-1234567" }), deps);
    expect(r2.body.reference).toBe(r1.body.reference);
    expect(sent).toHaveLength(1);
    expect(await t.rows()).toHaveLength(1);
  });

  it("accepts the same enquiry again once the duplicate window has passed", async () => {
    const { deps, sent } = withStore();
    await handleEnquiryRequest(makeRequest({ ...validRoom, submissionId: "form-old-1234567" }), deps);
    await t.pg.exec("UPDATE enquiries SET created_at = now() - interval '3 hours'");
    const r = await handleEnquiryRequest(makeRequest({ ...validRoom, submissionId: "form-new-1234567" }), deps);
    expect(r.body.reference).toBe("NVR-261029-TEST2");
    expect(sent).toHaveLength(2);
    expect(await t.rows()).toHaveLength(2);
  });

  it("does not treat different guests or dates as duplicates", async () => {
    const { deps, sent } = withStore();
    await handleEnquiryRequest(makeRequest(validRoom), deps);
    await handleEnquiryRequest(makeRequest({ ...validRoom, checkOut: "2026-12-14" }), deps);
    await handleEnquiryRequest(makeRequest({ ...validRoom, email: "someone.else@example.com" }), deps);
    expect(sent).toHaveLength(3);
    expect(await t.rows()).toHaveLength(3);
  });

  it("picks a new reference if one is already taken", async () => {
    let n = 0;
    const refs = ["NVR-261029-SAMEA", "NVR-261029-SAMEA", "NVR-261029-OTHER"];
    const { deps } = makeDeps({ store: createEnquiryStore(t.db), makeReference: () => refs[Math.min(n++, 2)] });
    const r1 = await handleEnquiryRequest(makeRequest(validRoom), deps);
    const r2 = await handleEnquiryRequest(makeRequest({ ...validRoom, name: "Another Guest", email: "other@example.com" }), deps);
    expect(r1.body.reference).toBe("NVR-261029-SAMEA");
    expect(r2.body.reference).toBe("NVR-261029-OTHER");
    expect(await t.rows()).toHaveLength(2);
  });

  it("writes nothing to the database for honeypot, invalid, unknown-room or cross-origin requests", async () => {
    const { deps, sent } = withStore();
    const results: ApiResult[] = [
      await handleEnquiryRequest(makeRequest({ ...validRoom, website: "spam" }), deps),
      await handleEnquiryRequest(makeRequest({ ...validRoom, adults: 0 }), deps),
      await handleEnquiryRequest(makeRequest({ ...validRoom, room: "penthouse" }), deps),
      await handleEnquiryRequest(makeRequest({ ...validRoom, checkOut: "2026-12-09" }), deps),
      await handleEnquiryRequest(makeRequest({ ...validEvent, eventDate: "2020-01-01" }), deps),
      await handleEnquiryRequest(makeRequest(validRoom, { headers: { origin: "https://evil.example" } }), deps),
    ];
    expect(results.map((r) => r.httpStatus)).toEqual([200, 422, 422, 422, 422, 403]);
    expect(await t.rows()).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("keeps personal details out of the logs while saving", async () => {
    const { deps, logs } = withStore();
    await handleEnquiryRequest(makeRequest(validRoom), deps);
    const logged = JSON.stringify(logs);
    for (const pii of ["Asha", "asha@example.com", "9876543210", "Ground floor"]) expect(logged).not.toContain(pii);
  });
});
