import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { Feature } from "@/components/khandoli/Feature";
import { LINKS, ROUTES, SITE, whatsappWith } from "@/lib/site";

export const metadata: Metadata = {
  title: "Discover Khandoli",
  description:
    "Khandoli in Giridih district, Jharkhand: the dam and reservoir, hills and park, and seasonal birdwatching. Stay near Khandoli Dam at Nature View Resort.",
  alternates: { canonical: ROUTES.khandoli },
};

export default function KhandoliPage() {
  return (
    <>
      <PageHero
        eyebrow="Discover Khandoli"
        title="Water, hills and open sky"
        image="/images/khandoli/hill-sunset.webp"
        alt="A rocky hill silhouetted against a setting sun, reflected in a reservoir"
        actions={
          <>
            <Button href={ROUTES.rooms}>View Rooms</Button>
            <Button href={`${ROUTES.gallery}#khandoli`} variant="outlineLight">
              Khandoli Photos
            </Button>
          </>
        }
      >
        Khandoli is a dam, reservoir and hill area in Giridih district, Jharkhand.
      </PageHero>

      <section aria-labelledby="about-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <SectionHeading eyebrow="About Khandoli" title="A lake, a hillside and a park" id="about-heading">
            Khandoli Dam holds back a reservoir known as Khandoli Lake. Khandoli Park lies nearby, and a rocky hill
            rises over the area. It is a popular place for a day out in Giridih district.
          </SectionHeading>
          <p className="self-end border-l-2 border-clay-600 pl-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            Nature View Resort is on Sonbad Road in Giridih, near Khandoli Dam and Khandoli Park, so a stay here puts
            you close to both.
          </p>
        </div>
      </section>

      <section aria-label="Khandoli highlights" className="mx-auto max-w-7xl space-y-20 px-5 pb-20 sm:space-y-28 sm:px-8 sm:pb-28">
        <Feature
          id="dam"
          eyebrow="Dam & reservoir"
          title="On the water"
          photos={[
            {
              src: "/images/khandoli/boating.webp",
              alt: "Small pedal boats on the blue water of the reservoir",
              origin: "area",
            },
            {
              src: "/images/khandoli/lake-and-jetty.webp",
              alt: "Reservoir with a jetty, trees and a road in the foreground",
              origin: "area",
            },
            {
              src: "/images/khandoli/hill-sunset.webp",
              alt: "A rocky hill reflected in the reservoir at sunset",
              origin: "area",
            },
          ]}
        >
          <p>
            The reservoir is the heart of Khandoli. Travel guides list boating on the lake, and our photographs show
            pedal boats on the water.
          </p>
          <p className="text-base text-ink-soft">
            Boating availability, timings and prices are set locally, so please check on the day.
          </p>
        </Feature>

        <Feature
          id="hills"
          flip
          eyebrow="Hills & green spaces"
          title="Hillside and park"
          photos={[
            {
              src: "/images/khandoli/hill-and-park.webp",
              alt: "A rocky hill above a landscaped park with pine trees and a footpath",
              origin: "area",
            },
            {
              src: "/images/hero/resort-and-hill.webp",
              alt: "Resort buildings and a lawn in front of a rocky green hill",
              origin: "resort",
            },
          ]}
        >
          <p>
            A rocky, tree-covered hill rises above the area, and the park below is landscaped with lawns, paths and
            pine trees. Guides mention trekking and views from the hill.
          </p>
          <p className="text-base text-ink-soft">
            Access and conditions vary, so check locally before you go. The resort&rsquo;s own photograph shows a
            rocky hill behind the property.
          </p>
        </Feature>

        <Feature
          id="birds"
          eyebrow="Seasonal birdwatching"
          title="Birds in the cooler months"
          photos={[
            {
              src: "/images/khandoli/birds-on-water.webp",
              alt: "A group of geese swimming on the water",
              origin: "area",
            },
          ]}
        >
          <p>
            The reservoir is known as a winter stop for migratory birds. Sightings depend on the season and the year,
            and recent local reports say that fewer species have been arriving than in the past.
          </p>
          <p className="text-base text-ink-soft">
            Birdwatching here is seasonal. We can&rsquo;t promise that any bird or species will be present during your
            visit.
          </p>
        </Feature>

        <Feature
          id="stay"
          flip
          eyebrow="Stay near Khandoli"
          title="Your base near the dam"
          photos={[
            {
              src: "/images/rooms/twin-balcony.webp",
              alt: "Glass-railed balcony with a view of a rocky green hill and a lake",
              origin: "resort",
            },
            {
              src: "/images/resort/aerial-dusk.webp",
              alt: "Aerial view of Nature View Resort at dusk",
              origin: "resort",
            },
          ]}
        >
          <p>
            Nature View Resort offers rooms, a family restaurant and spaces for celebrations near Khandoli Dam and
            Khandoli Park. The photograph of the Deluxe Twin Room&rsquo;s balcony shows a rocky hill and a lake in the
            distance.
          </p>
          <p className="text-base text-ink-soft">
            Views differ from room to room and are not guaranteed for every room. Ask us when you enquire.
          </p>
        </Feature>
      </section>

      <section aria-labelledby="visit-heading" className="bg-sand-100 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Plan your visit" title="Good to know" id="visit-heading" />
            <ul className="mt-8 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-3.5 h-px w-5 shrink-0 bg-clay-600" />
                Many guides suggest the cooler months, roughly October to March, as the most pleasant time to visit.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-3.5 h-px w-5 shrink-0 bg-clay-600" />
                Giridih is the nearest town. Ask us for directions and local advice when you contact the resort.
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-3.5 h-px w-5 shrink-0 bg-clay-600" />
                Activities, timings and fees at the dam and park are managed locally and can change.
              </li>
            </ul>
          </div>

          <div className="self-center border border-forest-900/15 bg-white p-6 sm:p-8">
            <h3 className="font-display text-3xl text-forest-950">Stay with us</h3>
            <p className="mt-2 text-base text-ink-soft">
              Send a room enquiry for your dates. It does not guarantee availability; the resort will contact you.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button href={ROUTES.book} className="sm:col-span-2">Send a Booking Enquiry</Button>
              <Button href={ROUTES.rooms} variant="outline">Explore Rooms</Button>
              <Button href={LINKS.directions} variant="outline" target="_blank" rel="noopener noreferrer">
                Get Directions<span className="sr-only"> (opens in a new tab)</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="more-heading" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 id="more-heading" className="font-display text-3xl text-forest-950 sm:text-4xl">
          More at the resort
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          <li className="border-t border-forest-900/20 pt-5">
            <h3 className="font-display text-2xl text-forest-950">Restaurant</h3>
            <p className="mt-2 text-base text-ink-soft">A veg and non-veg menu, with prices.</p>
            <Link href={ROUTES.restaurant} className="mt-3 inline-flex text-sm font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700">
              View the menu<span aria-hidden="true">&nbsp;→</span>
            </Link>
          </li>
          <li className="border-t border-forest-900/20 pt-5">
            <h3 className="font-display text-2xl text-forest-950">Events</h3>
            <p className="mt-2 text-base text-ink-soft">Weddings, birthdays, family occasions and meetings.</p>
            <Link href={ROUTES.events} className="mt-3 inline-flex text-sm font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700">
              Plan an event<span aria-hidden="true">&nbsp;→</span>
            </Link>
          </li>
          <li className="border-t border-forest-900/20 pt-5">
            <h3 className="font-display text-2xl text-forest-950">Contact</h3>
            <p className="mt-2 text-base text-ink-soft">
              <a href={LINKS.tel} className="font-semibold underline decoration-clay-600 underline-offset-4">{SITE.phoneDisplay}</a>
              <br />
              <a href={LINKS.mailto} className="break-all underline decoration-clay-600 underline-offset-4">{SITE.email}</a>
            </p>
            <a
              href={whatsappWith("Hello Nature View Resort, I would like to know more about staying near Khandoli.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700"
            >
              WhatsApp us<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
