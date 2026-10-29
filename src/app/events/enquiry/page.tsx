import type { Metadata } from "next";
import Link from "next/link";
import { EventEnquiryForm } from "@/components/events/EventEnquiryForm";
import { EVENT_TYPES, VENUE_PREFERENCES } from "@/lib/enquiries";
import { LINKS, ROUTES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Event Enquiry",
  description:
    "Send an event enquiry to Nature View Resort, Khandoli, Giridih: wedding, birthday, anniversary, family celebration, kitty party or corporate meeting.",
  alternates: { canonical: ROUTES.eventEnquiry },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function EventEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Only accept known values from the URL; anything else is ignored.
  const type = first(sp.type);
  const space = first(sp.space);
  const initialType = EVENT_TYPES.some((t) => t.value === type) ? type : "";
  const initialSpace = VENUE_PREFERENCES.some((v) => v.value === space) ? space : "";

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href={ROUTES.home} className="underline-offset-4 hover:underline">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={ROUTES.events} className="underline-offset-4 hover:underline">Events</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-forest-950">Event enquiry</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Event enquiry</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.08] text-forest-950 sm:text-5xl">Tell us about your event</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Share a few details and the resort will get back to you to talk through availability and arrangements.
            Fields marked * are required.
          </p>
          <div className="mt-10">
            <EventEnquiryForm initialType={initialType} initialSpace={initialSpace} />
          </div>
        </div>

        <aside aria-labelledby="aside-heading" className="self-start border border-forest-900/15 bg-sand-100 p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 id="aside-heading" className="font-display text-2xl text-forest-950">Prefer to talk?</h2>
          <ul className="mt-4 space-y-3 text-base text-ink">
            <li><a href={LINKS.tel} className="font-semibold underline decoration-clay-600 underline-offset-4">Call {SITE.phoneDisplay}</a></li>
            <li><a href={LINKS.mailto} className="break-all underline decoration-clay-600 underline-offset-4">{SITE.email}</a></li>
          </ul>
          <address className="mt-5 text-sm not-italic leading-relaxed text-ink-soft">
            {SITE.address.lines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
            <span className="block">PIN {SITE.address.postalCode}</span>
          </address>
          <p className="mt-5 border-t border-forest-900/15 pt-5 text-sm leading-relaxed text-ink-soft">
            Capacity, packages and pricing are not listed online. We confirm them when we reply. Sending an enquiry
            does not guarantee availability or confirm a booking.
          </p>
        </aside>
      </div>
    </div>
  );
}
