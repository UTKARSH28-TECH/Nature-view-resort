/**
 * Email delivery through Resend's HTTP API (no SDK dependency).
 * Credentials come only from server-side environment variables and are never imported by client code.
 */

export type OutgoingEmail = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "rejected" | "network" | "timeout"; status?: number };

export type Mailer = { send(email: OutgoingEmail): Promise<SendResult> };

export type MailerConfig = { mailer: Mailer; from: string; to: string };

const RESEND_URL = "https://api.resend.com/emails";
// "name@domain.tld" or "Display Name <name@domain.tld>"; no CR/LF or other header-breaking characters.
const ADDRESS = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]{2,}$/;
const NAMED = /^[A-Za-z0-9 ._-]{1,60} <[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]{2,}>$/;

export const isValidAddress = (v: string) => ADDRESS.test(v);
export const isValidSender = (v: string) => ADDRESS.test(v) || NAMED.test(v);

export function createResendMailer(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 10_000,
  endpoint: string = RESEND_URL,
): Mailer {
  return {
    async send(email) {
      let res: Response;
      try {
        res = await fetchImpl(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: email.from,
            to: [email.to],
            reply_to: email.replyTo,
            subject: email.subject,
            text: email.text,
            html: email.html,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (err) {
        const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
        return { ok: false, reason: timedOut ? "timeout" : "network" };
      }

      if (!res.ok) return { ok: false, reason: "rejected", status: res.status };
      let id: string | undefined;
      try {
        const body = (await res.json()) as { id?: unknown };
        if (typeof body.id === "string") id = body.id;
      } catch {
        // A 2xx without a JSON body still means the provider accepted the message.
      }
      return { ok: true, id };
    },
  };
}

/**
 * Builds the mailer from environment variables, or returns null when email is not configured.
 * RESEND_API_KEY and ENQUIRY_FROM_EMAIL are both required: there is deliberately no default sender,
 * because the sender must be an address or domain verified with the provider.
 */
export function getMailerConfig(
  env: Record<string, string | undefined> = process.env,
  fetchImpl: typeof fetch = fetch,
): MailerConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.ENQUIRY_FROM_EMAIL?.trim();
  if (!apiKey || !from || !isValidSender(from)) return null;

  const to = env.ENQUIRY_TO_EMAIL?.trim() || "natureviewresort1@gmail.com";
  if (!isValidAddress(to)) return null;

  // RESEND_API_URL exists only so the flow can be exercised against a local mock server (see docs/ENQUIRIES.md).
  const override = env.RESEND_API_URL?.trim();
  let endpoint = RESEND_URL;
  if (override) {
    try {
      const u = new URL(override);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      endpoint = u.toString();
    } catch {
      return null;
    }
  }

  return { mailer: createResendMailer(apiKey, fetchImpl, 10_000, endpoint), from, to };
}
