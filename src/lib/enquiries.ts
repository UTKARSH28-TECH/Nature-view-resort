import { LIMITS, MAX_FREE_TEXT } from "@/config/enquiry-limits";
import {
  checkEmail,
  checkFreeText,
  checkName,
  checkPhone,
  formatDisplayDate,
  isValidIsoDate,
  normalisePhone,
  readBoolean,
  readString,
} from "./contact-validation";
import { SITE, whatsappWith } from "./site";

export { formatDisplayDate, normalisePhone };

/**
 * Event enquiry data model, validation and message formatting.
 * Pure functions with no browser APIs, so Phase 7 can run the same validation on the server
 * before sending email. Nothing here sends anything.
 */

export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "reception", label: "Reception" },
  { value: "engagement", label: "Engagement" },
  { value: "birthday", label: "Birthday party" },
  { value: "anniversary", label: "Anniversary" },
  { value: "kitty-party", label: "Kitty party" },
  { value: "family-celebration", label: "Other family celebration" },
  { value: "corporate-meeting", label: "Corporate meeting" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Something else" },
] as const;

/** Spaces visible in the resort photographs. Official names are unconfirmed (docs/EVENTS-TO-CONFIRM.md). */
export const VENUE_PREFERENCES = [
  { value: "open-pavilion", label: "Open pavilion with stage" },
  { value: "dining-hall", label: "Covered dining hall" },
  { value: "lawn", label: "Lawn / outdoor area" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export type EventTypeValue = (typeof EVENT_TYPES)[number]["value"];
export type VenueValue = (typeof VENUE_PREFERENCES)[number]["value"];

export type EventEnquiry = {
  name: string;
  /** Normalised 10-digit Indian mobile number. */
  phone: string;
  email: string;
  eventType: EventTypeValue;
  /** YYYY-MM-DD, or empty when dateFlexible. */
  eventDate: string;
  dateFlexible: boolean;
  guests: number;
  space: VenueValue | "";
  requirements: string;
};

export type EventEnquiryField =
  | "name"
  | "phone"
  | "email"
  | "eventType"
  | "eventDate"
  | "guests"
  | "space"
  | "requirements";

export type EventEnquiryErrors = Partial<Record<EventEnquiryField, string>>;

/** Order used to focus the first invalid field. */
export const EVENT_FIELD_ORDER: EventEnquiryField[] = [
  "name",
  "phone",
  "email",
  "eventType",
  "eventDate",
  "guests",
  "space",
  "requirements",
];

export const MAX_GUESTS = LIMITS.maxEventGuests;
export const MAX_REQUIREMENTS = MAX_FREE_TEXT;

const isEventType = (v: string): v is EventTypeValue => EVENT_TYPES.some((t) => t.value === v);
const isVenue = (v: string): v is VenueValue => VENUE_PREFERENCES.some((t) => t.value === v);

export const eventTypeLabel = (v: string) => EVENT_TYPES.find((t) => t.value === v)?.label ?? v;
export const venueLabel = (v: string) => VENUE_PREFERENCES.find((t) => t.value === v)?.label ?? "";

/** `today` is YYYY-MM-DD, passed in to keep this function pure (the server uses the resort's time zone). */
export function validateEventEnquiry(
  input: Record<string, unknown>,
  today: string,
): { ok: true; value: EventEnquiry } | { ok: false; errors: EventEnquiryErrors } {
  const errors: EventEnquiryErrors = {};

  const name = checkName(readString(input, "name"));
  if (name.error) errors.name = name.error;

  const phone = checkPhone(readString(input, "phone"));
  if (phone.error) errors.phone = phone.error;

  const email = checkEmail(readString(input, "email"));
  if (email.error) errors.email = email.error;

  const eventType = readString(input, "eventType");
  if (!eventType) errors.eventType = "Please choose the type of event.";
  else if (!isEventType(eventType)) errors.eventType = "Please choose one of the listed event types.";

  const dateFlexible = readBoolean(input, "dateFlexible");
  const eventDate = readString(input, "eventDate");
  if (!dateFlexible) {
    if (!eventDate) errors.eventDate = "Choose a preferred date, or tick “My date is not fixed yet”.";
    else if (!isValidIsoDate(eventDate)) errors.eventDate = "Enter a valid date.";
    else if (eventDate < today) errors.eventDate = "Please choose today or a future date.";
  }

  const guestsRaw = readString(input, "guests");
  const guests = Number(guestsRaw);
  if (!guestsRaw) errors.guests = "Please enter the approximate number of guests.";
  else if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS)
    errors.guests = `Enter a whole number between 1 and ${MAX_GUESTS}.`;

  const space = readString(input, "space");
  if (space && !isVenue(space)) errors.space = "Please choose one of the listed spaces.";

  const requirements = readString(input, "requirements");
  const reqError = checkFreeText(requirements, MAX_REQUIREMENTS);
  if (reqError) errors.requirements = reqError;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: name.value as string,
      phone: phone.value as string,
      email: email.value as string,
      eventType: eventType as EventTypeValue,
      eventDate: dateFlexible ? "" : eventDate,
      dateFlexible,
      guests,
      space: space as VenueValue | "",
      requirements,
    },
  };
}

/** Plain-text summary used for the WhatsApp message and email body. */
export function eventEnquiryToText(e: EventEnquiry): string {
  return [
    `Event enquiry for ${SITE.name}`,
    "",
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    `Email: ${e.email}`,
    `Event: ${eventTypeLabel(e.eventType)}`,
    `Preferred date: ${e.dateFlexible ? "Not fixed yet" : formatDisplayDate(e.eventDate)}`,
    `Approximate guests: ${e.guests}`,
    `Preferred space: ${e.space ? venueLabel(e.space) : "No preference given"}`,
    `Requirements: ${e.requirements || "None given"}`,
  ].join("\n");
}

export const eventEnquiryWhatsAppHref = (e: EventEnquiry) => whatsappWith(eventEnquiryToText(e));

export const eventEnquiryMailtoHref = (e: EventEnquiry) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(`Event enquiry: ${eventTypeLabel(e.eventType)}`)}&body=${encodeURIComponent(eventEnquiryToText(e))}`;
