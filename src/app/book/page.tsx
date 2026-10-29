import type { Metadata } from "next";
import Link from "next/link";
import { RoomEnquiryForm } from "@/components/book/RoomEnquiryForm";
import { ROOM_LIST } from "@/lib/rooms";
import { roomFromQuery } from "@/lib/room-enquiry";
import { LINKS, ROUTES, SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Room Booking Enquiry",
  description:
    "Send a room enquiry to Nature View Resort near Khandoli Dam, Giridih. The resort will contact you to check availability; an enquiry does not confirm a booking.",
  path: ROUTES.book,
  image: "rooms",
});

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  // Only a known room slug preselects a room. Anything else is ignored; no room is ever guessed.
  const initialRoom = roomFromQuery(first(sp.room));
  const chosen = ROOM_LIST.find((r) => r.slug === initialRoom);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-36">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href={ROUTES.home} className="underline-offset-4 hover:underline">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={ROUTES.rooms} className="underline-offset-4 hover:underline">Rooms</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-forest-950">Booking enquiry</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Booking enquiry</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.08] text-forest-950 sm:text-5xl">Enquire about a stay</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Tell us your dates and the resort will contact you to check availability and confirm. There is no online
            payment. Fields marked * are required.
          </p>
          {chosen && (
            <p className="mt-4 border-l-2 border-clay-600 pl-4 text-base text-forest-950">
              Selected room: <strong>{chosen.name}</strong>
            </p>
          )}
          <div className="mt-10">
            <RoomEnquiryForm initialRoom={initialRoom} />
          </div>
        </div>

        <aside aria-labelledby="aside-heading" className="self-start border border-forest-900/15 bg-sand-100 p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 id="aside-heading" className="font-display text-2xl text-forest-950">Prefer to talk?</h2>
          <ul className="mt-4 space-y-3 text-base text-ink">
            <li><a href={LINKS.tel} className="font-semibold underline decoration-clay-600 underline-offset-4">Call {SITE.phoneDisplay}</a></li>
            <li><a href={LINKS.mailto} className="break-all underline decoration-clay-600 underline-offset-4">{SITE.email}</a></li>
          </ul>
          <p className="mt-5 border-t border-forest-900/15 pt-5 text-sm leading-relaxed text-ink-soft">
            Rates, occupancy and availability are not listed online. The resort confirms them when it replies. Sending
            an enquiry does not guarantee availability or confirm a reservation.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Looking for a place for an event? <Link href={ROUTES.eventEnquiry} className="underline decoration-clay-600 underline-offset-4">Send an event enquiry</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
}
