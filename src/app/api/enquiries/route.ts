import { readServerLimits } from "@/config/enquiry-limits";
import { getStoreFromEnv } from "@/lib/db";
import { handleEnquiryRequest, type ApiResult, type LogEvent } from "@/lib/enquiry-service";
import { getMailerConfig } from "@/lib/mailer";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-process state. The rate limiter is in memory (see docs/ENQUIRIES.md); duplicates are also caught in the database.
const limits = readServerLimits();
const rateLimiter = createRateLimiter({ windowMs: limits.rateLimitWindowMinutes * 60 * 1000, max: limits.rateLimitMax });
const dedupe = new Map<string, Promise<ApiResult>>();

// Outcomes only: never names, phone numbers, emails or message text.
const log = (e: LogEvent) => console.info(JSON.stringify(e));

export async function POST(request: Request) {
  const result = await handleEnquiryRequest(request, {
    mail: getMailerConfig(),
    store: getStoreFromEnv(),
    rateLimiter,
    dedupe,
    duplicateWindowMinutes: limits.duplicateWindowMinutes,
    log,
  });
  return new Response(JSON.stringify(result.body), {
    status: result.httpStatus,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...result.headers },
  });
}

export function GET() {
  return new Response(JSON.stringify({ ok: false, status: "method-not-allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST", "Cache-Control": "no-store" },
  });
}
