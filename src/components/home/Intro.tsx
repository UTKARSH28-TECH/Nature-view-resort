import { Photo } from "@/components/Photo";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { LINKS, ROUTES } from "@/lib/site";

export function Intro() {
  return (
    <section id="welcome" aria-labelledby="welcome-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <SectionHeading eyebrow="Welcome" title="A stay beside Khandoli Dam" id="welcome-heading">
            Nature View Resort is in Khandoli, Giridih, near Khandoli Dam and Khandoli Park. Stay in a comfortable room,
            eat at the family restaurant, or hold a family celebration in the resort&rsquo;s open spaces.
          </SectionHeading>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Room bookings are handled by enquiry: tell us your dates and we will contact you to confirm availability.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href={ROUTES.book}>Book Your Stay</Button>
            <Button href={LINKS.directions} variant="text" target="_blank" rel="noopener noreferrer">
              Get directions<span className="sr-only"> (opens in a new tab)</span>
            </Button>
          </div>
        </div>
        <Photo
          src="/images/resort/aerial-dusk.webp"
          alt="Aerial view of Nature View Resort at dusk, with the main building, red-roofed pavilions and restaurant signage"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] w-full"
        />
      </div>
    </section>
  );
}
