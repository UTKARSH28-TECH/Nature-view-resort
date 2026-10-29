"use client";

import { useEffect, useRef, useState } from "react";
import { Field, Honeypot, borderFor, inputClass } from "@/components/forms/Field";
import { OutcomePanel } from "@/components/forms/OutcomePanel";
import { useEnquirySubmit } from "@/components/forms/useEnquirySubmit";
import {
  EVENT_FIELD_ORDER,
  EVENT_TYPES,
  MAX_GUESTS,
  MAX_REQUIREMENTS,
  VENUE_PREFERENCES,
  eventEnquiryMailtoHref,
  eventEnquiryToText,
  eventEnquiryWhatsAppHref,
  validateEventEnquiry,
  type EventEnquiry,
  type EventEnquiryErrors,
  type EventEnquiryField,
} from "@/lib/enquiries";

type Draft = {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  dateFlexible: boolean;
  guests: string;
  space: string;
  requirements: string;
};

const EMPTY: Draft = {
  name: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  dateFlexible: false,
  guests: "",
  space: "",
  requirements: "",
};

const FIELD_LABELS: Record<EventEnquiryField, string> = {
  name: "Your name",
  phone: "Phone number",
  email: "Email address",
  eventType: "Type of event",
  eventDate: "Preferred date",
  guests: "Approximate number of guests",
  space: "Preferred space",
  requirements: "Requirements",
};

