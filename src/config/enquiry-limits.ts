/**
 * Enquiry limits in ONE place.
 *
 * These are technical sanity limits that catch typos and abuse. They are NOT resort policy: the resort has not
 * confirmed occupancy per room, a minimum stay or a booking window, so none of those are enforced here.
 * Management can change any value without touching code by setting the environment variable shown next to it
 * (then rebuild/redeploy: NEXT_PUBLIC_ values are baked into the build so the browser form matches the server).
 * Invalid or out-of-range values are ignored and the default is used.
 */

function int(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

// NOTE: each NEXT_PUBLIC_ variable must be referenced literally so Next.js can inline it into the browser bundle.
export const LIMITS = {
  /** NEXT_PUBLIC_ENQUIRY_MAX_ADULTS */
  maxAdults: int(process.env.NEXT_PUBLIC_ENQUIRY_MAX_ADULTS, 20, 1, 200),
  /** NEXT_PUBLIC_ENQUIRY_MAX_CHILDREN */
  maxChildren: int(process.env.NEXT_PUBLIC_ENQUIRY_MAX_CHILDREN, 20, 0, 200),
  /** NEXT_PUBLIC_ENQUIRY_MAX_TOTAL_GUESTS (adults + children) */
  maxTotalGuests: int(process.env.NEXT_PUBLIC_ENQUIRY_MAX_TOTAL_GUESTS, 30, 1, 400),
  /** NEXT_PUBLIC_ENQUIRY_MAX_NIGHTS */
  maxNights: int(process.env.NEXT_PUBLIC_ENQUIRY_MAX_NIGHTS, 90, 1, 365),
  /** NEXT_PUBLIC_ENQUIRY_MAX_DAYS_AHEAD (how far ahead a check-in may be) */
  maxDaysAhead: int(process.env.NEXT_PUBLIC_ENQUIRY_MAX_DAYS_AHEAD, 730, 30, 1825),
  /** NEXT_PUBLIC_ENQUIRY_MAX_EVENT_GUESTS */
  maxEventGuests: int(process.env.NEXT_PUBLIC_ENQUIRY_MAX_EVENT_GUESTS, 5000, 1, 100000),
} as const;

/** Free-text limit (characters) for special requests / event requirements. Fixed to keep requests small. */
export const MAX_FREE_TEXT = 1500;

/**
 * Server-side abuse controls (not public). ENQUIRY_RATE_LIMIT_MAX requests per ENQUIRY_RATE_LIMIT_WINDOW_MINUTES
 * minutes per client IP; ENQUIRY_DUPLICATE_WINDOW_MINUTES is how long an identical enquiry is treated as a duplicate.
 */
export function readServerLimits(env: Record<string, string | undefined> = process.env) {
  return {
    rateLimitMax: int(env.ENQUIRY_RATE_LIMIT_MAX, 6, 1, 1000),
    rateLimitWindowMinutes: int(env.ENQUIRY_RATE_LIMIT_WINDOW_MINUTES, 10, 1, 1440),
    duplicateWindowMinutes: int(env.ENQUIRY_DUPLICATE_WINDOW_MINUTES, 30, 1, 1440),
  };
}

export const parseLimit = int;
