/**
 * Browser-side helper that posts an enquiry to /api/enquiries and maps the response to a small set of outcomes.
 * It never sees credentials; the server decides whether email can be sent.
 */

export type EnquiryKind = "room" | "event";

export type SubmitOutcome =
  | { status: "sent"; reference?: string; saved: boolean }
  | { status: "saved"; reference?: string }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "rate-limited"; retryAfterSeconds?: number }
  | { status: "not-configured" }
  | { status: "delivery-failed"; reference?: string }
  | { status: "network-error" };

type ApiBody = {
  status?: string;
  reference?: unknown;
  saved?: unknown;
  errors?: unknown;
  retryAfterSeconds?: unknown;
};

export async function submitEnquiry(
  kind: EnquiryKind,
  values: object,
  extras: { submissionId: string; honeypot: string },
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitOutcome> {
  let res: Response;
  try {
    res = await fetchImpl("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, kind, submissionId: extras.submissionId, website: extras.honeypot }),
    });
  } catch {
    return { status: "network-error" };
  }

  let body: ApiBody = {};
  try {
    body = (await res.json()) as ApiBody;
  } catch {
    // Non-JSON responses (for example a proxy error page) are treated as a failure below.
  }
  const reference = typeof body.reference === "string" ? body.reference : undefined;

  if (res.ok && body.status === "saved") return { status: "saved", reference };
  if (res.ok && (body.status === "sent" || body.status === "received"))
    return { status: "sent", reference, saved: body.saved === true };
  if (res.status === 422 && body.errors && typeof body.errors === "object")
    return { status: "invalid", errors: body.errors as Record<string, string> };
  if (res.status === 429)
    return {
      status: "rate-limited",
      retryAfterSeconds: typeof body.retryAfterSeconds === "number" ? body.retryAfterSeconds : undefined,
    };
  if (res.status === 503 && body.status === "not-configured") return { status: "not-configured" };
  if (res.status === 502 || res.status === 500) return { status: "delivery-failed", reference };
  return { status: "network-error" };
}
