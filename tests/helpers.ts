import { createRateLimiter } from "@/lib/rate-limit";
import type { ApiResult, EnquiryDeps, LogEvent } from "@/lib/enquiry-service";
import type { Mailer, OutgoingEmail, SendResult } from "@/lib/mailer";

export const NOW = new Date("2026-10-29T08:00:00Z"); // 29 Oct 2026, 13:30 IST
export const TODAY = "2026-10-29";
export const HOST = "nvr.test";

export const validRoom = {
  kind: "room",
  room: "deluxe-room-with-lake-view",
  checkIn: "2026-12-10",
  checkOut: "2026-12-12",
  adults: 2,
  children: 1,
  name: "Asha Verma",
  phone: "+91 98765 43210",
  email: "asha@example.com",
  requests: "Ground floor if possible.",
};

export const validEvent = {
  kind: "event",
  name: "Ravi Kumar",
  phone: "9876543210",
  email: "ravi@example.com",
  eventType: "wedding",
  eventDate: "2027-01-20",
  dateFlexible: false,
  guests: 150,
  space: "lawn",
  requirements: "Vegetarian catering.",
};

export function makeMailer(result: SendResult | (() => Promise<SendResult>) = { ok: true, id: "email_1" }) {
  const sent: OutgoingEmail[] = [];
  const mailer: Mailer = {
    async send(email) {
      sent.push(email);
      return typeof result === "function" ? result() : result;
    },
  };
  return { mailer, sent };
}

export function makeDeps(over: Partial<EnquiryDeps> = {}) {
  const { mailer, sent } = makeMailer();
  const logs: LogEvent[] = [];
  let n = 0;
  const deps: EnquiryDeps = {
    mail: { mailer, from: "Nature View <enquiries@mail.nvr.test>", to: "natureviewresort1@gmail.com" },
    store: null,
    rateLimiter: createRateLimiter({ windowMs: 600_000, max: 6 }),
    dedupe: new Map<string, Promise<ApiResult>>(),
    now: () => NOW,
    makeReference: () => `NVR-261029-TEST${++n}`,
    log: (e) => logs.push(e),
    ...over,
  };
  return { deps, sent, logs };
}

export function makeRequest(
  body: unknown,
  opts: { method?: string; headers?: Record<string, string>; raw?: string } = {},
): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    origin: `https://${HOST}`,
    host: HOST,
    "x-forwarded-for": "203.0.113.7",
    ...opts.headers,
  };
  for (const k of Object.keys(headers)) if (headers[k] === "") delete headers[k];
  return new Request(`https://${HOST}/api/enquiries`, {
    method: opts.method ?? "POST",
    headers,
    body: (opts.method ?? "POST") === "GET" ? undefined : (opts.raw ?? JSON.stringify(body)),
  });
}
