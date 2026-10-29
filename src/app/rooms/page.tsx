import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { RoomCard } from "@/components/rooms/RoomCard";
import { ROOM_LIST, ROOM_PHOTO_NOTE } from "@/lib/rooms";
import { LINKS, ROUTES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description:
    "Three room categories at Nature View Resort near Khandoli Dam, Giridih: Deluxe Room with Lake View, Deluxe Twin Room with Balcony, Hill and Lake View, and Executive Suite with Private Balcony.",
  alternates: { canonical: ROUTES.rooms },
};

const STEPS = [
  { title: "Choose a room", text: "Pick the category you prefer and open its enquiry form." },
  { title: "Send your enquiry", text: "Share your dates, number of guests and contact details." },
  { title: "We contact you", text: "The resort checks availability and talks you through pricing and confirmation." },
];

export default function RoomsPage() {
  return (
    <>
      <PageHero
        eyebrow="Rooms & Suites"
        title="Rooms with a view of the hills and the water"
        image="/images/rooms/twin-balcony.webp"
        alt="Glass-railed balcony looking over a rocky green hill and a lake"
        actions={<Button href={ROUTES.book}>Send a Booking Enquiry</Button>}
      >
        Three room categories at Nature View Resort, beside Khandoli Dam in Giridih.
      </PageHero>

      <section aria-labelledby="rooms-intro" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading eyebrow="Choose your stay" title="Our room categories" id="rooms-intro">
          Browse the photographs for each category, then send an enquiry for your dates. Rates and availability are
          confirmed by the resort directly.
        </SectionHeading>

        <div className="mt-16 space-y-20 sm:space-y-28">
          {ROOM_LIST.map((room, i) => (
            <RoomCard key={room.slug} room={room} flip={i % 2 === 1} priority={i === 0} />
          ))}
        </div>

        <p className="mt-16 max-w-3xl text-sm leading-relaxed text-ink-soft">{ROOM_PHOTO_NOTE}</p>
      </section>

      <section aria-labelledby="how-heading" className="bg-sand-100 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="How booking works" title="Enquire first, confirm with us" id="how-heading">
            There is no online payment or instant booking. Sending an enquiry does not guarantee availability or
            confirm a reservation.
          </SectionHeading>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-forest-900/25 pt-5">
                <span className="font-display text-3xl text-clay-600" aria-hidden="true">{i + 1}</span>
                <h3 className="mt-2 font-display text-2xl text-forest-950">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button href={ROUTES.book}>Send a Booking Enquiry</Button>
            <Button href={LINKS.tel} variant="outline">Call {SITE.phoneDisplay}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
