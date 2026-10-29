import { randomInt } from "node:crypto";
import { todayInIndia } from "./contact-validation";
import { buildEnquiryEmail, type EnquiryPayload } from "./email-templates";
import { validateEventEnquiry } from "./enquiries";
import { fingerprintOf, type EnquiryStore, type StoredEnquiry } from "./enquiry-store";
import type { MailerConfig } from "./mailer";
import type { RateLimiter } from "./rate-limit";
import { validateRoomEnquiry } from "./room-enquiry";

/**
 * Server-side enquiry pipeline for room and event enquiries.
 *
 * Order of work: abuse checks -> validation -> (duplicate lookup) -> save to Postgres (if configured)
 * -> email the resort (if configured) -> record the email result. Everything that touches the outside world
 * (mailer, store, clock, rate limiter) is injected so it can be tested with mocks.
 *
 * What we tell the guest is always literally true:
 *   sent  = the email provider accepted the notification (`saved` says whether a database copy also exists)
 *   saved = stored in the database, but the notification email did NOT go out
 * Neither ever means a booking is confirmed.
 */

export const MAX_BODY_BYTES = 16 * 1024;

export type ApiStatus =
  | "sent"
  | "saved"
  | "received"
  | "invalid"
  | "invalid-request"
  | "forbidden"
  | "too-large"
  | "unsupported"
  | "rate-limited"
  | "not-configured"
  | "delivery-failed"
  | "method-not-allowed";

export type ApiBody = {
  ok: boolean;
  status: ApiStatus;
  /** Present only once a real send or save was attempted. */
  reference?: string;
  /** True only if the enquiry really is in the database. */
  saved?: boolean;
  errors?: Record<string, string>;
  retryAfterSeconds?: number;
};

export type LogEvent = {
  event: "enquiry";
  kind?: "room" | "event";
  outcome: ApiStatus;
  reference?: string;
  storage?: "saved" | "off" | "error" | "duplicate";
  providerStatus?: number;
  providerReason?: string;
};

export type ApiResult = { httpStatus: number; body: ApiBody; headers?: Record<string, string> };

export type EnquiryDeps = {
  /** null means email is not configured. */
  mail: MailerConfig | null;
  /** null means persistent storage is not configured (no DATABASE_URL). */
  store: EnquiryStore | null;
  rateLimiter: RateLimiter;
  /** In-process guard against simultaneous double submits (the database is the durable guard). */
  dedupe: Map<string, Promise<ApiResult>>;
  /** How long an identical enquiry counts as a duplicate when a database is configured. */
  duplicateWindowMinutes?: number;
  now?: () => Date;
  makeReference?: (now: Date) => string;
  /** Receives non-personal outcome events only. */
  log?: (e: LogEvent) => void;
};

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L lookalikes

export function makeReference(now: Date): string {
  const ymd = todayInIndia(now).replace(/-/g, "").slice(2);
  let tail = "";
  for (let i = 0; i < 5; i++) tail += ALPHABET[randomInt(ALPHABET.length)];
  return `NVR-${ymd}-${tail}`;
}

const SUBMISSION_ID = /^[A-Za-z0-9-]{8,64}$/;

function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || headers.get("x-real-ip")?.trim() || "unknown";
}

function sameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const json = (httpStatus: number, body: ApiBody, headers?: Record<string, string>): ApiResult => ({
  httpStatus,
  body,
  headers,
});

