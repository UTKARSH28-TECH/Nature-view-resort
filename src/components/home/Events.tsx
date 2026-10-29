import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ROUTES } from "@/lib/site";

const OCCASIONS = [
  { title: "Weddings & receptions", text: "Open pavilion and lawns for large family gatherings." },
  { title: "Birthdays & anniversaries", text: "Decorated setups for private celebrations." },
  { title: "Kitty parties", text: "A relaxed venue for get-togethers." },
  { title: "Meetings & conferences", text: "Enquire with your requirements and group size." },
];

export function Events() {
  return (
    <section id="events" aria-labelledby="events-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        <Photo
          src="/images/events/stage-pavilion.webp"
          alt="Open red-roofed pavilion with a raised stage, decorated tables and white chairs at night"
          sizes="(min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] sm:col-span-2 sm:aspect-auto sm:min-h-[22rem]"
        />
        <Photo
          src="/images/events/birthday-setup.webp"
          alt="Birthday decoration with a balloon wall, neon sign and panda-themed props"
          sizes="(min-width: 640px) 25vw, 100vw"
          className="aspect-[4/3] sm:aspect-auto"
        />
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <SectionHeading eyebrow="Weddings & Events" title="Celebrate under open skies" id="events-heading">
            The resort hosts family occasions in its pavilion, lawns and dining hall. Tell us about your event and we
            will discuss availability and arrangements with you.
          </SectionHeading>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href={ROUTES.eventEnquiry}>Enquire About an Event</Button>
            <Button href={ROUTES.events} variant="text">
              Explore events<span aria-hidden="true"> →</span>
            </Button>
          </div>
        </div>
        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {OCCASIONS.map((o) => (
            <li key={o.title} className="border-t border-forest-900/20 pt-5">
              <h3 className="font-display text-2xl text-forest-950">{o.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{o.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
