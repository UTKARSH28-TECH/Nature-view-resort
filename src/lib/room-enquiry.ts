import { LIMITS, MAX_FREE_TEXT } from "@/config/enquiry-limits";
import {
  addDays,
  checkEmail,
  checkFreeText,
  checkName,
  checkPhone,
  formatDisplayDate,
  isValidIsoDate,
  nightsBetween,
  readString,
} from "./contact-validation";
import { ROOM_LIST, type RoomSlug } from "./rooms";
import { SITE, whatsappWith } from "./site";

/**
 * Room booking enquiry: types, validation and message formatting.
 * Runs on the server for every submission (and in the browser for fast feedback).
 *
 * Limits come from src/config/enquiry-limits.ts. They are technical sanity limits to stop abuse and obvious typos,
 * NOT business rules: the resort has not confirmed occupancy limits, minimum stays or booking windows.
 */

export const MAX_ADULTS = LIMITS.maxAdults;
export const MAX_CHILDREN = LIMITS.maxChildren;
export const MAX_TOTAL_GUESTS = LIMITS.maxTotalGuests;
export const MAX_NIGHTS = LIMITS.maxNights;
export const MAX_DAYS_AHEAD = LIMITS.maxDaysAhead;
export const MAX_REQUESTS = MAX_FREE_TEXT;

export type RoomEnquiry = {
  /** A known room slug, or "" for "no preference". Unknown slugs are rejected, never mapped to a room. */
  room: RoomSlug | "";
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  name: string;
  phone: string;
  email: string;
  requests: string;
};

export type RoomEnquiryField =
  | "room"
  | "checkIn"
  | "checkOut"
  | "adults"
  | "children"
  | "name"
  | "phone"
  | "email"
  | "requests";

export type RoomEnquiryErrors = Partial<Record<RoomEnquiryField, string>>;

export const ROOM_FIELD_ORDER: RoomEnquiryField[] = [
  "room",
  "checkIn",
  "checkOut",
  "adults",
  "children",
  "name",
  "phone",
  "email",
  "requests",
];

export const isRoomSlug = (v: string): v is RoomSlug => ROOM_LIST.some((r) => r.slug === v);
export const roomName = (slug: string) => ROOM_LIST.find((r) => r.slug === slug)?.name ?? "";

/** Parses a ?room= value: a known slug or "" (never guesses). */
export const roomFromQuery = (v: string | undefined): RoomSlug | "" => (v && isRoomSlug(v) ? v : "");

function wholeNumber(raw: string): number {
  return /^\d{1,3}$/.test(raw) ? Number(raw) : Number.NaN;
}

export function validateRoomEnquiry(
  input: Record<string, unknown>,
  today: string,
): { ok: true; value: RoomEnquiry } | { ok: false; errors: RoomEnquiryErrors } {
  const errors: RoomEnquiryErrors = {};

  const room = readString(input, "room");
  if (room && !isRoomSlug(room)) errors.room = "Please choose one of the listed rooms, or “No preference”.";

  const checkIn = readString(input, "checkIn");
  const checkOut = readString(input, "checkOut");
  let nights = 0;

  if (!checkIn) errors.checkIn = "Please choose a check-in date.";
  else if (!isValidIsoDate(checkIn)) errors.checkIn = "Enter a valid check-in date.";
  else if (checkIn < today) errors.checkIn = "Check-in cannot be in the past.";
  else if (checkIn > addDays(today, MAX_DAYS_AHEAD))
    errors.checkIn = "That date is too far ahead for an online enquiry. Please call us.";

  if (!checkOut) errors.checkOut = "Please choose a check-out date.";
  else if (!isValidIsoDate(checkOut)) errors.checkOut = "Enter a valid check-out date.";
  else if (!errors.checkIn && checkIn) {
    nights = nightsBetween(checkIn, checkOut);
    if (nights < 1) errors.checkOut = "Check-out must be after check-in.";
    else if (nights > MAX_NIGHTS) errors.checkOut = `For stays longer than ${MAX_NIGHTS} nights, please call us.`;
  }

  const adults = wholeNumber(readString(input, "adults"));
  if (Number.isNaN(adults) || adults < 1 || adults > MAX_ADULTS)
    errors.adults = `Enter the number of adults, from 1 to ${MAX_ADULTS}.`;

  const childrenRaw = readString(input, "children");
  const children = childrenRaw === "" ? 0 : wholeNumber(childrenRaw);
  if (Number.isNaN(children) || children < 0 || children > MAX_CHILDREN)
    errors.children = `Enter the number of children, from 0 to ${MAX_CHILDREN}.`;

  if (!errors.adults && !errors.children && adults + children > MAX_TOTAL_GUESTS)
    errors.adults = `For groups larger than ${MAX_TOTAL_GUESTS} guests, please call us.`;

  const name = checkName(readString(input, "name"));
  if (name.error) errors.name = name.error;
  const phone = checkPhone(readString(input, "phone"));
  if (phone.error) errors.phone = phone.error;
  const email = checkEmail(readString(input, "email"));
  if (email.error) errors.email = email.error;

  const requests = readString(input, "requests");
  const reqError = checkFreeText(requests, MAX_REQUESTS);
  if (reqError) errors.requests = reqError;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      room: room as RoomSlug | "",
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      name: name.value as string,
      phone: phone.value as string,
      email: email.value as string,
      requests,
    },
  };
}

/** Plain-text summary for the WhatsApp/email fallback when automatic sending is unavailable. */
export function roomEnquiryToText(e: RoomEnquiry): string {
  return [
    `Room booking enquiry for ${SITE.name}`,
    "",
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    `Email: ${e.email}`,
    `Preferred room: ${e.room ? roomName(e.room) : "No preference"}`,
    `Check-in: ${formatDisplayDate(e.checkIn)}`,
    `Check-out: ${formatDisplayDate(e.checkOut)} (${e.nights} ${e.nights === 1 ? "night" : "nights"})`,
    `Guests: ${e.adults} ${e.adults === 1 ? "adult" : "adults"}, ${e.children} ${e.children === 1 ? "child" : "children"}`,
    `Special requests: ${e.requests || "None given"}`,
  ].join("\n");
}

export const roomEnquiryWhatsAppHref = (e: RoomEnquiry) => whatsappWith(roomEnquiryToText(e));

export const roomEnquiryMailtoHref = (e: RoomEnquiry) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent("Room booking enquiry")}&body=${encodeURIComponent(roomEnquiryToText(e))}`;
