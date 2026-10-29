import { Button } from "@/components/Button";
import { HeroSlides } from "@/components/home/HeroSlides";
import { ROUTES } from "@/lib/site";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="on-dark relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest-950">
      <HeroSlides />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-950/35 to-forest-950/25" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-28 pt-32 sm:px-8 sm:pb-24">
        <p className="animate-rise text-xs font-semibold uppercase tracking-[0.28em] text-sand-100">
          Khandoli · Giridih · Jharkhand
        </p>
        <h1
          id="hero-heading"
          className="animate-rise mt-5 max-w-3xl font-display text-5xl leading-[1.04] text-white [animation-delay:120ms] sm:text-7xl"
        >
          Where Nature Meets Unforgettable Moments
        </h1>
        <p className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-sand-100 [animation-delay:240ms]">
          Rooms, a family restaurant and spaces for celebrations beside Khandoli Dam.
        </p>
        <div className="animate-rise mt-10 flex flex-col gap-3 [animation-delay:360ms] sm:flex-row">
          <Button href={ROUTES.book}>Send a Booking Enquiry</Button>
          <Button href="#welcome" variant="outlineLight">Explore the Resort</Button>
        </div>
      </div>
    </section>
  );
}
