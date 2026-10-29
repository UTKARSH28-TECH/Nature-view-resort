"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Field, Honeypot, borderFor, inputClass } from "@/components/forms/Field";
import { OutcomePanel } from "@/components/forms/OutcomePanel";
import { useEnquirySubmit } from "@/components/forms/useEnquirySubmit";
import { addDays } from "@/lib/contact-validation";
import { ROOM_LIST } from "@/lib/rooms";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  MAX_REQUESTS,
  ROOM_FIELD_ORDER,
  roomEnquiryMailtoHref,
  roomEnquiryToText,
  roomEnquiryWhatsAppHref,
  validateRoomEnquiry,
  type RoomEnquiry,
  type RoomEnquiryErrors,
  type RoomEnquiryField,
} from "@/lib/room-enquiry";
import { ROUTES } from "@/lib/site";

type Draft = {
  room: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  name: string;
  phone: string;
  email: string;
  requests: string;
};

const FIELD_LABELS: Record<RoomEnquiryField, string> = {
  room: "Preferred room",
  checkIn: "Check-in date",
  checkOut: "Check-out date",
  adults: "Adults",
  children: "Children",
  name: "Full name",
  phone: "Phone number",
  email: "Email address",
  requests: "Special requests",
};

export function RoomEnquiryForm({ initialRoom = "" }: { initialRoom?: string }) {
  const [draft, setDraft] = useState<Draft>({
    room: initialRoom,
    checkIn: "",
    checkOut: "",
    adults: "2",
    children: "0",
    name: "",
    phone: "",
    email: "",
    requests: "",
  });
  const [errors, setErrors] = useState<RoomEnquiryErrors>({});
  const [today, setToday] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { busy, outcome, submit, clearOutcome } = useEnquirySubmit<RoomEnquiry>("room");

  useEffect(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    setToday(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const errorList = ROOM_FIELD_ORDER.filter((f) => errors[f]);
  const checkOutMin = draft.checkIn ? addDays(draft.checkIn, 1) : today ? addDays(today, 1) : undefined;

  async function send(value: RoomEnquiry, honeypot: string) {
    const r = await submit(value, honeypot);
    if (r.errors) {
      setErrors(r.errors as RoomEnquiryErrors);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const honeypot = String(new FormData(e.currentTarget).get("website") ?? "");
    const result = validateRoomEnquiry(draft, today || new Date().toISOString().slice(0, 10));
    if (!result.ok) {
      setErrors(result.errors);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    await send(result.value, honeypot);
  }

  function focusField(f: RoomEnquiryField) {
    formRef.current?.querySelector<HTMLElement>(`#room-${f}`)?.focus();
  }

  if (outcome) {
    const v = outcome.values;
    return (
      <OutcomePanel
        outcome={outcome}
        label="room enquiry"
        firstName={v.name.split(" ")[0]}
        phone={v.phone}
        summary={roomEnquiryToText(v)}
        whatsappHref={roomEnquiryWhatsAppHref(v)}
        mailtoHref={roomEnquiryMailtoHref(v)}
        busy={busy}
        onRetry={() => send(v, "")}
        onEdit={clearOutcome}
      />
    );
  }

  const describedBy = (f: RoomEnquiryField, hint?: boolean) =>
    [hint ? `room-${f}-hint` : "", errors[f] ? `room-${f}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Room booking enquiry form" aria-busy={busy} className="space-y-8">
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
        <legend className="font-display text-2xl text-forest-950">Your stay</legend>
        <Field id="room-room" label="Preferred room" hint="You can change this later; the resort will confirm what is available." error={errors.room}>
          <select
            id="room-room"
            name="room"
            value={draft.room}
            onChange={(e) => set("room", e.target.value)}
            aria-invalid={!!errors.room}
            aria-describedby={describedBy("room", true)}
            className={`${inputClass} ${borderFor(!!errors.room)}`}
          >
            <option value="">No preference / not sure yet</option>
            {ROOM_LIST.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="room-checkIn" label="Check-in date" required error={errors.checkIn}>
            <input
              id="room-checkIn"
              name="checkIn"
              type="date"
              min={today || undefined}
              value={draft.checkIn}
              onChange={(e) => {
                const v = e.target.value;
                setDraft((d) => ({ ...d, checkIn: v, checkOut: d.checkOut && v && d.checkOut <= v ? "" : d.checkOut }));
                setErrors((er) => ({ ...er, checkIn: undefined }));
              }}
              aria-invalid={!!errors.checkIn}
              aria-required="true"
              aria-describedby={describedBy("checkIn")}
              className={`${inputClass} ${borderFor(!!errors.checkIn)}`}
            />
          </Field>
          <Field id="room-checkOut" label="Check-out date" required error={errors.checkOut}>
            <input
              id="room-checkOut"
              name="checkOut"
              type="date"
              min={checkOutMin}
              value={draft.checkOut}
              onChange={(e) => set("checkOut", e.target.value)}
              aria-invalid={!!errors.checkOut}
              aria-required="true"
              aria-describedby={describedBy("checkOut")}
              className={`${inputClass} ${borderFor(!!errors.checkOut)}`}
            />
          </Field>
          <Field id="room-adults" label="Adults" required error={errors.adults}>
            <input
              id="room-adults"
              name="adults"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_ADULTS}
              value={draft.adults}
              onChange={(e) => set("adults", e.target.value)}
              aria-invalid={!!errors.adults}
              aria-required="true"
              aria-describedby={describedBy("adults")}
              className={`${inputClass} ${borderFor(!!errors.adults)}`}
            />
          </Field>
          <Field id="room-children" label="Children" hint="Leave as 0 if none." error={errors.children}>
            <input
              id="room-children"
              name="children"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_CHILDREN}
              value={draft.children}
              onChange={(e) => set("children", e.target.value)}
              aria-invalid={!!errors.children}
              aria-describedby={describedBy("children", true)}
              className={`${inputClass} ${borderFor(!!errors.children)}`}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-6" disabled={busy}>
        <legend className="font-display text-2xl text-forest-950">Your details</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="room-name" label="Full name" required error={errors.name}>
              <input
                id="room-name"
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
          <Field id="room-phone" label="Phone number" required hint="The resort may call or WhatsApp you on this number." error={errors.phone}>
            <input
              id="room-phone"
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
          <Field id="room-email" label="Email address" required error={errors.email}>
            <input
              id="room-email"
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

        <Field id="room-requests" label="Special requests" hint="Anything that will help the resort plan your stay. Please don't include payment card, ID or health details." error={errors.requests}>
          <textarea
            id="room-requests"
            name="requests"
            rows={4}
            value={draft.requests}
            onChange={(e) => set("requests", e.target.value)}
            aria-invalid={!!errors.requests}
            aria-describedby={describedBy("requests", true)}
            className={`block w-full border bg-white px-3.5 py-3 text-base text-ink ${borderFor(!!errors.requests)}`}
          />
          <p className={`mt-1 text-right text-xs ${draft.requests.length > MAX_REQUESTS ? "font-semibold text-clay-700" : "text-ink-soft"}`}>
            {draft.requests.length} / {MAX_REQUESTS}
          </p>
        </Field>
      </fieldset>

      <div className="border-t border-forest-900/15 pt-6">
        <p className="text-sm leading-relaxed text-ink-soft">
          <strong className="text-forest-950">This is an enquiry, not a booking.</strong> Sending it does not guarantee
          that a room is available or confirm a reservation. The resort will contact you to check availability and
          discuss any pricing. We use these details only to reply to your enquiry; see the{" "}
          <Link href={ROUTES.privacy} className="underline decoration-clay-600 underline-offset-4">privacy notice</Link>.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="mt-5 inline-flex h-12 w-full items-center justify-center bg-clay-600 px-8 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-clay-700 disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Sending…" : "Send Booking Enquiry"}
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {busy ? "Sending your enquiry" : ""}
        </p>
      </div>
    </form>
  );
}
