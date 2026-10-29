import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { OccasionSection } from "@/components/events/OccasionSection";
import { OCCASIONS, PLANNING_CHECKLIST, SPACES, enquiryHref } from "@/lib/events";
import { LINKS, ROUTES, SITE, whatsappWith } from "@/lib/site";

export const metadata: Metadata = {
  title: "Weddings, Celebrations & Events",
  description:
    "Plan a wedding, birthday, anniversary, family celebration, kitty party or corporate meeting at Nature View Resort near Khandoli Dam, Giridih. Send an event enquiry.",
  alternates: { canonical: ROUTES.events },
};

const MORE = [
  {
    id: "kitty",
    title: "Kitty parties",
    text: "Kitty parties are listed on the restaurant's menu card. Tell us your group size and preferred date and we will discuss the arrangements.",
    href: enquiryHref({ type: "kitty-party" }),
  },
  {
    id: "corporate",
    title: "Corporate meetings & conferences",
    text: "For meetings, conferences and business gatherings, send us your requirements and group size. We will confirm what the resort can offer when we reply.",
    href: enquiryHref({ type: "corporate-meeting" }),
  },
];

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Weddings & Events"
        title="Celebrate at Nature View Resort"
        image="/images/events/stage-pavilion.webp"
        alt="Open red-roofed pavilion with a raised stage, decorated tables and white chairs at night"
        actions={
          <>
            <Button href={enquiryHref()}>Send an Event Enquiry</Button>
            <Button href="#spaces" variant="outlineLight">
              See the Spaces
            </Button>
          </>
        }
      >
        Weddings, birthdays, family occasions and meetings beside Khandoli Dam, Giridih.
      </PageHero>

      <section aria-labelledby="events-intro" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <SectionHeading eyebrow="Events at the resort" title="A setting for your occasion" id="events-intro">
            The resort&rsquo;s grounds include an open pavilion with a stage, a covered dining hall and a lawn. The
            restaurant&rsquo;s menu card lists birthday, kitty, anniversary and marriage parties.
          </SectionHeading>
          <div className="self-end border-l-2 border-clay-600 pl-6">
            <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
              Every event is planned through an enquiry. Capacities, packages and availability are confirmed with you
              directly, so nothing here is a quote or a booking.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Occasions" className="mx-auto max-w-7xl space-y-20 px-5 pb-20 sm:space-y-28 sm:px-8 sm:pb-28">
        {OCCASIONS.map((o, i) => (
          <OccasionSection key={o.id} occasion={o} flip={i % 2 === 1} />
        ))}
      </section>

      <section aria-labelledby="more-heading" className="on-dark bg-forest-950 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="Also welcome" title="Kitty parties and business gatherings" id="more-heading" light />
          <ul className="mt-12 grid gap-10 md:grid-cols-2">
            {MORE.map((m) => (
              <li key={m.id} id={m.id} className="scroll-mt-24 border-t border-white/25 pt-6">
                <h3 className="font-display text-3xl text-white">{m.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-sand-100">{m.text}</p>
                <p className="mt-3 text-sm text-sand-200">Capacity, equipment and pricing are confirmed on enquiry.</p>
                <Button href={m.href} variant="outlineLight" className="mt-6">
                  Enquire
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="spaces" aria-labelledby="spaces-heading" className="scroll-mt-20 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow="The spaces" title="Where your event could take place" id="spaces-heading">
          These are the spaces shown in the resort&rsquo;s photographs. Names are descriptive; ask us which space suits
          your guest count.
        </SectionHeading>
        <ul className="mt-12 grid gap-10 md:grid-cols-3">
          {SPACES.map((s) => (
            <li key={s.id} className="group flex flex-col">
              <Photo
                src={s.photo.src}
                alt={s.photo.alt}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="aspect-[4/3]"
                imgClassName="transition-transform duration-700 group-hover:scale-105"
              />
              <h3 className="mt-6 font-display text-2xl text-forest-950">{s.name}</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-ink-soft">{s.summary}</p>
              <p className="mt-3 text-sm text-ink-soft">Capacity and availability: ask us.</p>
              <Link
                href={enquiryHref({ space: s.id })}
                className="mt-4 inline-flex text-sm font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700"
              >
                Ask about this space<span aria-hidden="true">&nbsp;→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="plan-heading" className="bg-sand-100 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Planning" title="What to tell us" id="plan-heading">
              A short enquiry is all we need to begin. It helps if you can share:
            </SectionHeading>
            <ul className="mt-8 space-y-3 text-base text-ink">
              {PLANNING_CHECKLIST.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden="true" className="mt-3 h-px w-5 shrink-0 bg-clay-600" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-center border border-forest-900/15 bg-white p-6 sm:p-8">
            <h3 className="font-display text-3xl text-forest-950">Start your enquiry</h3>
            <p className="mt-2 text-base text-ink-soft">
              Prefer to talk? Call or message us on {SITE.phoneDisplay}.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button href={enquiryHref()} className="sm:col-span-2">
                Event Enquiry Form
              </Button>
              <Button href={LINKS.tel} variant="outline">
                Call
              </Button>
              <Button
                href={whatsappWith("Hello Nature View Resort, I would like to ask about hosting an event.")}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp<span className="sr-only"> (opens in a new tab)</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="alongside-heading" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 id="alongside-heading" className="font-display text-3xl text-forest-950 sm:text-4xl">
          Hosting guests from out of town?
        </h2>
        <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">
          See the resort&rsquo;s rooms, or the restaurant menu.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button href={ROUTES.rooms}>View Rooms</Button>
          <Button href={ROUTES.restaurant} variant="outline">
            Restaurant &amp; Menu
          </Button>
          <Button href={ROUTES.home} variant="text">
            Back to the homepage<span aria-hidden="true"> →</span>
          </Button>
        </div>
      </section>
    </>
  );
}
