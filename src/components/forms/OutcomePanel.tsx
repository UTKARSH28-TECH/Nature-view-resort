"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/Button";
import { LINKS, SITE } from "@/lib/site";
import type { Outcome } from "./useEnquirySubmit";

type Props<V> = {
  outcome: Outcome<V>;
  /** "room enquiry" or "event enquiry" */
  label: string;
  firstName: string;
  phone: string;
  summary: string;
  whatsappHref: string;
  mailtoHref: string;
  busy: boolean;
  onRetry: () => void;
  onEdit: () => void;
};

const PROBLEMS = {
  "not-configured": {
    eyebrow: "Not sent",
    title: "Online sending isn’t set up yet",
    text: "This website can’t send enquiries to the resort’s email at the moment, so nothing has been sent. Please send your details yourself using one of the options below.",
    canRetry: false,
  },
  "delivery-failed": {
    eyebrow: "Not sent",
    title: "We couldn’t send your enquiry",
    text: "Something went wrong while sending, so the resort may not have received it. You can try again, or send your details yourself below.",
    canRetry: true,
  },
  "network-error": {
    eyebrow: "Not sent",
    title: "We couldn’t reach the server",
    text: "Please check your internet connection and try again, or send your details yourself below.",
    canRetry: true,
  },
  "rate-limited": {
    eyebrow: "Not sent",
    title: "Too many attempts",
    text: "Please wait a little before trying again, or send your details yourself below.",
    canRetry: true,
  },
} as const;

const SAVED_ONLY = {
  eyebrow: "Saved · resort not yet notified",
  title: "Your enquiry is saved, but we couldn’t notify the resort",
  text: "We recorded your enquiry, but the email notification to the resort did not go through, so nobody there may have seen it yet. Please also send your details by WhatsApp or call us so it isn’t missed. You can also try sending again.",
  canRetry: true,
} as const;

/** Truthful result panel: "sent" means accepted for email delivery; it never means a booking is confirmed. */
export function OutcomePanel<V>({ outcome, label, firstName, phone, summary, whatsappHref, mailtoHref, busy, onRetry, onEdit }: Props<V>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [outcome]);

  const sent = outcome.type === "sent";
  const savedOnly = outcome.type === "saved";
  const p = outcome.type === "problem" ? PROBLEMS[outcome.problem] : savedOnly ? SAVED_ONLY : null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-labelledby="outcome-heading"
      className={`border p-6 outline-none sm:p-10 ${sent ? "border-forest-900/20 bg-sand-100" : "border-clay-700 bg-white"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">
        {sent ? "Sent · not yet confirmed" : p?.eyebrow}
      </p>
      <h2 id="outcome-heading" className="mt-3 font-display text-3xl text-forest-950 sm:text-4xl">
        {sent ? "Your enquiry has been sent" : p?.title}
      </h2>

      {sent ? (
        <>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            Thank you, {firstName}. Our email system accepted your {label} for delivery to the resort
            {outcome.saved ? ", and a copy has been saved" : ""}.
            {outcome.reference && (
              <>
                {" "}
                Your reference is <strong className="font-semibold text-forest-950">{outcome.reference}</strong>; please
                keep it.
              </>
            )}
          </p>
          <p className="mt-4 border-l-4 border-clay-600 bg-white p-4 text-sm leading-relaxed text-ink">
            <strong>This is an enquiry, not a confirmed booking.</strong> The resort has not checked or promised
            availability yet. They will contact you on {phone} to discuss.
          </p>
        </>
      ) : (
        <>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{p?.text}</p>
          {outcome.type === "problem" && outcome.problem === "rate-limited" && outcome.retryAfterSeconds && (
            <p className="mt-2 text-sm text-ink-soft">You can try again in about {Math.ceil(outcome.retryAfterSeconds / 60)} min.</p>
          )}
          {(outcome.type === "problem" || outcome.type === "saved") && outcome.reference && (
            <p className="mt-2 text-sm text-ink-soft">
              {outcome.type === "saved" ? "Your reference" : "Reference for this attempt"}: {outcome.reference}
            </p>
          )}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {p?.canRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={busy}
                className="inline-flex h-12 items-center justify-center bg-clay-600 px-6 text-sm font-semibold text-white hover:bg-clay-700 disabled:opacity-60 sm:col-span-3"
              >
                {busy ? "Sending…" : "Try sending again"}
              </button>
            )}
            <Button href={whatsappHref} target="_blank" rel="noopener noreferrer" variant={p?.canRetry ? "outline" : "primary"}>
              Send on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </Button>
            <Button href={mailtoHref} variant="outline">
              Send by email
            </Button>
            <Button href={LINKS.tel} variant="outline">
              Call {SITE.phoneDisplay}
            </Button>
          </div>
        </>
      )}

      <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-forest-900">Your details</h3>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words border border-forest-900/15 bg-white p-4 font-sans text-sm leading-relaxed text-ink">
        {summary}
      </pre>

      {!sent && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-6 text-sm font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700"
        >
          Edit my details
        </button>
      )}
    </div>
  );
}
