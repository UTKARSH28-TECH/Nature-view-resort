import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { LINKS, ROUTES, SITE } from "@/lib/site";

export function ContactCta() {
  return (
    <section aria-labelledby="contact-heading" className="bg-sand-100 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20">
        <SectionHeading eyebrow="Contact" title="Plan your visit" id="contact-heading">
          Call or message us to ask about rooms, the restaurant or an event. We reply to enquiries personally.
        </SectionHeading>
        <div>
          <address className="text-base not-italic leading-relaxed text-ink-soft">
            {SITE.address.lines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
            <span className="block">PIN {SITE.address.postalCode}</span>
          </address>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button href={LINKS.tel}>Call {SITE.phoneDisplay}</Button>
            <Button href={LINKS.whatsapp} variant="outline" target="_blank" rel="noopener noreferrer">
              WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </Button>
            <Button href={LINKS.directions} variant="outline" target="_blank" rel="noopener noreferrer">
              Get Directions<span className="sr-only"> (opens in a new tab)</span>
            </Button>
            <Button href={ROUTES.book} variant="outline">Booking Enquiry</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
