import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LINKS, ROUTES, SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Directions, Khandoli, Giridih",
  description:
    "Contact Nature View Resort near Khandoli Dam, Sonbad Road, Giridih, Jharkhand 815302. Call, WhatsApp or email, get directions, or send a room or event enquiry.",
  path: ROUTES.contact,
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Contact</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] text-forest-950 sm:text-6xl">
        Get in touch with Nature View Resort
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
        Call or message us about rooms, the restaurant or an event. For rooms and events you can also send an
        enquiry online; the resort will reply to discuss availability.
      </p>

      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <section aria-labelledby="reach-heading">
          <h2 id="reach-heading" className="font-display text-3xl text-forest-950">Reach us</h2>
          <dl className="mt-6 divide-y divide-forest-900/10 border-y border-forest-900/10">
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Phone</dt>
              <dd>
                <a href={LINKS.tel} className="text-lg font-semibold text-forest-950 underline decoration-clay-600 underline-offset-4">
                  {SITE.phoneDisplay}
                </a>
                <span className="block text-sm text-ink-soft">Tap to call</span>
              </dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="text-sm font-semibold uppercase tracking-wide text-ink-soft">WhatsApp</dt>
              <dd>
                <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-forest-950 underline decoration-clay-600 underline-offset-4">
                  Message {SITE.phoneDisplay}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Email</dt>
              <dd>
                <a href={LINKS.mailto} className="break-all text-lg font-semibold text-forest-950 underline decoration-clay-600 underline-offset-4">
                  {SITE.email}
                </a>
              </dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Address</dt>
              <dd>
                <address className="text-lg not-italic leading-relaxed text-forest-950">
                  {SITE.address.lines.map((l) => (
                    <span key={l} className="block">{l}</span>
                  ))}
                  <span className="block">PIN {SITE.address.postalCode}</span>
                </address>
              </dd>
            </div>
            <div className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
              <dt className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Opening hours</dt>
              <dd className="text-base text-ink-soft">Not listed online. Please call to confirm.</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="directions-heading">
          <h2 id="directions-heading" className="font-display text-3xl text-forest-950">Directions</h2>
          <p className="mt-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            The resort is near Khandoli Dam and Khandoli Park on Sonbad Road, Giridih. The button opens Google Maps
            with the resort&rsquo;s address.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={LINKS.directions} target="_blank" rel="noopener noreferrer">
              Get Directions<span className="sr-only"> (opens in a new tab)</span>
            </Button>
            <Button href={ROUTES.khandoli} variant="outline">Discover Khandoli</Button>
          </div>

          <div className="mt-12 border border-forest-900/15 bg-sand-100 p-6 sm:p-8">
            <h2 className="font-display text-2xl text-forest-950">Send an enquiry</h2>
            <p className="mt-2 text-base text-ink-soft">
              Enquiries do not guarantee availability or confirm a booking. The resort will contact you.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button href={ROUTES.book}>Room Enquiry</Button>
              <Button href={ROUTES.eventEnquiry} variant="outline">Event Enquiry</Button>
            </div>
            <p className="mt-5 text-sm text-ink-soft">
              Browse first? See the <Link href={ROUTES.rooms} className="underline decoration-clay-600 underline-offset-4">rooms</Link>,{" "}
              the <Link href={ROUTES.restaurant} className="underline decoration-clay-600 underline-offset-4">restaurant menu</Link> or{" "}
              <Link href={ROUTES.events} className="underline decoration-clay-600 underline-offset-4">events</Link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