export function EventEnquiryForm({ initialType = "", initialSpace = "" }: { initialType?: string; initialSpace?: string }) {
  const [draft, setDraft] = useState<Draft>({ ...EMPTY, eventType: initialType, space: initialSpace });
  const [errors, setErrors] = useState<EventEnquiryErrors>({});
  const [today, setToday] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { busy, outcome, submit, clearOutcome } = useEnquirySubmit<EventEnquiry>("event");

  useEffect(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setToday(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const errorList = EVENT_FIELD_ORDER.filter((f) => errors[f]);

  async function send(value: EventEnquiry, honeypot: string) {
    const r = await submit(value, honeypot);
    if (r.errors) {
      // The server found problems the browser did not (it is the source of truth).
      setErrors(r.errors as EventEnquiryErrors);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const honeypot = String(new FormData(e.currentTarget).get("website") ?? "");
    const result = validateEventEnquiry(draft, today || new Date().toISOString().slice(0, 10));
    if (!result.ok) {
      setErrors(result.errors);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    await send(result.value, honeypot);
  }

  function focusField(f: EventEnquiryField) {
    formRef.current?.querySelector<HTMLElement>(`#event-${f}`)?.focus();
  }

  if (outcome) {
    const v = outcome.values;
    return (
      <OutcomePanel
        outcome={outcome}
        label="event enquiry"
        firstName={v.name.split(" ")[0]}
        phone={v.phone}
        summary={eventEnquiryToText(v)}
        whatsappHref={eventEnquiryWhatsAppHref(v)}
        mailtoHref={eventEnquiryMailtoHref(v)}
        busy={busy}
        onRetry={() => send(v, "")}
        onEdit={clearOutcome}
      />
    );
  }

  const describedBy = (f: EventEnquiryField, hint?: boolean) =>
    [hint ? `event-${f}-hint` : "", errors[f] ? `event-${f}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Event enquiry form" aria-busy={busy} className="space-y-8">
      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="border-2 border-clay-700 bg-white p-5 outline-none">
          <p className="font-display text-2xl text-forest-950">
            Please fix {errorList.length === 1 ? "1 problem" : `${errorList.length} problems`} before continuing
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {errorList.map((f) => (
              <li key={f}>
                <button type="button" onClick={() => focusField(f)} className="text-left font-semibold text-clay-700 underline underline-offset-4">
                  {FIELD_LABELS[f]}
                </button>
                <span className="text-ink-soft"> — {errors[f]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Honeypot />

      <fieldset className="space-y-6" disabled={busy}>
        <legend className="font-display text-2xl text-forest-950">About you</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="event-name" label="Your name" required error={errors.name}>
              <input
                id="event-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={120}
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-required="true"
                aria-describedby={describedBy("name")}
                className={`${inputClass} ${borderFor(!!errors.name)}`}
              />
            </Field>
          </div>
          <Field id="event-phone" label="Phone number" required hint="We may call or WhatsApp you on this number." error={errors.phone}>
            <input
              id="event-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={25}
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              aria-required="true"
              aria-describedby={describedBy("phone", true)}
              className={`${inputClass} ${borderFor(!!errors.phone)}`}
            />
          </Field>
          <Field id="event-email" label="Email address" required error={errors.email}>
            <input
              id="event-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={150}
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
              aria-required="true"
              aria-describedby={describedBy("email")}
              className={`${inputClass} ${borderFor(!!errors.email)}`}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-6" disabled={busy}>
        <legend className="font-display text-2xl text-forest-950">About the event</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="event-eventType" label="Type of event" required error={errors.eventType}>
            <select
              id="event-eventType"
              name="eventType"
              value={draft.eventType}
              onChange={(e) => set("eventType", e.target.value)}
              aria-invalid={!!errors.eventType}
              aria-required="true"
              aria-describedby={describedBy("eventType")}
              className={`${inputClass} ${borderFor(!!errors.eventType)}`}
            >
              <option value="">Choose an event type</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="event-guests" label="Approximate number of guests" required hint={`A rough number is fine (1 to ${MAX_GUESTS}).`} error={errors.guests}>
            <input
              id="event-guests"
              name="guests"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_GUESTS}
              value={draft.guests}
              onChange={(e) => set("guests", e.target.value)}
              aria-invalid={!!errors.guests}
              aria-required="true"
              aria-describedby={describedBy("guests", true)}
              className={`${inputClass} ${borderFor(!!errors.guests)}`}
            />
          </Field>

          <div>
            <Field id="event-eventDate" label="Preferred date" required={!draft.dateFlexible} error={errors.eventDate}>
              <input
                id="event-eventDate"
                name="eventDate"
                type="date"
                min={today || undefined}
                value={draft.eventDate}
                disabled={draft.dateFlexible}
                onChange={(e) => set("eventDate", e.target.value)}
                aria-invalid={!!errors.eventDate}
                aria-required={!draft.dateFlexible}
                aria-describedby={describedBy("eventDate")}
                className={`${inputClass} ${borderFor(!!errors.eventDate)}`}
              />
            </Field>
            <label className="mt-3 flex min-h-[2.75rem] items-center gap-3 text-sm text-forest-950">
              <input
                type="checkbox"
                name="dateFlexible"
                checked={draft.dateFlexible}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, dateFlexible: e.target.checked, eventDate: e.target.checked ? "" : d.eventDate }));
                  if (e.target.checked) setErrors((er) => ({ ...er, eventDate: undefined }));
                }}
                className="h-5 w-5 accent-forest-900"
              />
              My date is not fixed yet
            </label>
          </div>

          <Field id="event-space" label="Preferred space" hint="Spaces shown in our photographs. Skip if you are not sure." error={errors.space}>
            <select
              id="event-space"
              name="space"
              value={draft.space}
              onChange={(e) => set("space", e.target.value)}
              aria-invalid={!!errors.space}
              aria-describedby={describedBy("space", true)}
              className={`${inputClass} ${borderFor(!!errors.space)}`}
            >
              <option value="">No preference</option>
              {VENUE_PREFERENCES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="event-requirements"
          label="Catering, decoration and other requirements"
          hint="Tell us anything that will help us plan, such as food, decoration, timing or accommodation for guests."
          error={errors.requirements}
        >
          <textarea
            id="event-requirements"
            name="requirements"
            rows={5}
            value={draft.requirements}
            onChange={(e) => set("requirements", e.target.value)}
            aria-invalid={!!errors.requirements}
            aria-describedby={describedBy("requirements", true)}
            className={`block w-full border bg-white px-3.5 py-3 text-base text-ink ${borderFor(!!errors.requirements)}`}
          />
          <p className={`mt-1 text-right text-xs ${draft.requirements.length > MAX_REQUIREMENTS ? "font-semibold text-clay-700" : "text-ink-soft"}`}>
            {draft.requirements.length} / {MAX_REQUIREMENTS}
          </p>
        </Field>
      </fieldset>

      <div className="border-t border-forest-900/15 pt-6">
        <p className="text-sm leading-relaxed text-ink-soft">
          Sending an enquiry does not guarantee availability or confirm a booking. The resort will contact you to
          discuss your event.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="mt-5 inline-flex h-12 w-full items-center justify-center bg-clay-600 px-8 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-clay-700 disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Sending…" : "Send Event Enquiry"}
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {busy ? "Sending your enquiry" : ""}
        </p>
      </div>
    </form>
  );
}
