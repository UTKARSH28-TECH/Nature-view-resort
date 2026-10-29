import { describe, expect, it, vi } from "vitest";
import { createResendMailer, getMailerConfig } from "@/lib/mailer";
import { createRateLimiter } from "@/lib/rate-limit";

const email = {
  from: "Nature View <enquiries@mail.nvr.test>",
  to: "natureviewresort1@gmail.com",
  replyTo: "guest@example.com",
  subject: "[NVR-1] Test",
  text: "hello",
  html: "<p>hello</p>",
};

describe("Resend mailer (mock fetch, no real emails)", () => {
  it("posts the expected request with a bearer token", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "abc" }), { status: 200 }));
    const r = await createResendMailer("re_test_key", fetchMock as unknown as typeof fetch).send(email);

    expect(r).toEqual({ ok: true, id: "abc" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ from: email.from, to: [email.to], reply_to: "guest@example.com", subject: email.subject });
    expect(body.text).toBe("hello");
  });

  it("treats a 2xx without JSON as accepted", async () => {
    const r = await createResendMailer("k", (async () => new Response("ok", { status: 202 })) as unknown as typeof fetch).send(email);
    expect(r.ok).toBe(true);
  });

  it("reports provider rejection with the HTTP status only", async () => {
    for (const status of [401, 403, 422, 429, 500]) {
      const r = await createResendMailer("k", (async () => new Response('{"message":"bad key re_secret"}', { status })) as unknown as typeof fetch).send(email);
      expect(r).toEqual({ ok: false, reason: "rejected", status });
      expect(JSON.stringify(r)).not.toContain("re_secret");
    }
  });

  it("reports network failures and timeouts", async () => {
    const net = await createResendMailer("k", (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch).send(email);
    expect(net).toEqual({ ok: false, reason: "network" });

    const timeout = await createResendMailer("k", (async () => {
      throw new DOMException("timed out", "TimeoutError");
    }) as unknown as typeof fetch).send(email);
    expect(timeout).toEqual({ ok: false, reason: "timeout" });
  });
});

describe("mailer configuration from environment", () => {
  const good = { RESEND_API_KEY: "re_test", ENQUIRY_FROM_EMAIL: "Nature View <enquiries@mail.nvr.test>" };

  it("returns null when credentials are missing (nothing is sent)", () => {
    expect(getMailerConfig({})).toBeNull();
    expect(getMailerConfig({ RESEND_API_KEY: "re_test" })).toBeNull(); // no sender: there is no default sender
    expect(getMailerConfig({ ENQUIRY_FROM_EMAIL: good.ENQUIRY_FROM_EMAIL })).toBeNull();
    expect(getMailerConfig({ RESEND_API_KEY: "  ", ENQUIRY_FROM_EMAIL: good.ENQUIRY_FROM_EMAIL })).toBeNull();
  });

  it("rejects a malformed or header-injecting sender", () => {
    expect(getMailerConfig({ ...good, ENQUIRY_FROM_EMAIL: "not an address" })).toBeNull();
    expect(getMailerConfig({ ...good, ENQUIRY_FROM_EMAIL: "a@b.com\r\nBcc: x@y.com" })).toBeNull();
    expect(getMailerConfig({ ...good, ENQUIRY_FROM_EMAIL: "x@y.com, z@y.com" })).toBeNull();
  });

  it("defaults the recipient to the resort's confirmed email and validates overrides", () => {
    expect(getMailerConfig(good)?.to).toBe("natureviewresort1@gmail.com");
    expect(getMailerConfig({ ...good, ENQUIRY_TO_EMAIL: "frontdesk@example.com" })?.to).toBe("frontdesk@example.com");
    expect(getMailerConfig({ ...good, ENQUIRY_TO_EMAIL: "bad\nvalue" })).toBeNull();
  });

  it("accepts only an http(s) test endpoint override", () => {
    expect(getMailerConfig({ ...good, RESEND_API_URL: "http://127.0.0.1:4010/emails" })).not.toBeNull();
    expect(getMailerConfig({ ...good, RESEND_API_URL: "file:///etc/passwd" })).toBeNull();
    expect(getMailerConfig({ ...good, RESEND_API_URL: "not a url" })).toBeNull();
  });

  it("builds a config when everything is present", () => {
    const c = getMailerConfig(good);
    expect(c?.from).toBe(good.ENQUIRY_FROM_EMAIL);
    expect(typeof c?.mailer.send).toBe("function");
  });
});

describe("rate limiter", () => {
  it("blocks after the limit and recovers when the window passes", () => {
    const rl = createRateLimiter({ windowMs: 1000, max: 2 });
    expect(rl.hit("a", 0).allowed).toBe(true);
    expect(rl.hit("a", 100).allowed).toBe(true);
    const blocked = rl.hit("a", 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    expect(rl.hit("b", 200).allowed).toBe(true);
    expect(rl.hit("a", 1100).allowed).toBe(true);
  });
});
