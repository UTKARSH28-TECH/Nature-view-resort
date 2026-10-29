/**
 * Validation helpers shared by the room and event enquiry validators and run on the server.
 * Pure functions: no browser or Node-only APIs.
 */

const EMAIL = /^[^\s@<>,;"'()[\]\\]+@[^\s@<>,;"'()[\]\\]+\.[^\s@<>,;"'()[\]\\]{2,}$/;
// Control characters (including CR/LF) have no place in names or free text fields we put in email.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export const MAX_NAME = 80;
export const MAX_EMAIL = 120;

/** Reads a string-like value from untyped input, trimmed. Numbers are accepted, everything else becomes "". */
export function readString(input: Record<string, unknown>, key: string): string {
  const v = input[key];
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

export function readBoolean(input: Record<string, unknown>, key: string): boolean {
  const v = input[key];
  return v === true || v === "on" || v === "true";
}

export function normalisePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

type Checked<T> = { value: T; error?: undefined } | { value?: undefined; error: string };

export function checkName(raw: string): Checked<string> {
  const name = raw.replace(/\s+/g, " ").trim();
  if (!name) return { error: "Please enter your name." };
  if (name.length < 2 || name.length > MAX_NAME) return { error: `Name should be between 2 and ${MAX_NAME} characters.` };
  if (CONTROL_CHARS.test(name)) return { error: "Name contains characters that are not allowed." };
  return { value: name };
}

export function checkPhone(raw: string): Checked<string> {
  if (!raw) return { error: "Please enter a phone number." };
  const phone = normalisePhone(raw);
  if (!/^[6-9]\d{9}$/.test(phone)) return { error: "Enter a 10-digit Indian mobile number, for example 98765 43210." };
  return { value: phone };
}

export function checkEmail(raw: string): Checked<string> {
  if (!raw) return { error: "Please enter your email address." };
  if (raw.length > MAX_EMAIL || !EMAIL.test(raw)) return { error: "Enter a valid email address, for example name@example.com." };
  return { value: raw };
}

export function checkFreeText(raw: string, max: number): string | undefined {
  if (CONTROL_CHARS.test(raw)) return "This field contains characters that are not allowed.";
  if (raw.length > max) return `Please keep this under ${max} characters (currently ${raw.length}).`;
  return undefined;
}

// ---- dates (all YYYY-MM-DD strings, compared lexicographically) ----

export function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function nightsBetween(from: string, to: string): number {
  const f = Date.parse(`${from}T00:00:00Z`);
  const t = Date.parse(`${to}T00:00:00Z`);
  return Math.round((t - f) / 86_400_000);
}

/** Today in the resort's time zone (India), as YYYY-MM-DD. Passed into validators to keep them pure. */
export function todayInIndia(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
