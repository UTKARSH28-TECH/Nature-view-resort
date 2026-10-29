import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { enquiryHref, type Occasion } from "@/lib/events";

/** Photo-led occasion block. `flip` swaps the sides on large screens. */
export function OccasionSection({ occasion, flip }: { occasion: Occasion; flip?: boolean }) {
  const [lead, second] = occasion.photos;
  const headingId = `${occasion.id}-heading`;

  return (
    <article id={occasion.id} aria-labelledby={headingId} className="scroll-mt-24 grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <div className={`grid grid-cols-5 gap-3 lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <Photo
          src={lead.src}
          alt={lead.alt}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="col-span-5 aspect-[3/2]"
          imgClassName="transition-transform duration-700 hover:scale-105"
        />
        {second && (
          <Photo
            src={second.src}
            alt={second.alt}
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="col-span-5 aspect-[21/9]"
          />
        )}
      </div>

      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">{occasion.eyebrow}</p>
        <h2 id={headingId} className="mt-3 font-display text-3xl leading-tight text-forest-950 sm:text-4xl">
          {occasion.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{occasion.text}</p>
        <p className="mt-4 text-sm text-ink-soft">Capacity, packages and availability are confirmed when you enquire.</p>
        <div className="mt-7">
          <Button href={enquiryHref({ type: occasion.type })}>Enquire About This Event</Button>
        </div>
      </div>
    </article>
  );
}
