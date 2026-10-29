import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { RestaurantMenu } from "@/components/restaurant/RestaurantMenu";
import { MENU, MENU_ITEM_COUNT, categoryById, findItem, lowestPrice, rupees } from "@/data/menu";
import { LINKS, ROUTES, SITE, whatsappWith } from "@/lib/site";
import { pageMetadata, restaurantJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Family Restaurant & Menu, Khandoli, Giridih",
  description:
    "Nature View Family Restaurant at Nature View Resort near Khandoli Dam, Giridih. Browse the vegetarian and non-vegetarian menu with prices, or call to ask about group dining.",
  path: ROUTES.restaurant,
  image: "restaurant",
});

const SETTING = [
  {
    src: "/images/events/restaurant-hall-evening.webp",
    alt: "Covered dining hall with red drapes, a long table, black chairs and a floral backdrop",
    caption: "Dining hall",
    className: "sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto",
  },
  {
    src: "/images/resort/cottages-dusk.webp",
    alt: "Lit red-roofed pavilions around a lawn at sunset",
    caption: "Outdoor area at dusk",
    className: "aspect-[4/3]",
  },
  {
    src: "/images/events/stage-pavilion.webp",
    alt: "Open red-roofed pavilion with a raised stage and white chairs at night",
    caption: "Open pavilion",
    className: "aspect-[4/3]",
  },
];

export default function RestaurantPage() {
  const paneerKadhai = findItem("Paneer Kadhai");
  const noodles = categoryById("noodles-chopsuey");

  return (
    <>
      <JsonLd data={restaurantJsonLd()} />
      <PageHero
        eyebrow="Family Restaurant"
        title="Dine at Nature View Family Restaurant"
        image="/images/events/restaurant-hall-evening.webp"
        alt="Covered dining hall with red drapes, a long wooden table and warm lights in the evening"
        actions={
          <>
            <Button href="#menu">Explore the Menu</Button>
            <Button href={LINKS.tel} variant="outlineLight">
              Call {SITE.phoneDisplay}
            </Button>
          </>
        }
      >
        Vegetarian and non-vegetarian food beside Khandoli Dam, Giridih.
      </PageHero>

      <section aria-labelledby="dining-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Dining" title="A family restaurant at the resort" id="dining-heading">
              Nature View Family Restaurant is part of Nature View Resort in Khandoli. The menu card lists{" "}
              {MENU_ITEM_COUNT} dishes in {MENU.length} sections, from starters and tandoor to Chinese, main course
              dishes, breads, rice and biryani, breakfast and beverages.
            </SectionHeading>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              The restaurant card also lists birthday, kitty, anniversary and marriage parties. If you are planning a
              celebration, tell us about it through the event enquiry.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button href="#menu">Explore the Menu</Button>
              <Button href={ROUTES.eventEnquiry} variant="text">
                Event enquiry<span aria-hidden="true"> →</span>
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-8 gap-y-8 self-center border-t border-forest-900/20 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            {[
              ["Veg & non-veg", "Both on one menu card"],
              [`${MENU_ITEM_COUNT} dishes`, `In ${MENU.length} printed sections`],
              ["Prices in rupees", "Exactly as on the menu card"],
              ["Call to ask", "About tables and group dining"],
            ].map(([a, b]) => (
              <li key={a}>
                <p className="font-display text-2xl text-forest-950">{a}</p>
                <p className="mt-1 text-sm text-ink-soft">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="setting-heading" className="bg-sand-100 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="The setting" title="Where you will eat" id="setting-heading" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-3 sm:grid-rows-2 sm:gap-6">
            {SETTING.map((s) => (
              <li key={s.src} className={`group relative ${s.className}`}>
                <Photo
                  src={s.src}
                  alt={s.alt}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="h-full w-full min-h-[14rem]"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute bottom-0 left-0 bg-forest-950/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-sand-50">
                  {s.caption}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {paneerKadhai && noodles && (
        <section aria-labelledby="dishes-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading eyebrow="From the menu" title="Two dishes to start with" id="dishes-heading">
            Prices below come straight from the menu card.
          </SectionHeading>
          <ul className="mt-12 grid gap-10 md:grid-cols-2">
            <li>
              <Photo
                src="/images/food/kadhai-paneer.webp"
                alt="Paneer curry in a white bowl with rice, papad and sliced onion"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/3]"
              />
              <h3 className="mt-5 font-display text-3xl text-forest-950">Paneer Kadhai</h3>
              <p className="mt-1 text-lg text-ink-soft">{rupees(paneerKadhai.prices[0])} · Main course, vegetarian section</p>
            </li>
            <li>
              <Photo
                src="/images/food/noodles.webp"
                alt="A bowl of vegetable noodles lifted with a fork"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/3]"
                imgClassName="object-center"
              />
              <h3 className="mt-5 font-display text-3xl text-forest-950">Noodles &amp; Chopsuey</h3>
              <p className="mt-1 text-lg text-ink-soft">
                {noodles.items.length} dishes, from {rupees(lowestPrice(noodles))}
              </p>
            </li>
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-ink-soft">
            Food photographs are illustrative and may not show these dishes exactly as prepared and served at the resort.
          </p>
          <Button href="#menu" className="mt-8">
            See all prices
          </Button>
        </section>
      )}

      <RestaurantMenu />

      <section aria-labelledby="visit-heading" className="on-dark bg-forest-950 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Visit or ask" title="Contact the restaurant" id="visit-heading" light>
              Call or message us about tables, group dining or celebrations. You can&rsquo;t order food through this
              website; please contact the resort directly.
            </SectionHeading>
            <address className="mt-8 text-base not-italic leading-relaxed text-sand-100">
              {SITE.address.lines.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
              <span className="block">PIN {SITE.address.postalCode}</span>
            </address>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-2">
            <Button href={LINKS.tel}>Call {SITE.phoneDisplay}</Button>
            <Button
              href={whatsappWith("Hello Nature View Resort, I would like to ask about the restaurant.")}
              variant="outlineLight"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </Button>
            <Button href={LINKS.directions} variant="outlineLight" target="_blank" rel="noopener noreferrer">
              Get Directions<span className="sr-only"> (opens in a new tab)</span>
            </Button>
            <Button href={LINKS.mailto} variant="outlineLight">Email Us</Button>
            <Button href={ROUTES.eventEnquiry} variant="outlineLight" className="sm:col-span-2">
              Enquire About an Event
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="stay-heading" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <h2 id="stay-heading" className="max-w-xl font-display text-3xl text-forest-950 sm:text-4xl">
            Staying the night? See the resort&rsquo;s rooms.
          </h2>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href={ROUTES.rooms}>View Rooms</Button>
            <Button href={ROUTES.home} variant="text">
              Back to the homepage<span aria-hidden="true"> →</span>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