/** Saves (if possible) and emails (if possible). Never throws. */
async function deliver(
  payload: EnquiryPayload,
  submissionId: string | null,
  deps: EnquiryDeps,
  now: Date,
  log: (e: LogEvent) => void,
): Promise<ApiResult> {
  const { store, mail } = deps;
  const kind = payload.kind;
  const newRef = deps.makeReference ?? makeReference;
  let reference = "";
  let saved = false;
  let storage: LogEvent["storage"] = store ? "error" : "off";
  let storeUsable = !!store;
  let existing: StoredEnquiry | null = null;

  const sentFor = (ref: string, savedFlag: boolean) => json(200, { ok: true, status: "sent", reference: ref, saved: savedFlag });

  if (store) {
    const fp = fingerprintOf(payload);
    try {
      if (submissionId) existing = await store.findBySubmissionId(submissionId);
      if (!existing) existing = await store.findRecentByFingerprint(fp, deps.duplicateWindowMinutes ?? 30);
    } catch {
      storeUsable = false;
    }

    if (existing) {
      // Same form sent again, or an identical enquiry moments ago: never create a second record.
      storage = "duplicate";
      log({ event: "enquiry", kind, outcome: existing.emailStatus === "sent" ? "sent" : "saved", reference: existing.reference, storage });
      if (existing.emailStatus === "sent") return sentFor(existing.reference, true);
      reference = existing.reference;
      saved = true;
    } else if (storeUsable) {
      for (let attempt = 0; attempt < 3 && !saved; attempt++) {
        const candidate = newRef(now);
        const r = await store.insert({ reference: candidate, submissionId, fingerprint: fp, payload });
        if (r.ok) {
          reference = candidate;
          saved = true;
          storage = "saved";
        } else if (r.reason === "error") {
          storeUsable = false;
          break;
        } else if (submissionId) {
          // Conflict: either the reference collided (try another) or a parallel request already saved this form.
          const raced = await store.findBySubmissionId(submissionId).catch(() => null);
          if (raced) {
            reference = raced.reference;
            saved = true;
            storage = "duplicate";
            if (raced.emailStatus === "sent") return sentFor(raced.reference, true);
          }
        }
      }
    }
  }
  if (!reference) reference = newRef(now);

  if (!mail) {
    if (saved && store) {
      await store.markEmail(reference, { status: "not-configured" });
      log({ event: "enquiry", kind, outcome: "saved", reference, storage });
      return json(200, { ok: true, status: "saved", reference, saved: true });
    }
    log({ event: "enquiry", kind, outcome: "delivery-failed", reference, storage });
    return json(502, { ok: false, status: "delivery-failed", reference, saved: false });
  }

  const email = buildEnquiryEmail(payload, reference, now);
  const result = await mail.mailer.send({
    from: mail.from,
    to: mail.to,
    replyTo: payload.value.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (result.ok) {
    if (saved && store) await store.markEmail(reference, { status: "sent", providerId: result.id });
    return sentFor(reference, saved);
  }

  const failure = `${result.reason}${result.status ? `:${result.status}` : ""}`;
  if (saved && store) await store.markEmail(reference, { status: "failed", failure });
  log({
    event: "enquiry",
    kind,
    outcome: saved ? "saved" : "delivery-failed",
    reference,
    storage,
    providerStatus: result.status,
    providerReason: result.reason,
  });
  return saved
    ? json(200, { ok: true, status: "saved", reference, saved: true })
    : json(502, { ok: false, status: "delivery-failed", reference, saved: false });
}

/** Turns a Request into an ApiResult. Never throws; unexpected errors become a generic delivery-failed response. */
export async function handleEnquiryRequest(request: Request, deps: EnquiryDeps): Promise<ApiResult> {
  const log = deps.log ?? (() => {});
  const now = (deps.now ?? (() => new Date()))();
  const finish = (r: ApiResult, kind?: "room" | "event") => {
    log({ event: "enquiry", kind, outcome: r.body.status, reference: r.body.reference });
    return r;
  };

  try {
    if (request.method !== "POST") return finish(json(405, { ok: false, status: "method-not-allowed" }, { Allow: "POST" }));

    if (!sameOrigin(request.headers)) return finish(json(403, { ok: false, status: "forbidden" }));

    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json"))
      return finish(json(415, { ok: false, status: "unsupported" }));

    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) return finish(json(413, { ok: false, status: "too-large" }));

    const limit = deps.rateLimiter.hit(clientKey(request.headers), now.getTime());
    if (!limit.allowed)
      return finish(
        json(
          429,
          { ok: false, status: "rate-limited", retryAfterSeconds: limit.retryAfterSeconds },
          { "Retry-After": String(limit.retryAfterSeconds) },
        ),
      );

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return finish(json(413, { ok: false, status: "too-large" }));

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return finish(json(400, { ok: false, status: "invalid-request" }));
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw))
      return finish(json(400, { ok: false, status: "invalid-request" }));
    const input = raw as Record<string, unknown>;

    // Honeypot: real visitors never fill the hidden field. Pretend success, store and send nothing.
    if (typeof input.website === "string" && input.website.trim() !== "")
      return finish(json(200, { ok: true, status: "received" }));

    const kind = input.kind;
    if (kind !== "room" && kind !== "event") return finish(json(400, { ok: false, status: "invalid-request" }));

    const today = todayInIndia(now);
    let payload: EnquiryPayload;
    if (kind === "room") {
      const r = validateRoomEnquiry(input, today);
      if (!r.ok) return finish(json(422, { ok: false, status: "invalid", errors: r.errors as Record<string, string> }), kind);
      payload = { kind, value: r.value };
    } else {
      const r = validateEventEnquiry(input, today);
      if (!r.ok) return finish(json(422, { ok: false, status: "invalid", errors: r.errors as Record<string, string> }), kind);
      payload = { kind, value: r.value };
    }

    // Neither email nor storage is set up: say so plainly, nothing is sent or saved.
    if (!deps.mail && !deps.store) return finish(json(503, { ok: false, status: "not-configured" }), kind);

    const submissionId =
      typeof input.submissionId === "string" && SUBMISSION_ID.test(input.submissionId) ? input.submissionId : null;

    if (!submissionId) return finish(await deliver(payload, null, deps, now, log), kind);

    const inflight = deps.dedupe.get(submissionId);
    if (inflight) return finish(await inflight, kind);

    const pending = deliver(payload, submissionId, deps, now, log);
    deps.dedupe.set(submissionId, pending);
    const done = await pending;
    // Remember only successes in memory so a failed attempt can be retried from the same form.
    if (done.body.status !== "sent") deps.dedupe.delete(submissionId);
    else if (deps.dedupe.size > 500) deps.dedupe.delete(deps.dedupe.keys().next().value as string);
    return finish(done, kind);
  } catch {
    return finish(json(502, { ok: false, status: "delivery-failed" }));
  }
}
