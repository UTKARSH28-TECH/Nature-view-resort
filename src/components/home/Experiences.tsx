import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ROUTES } from "@/lib/site";

export function Experiences() {
  return (
    <section id="experiences" aria-labelledby="experiences-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="lg:pt-6">
          <SectionHeading eyebrow="The Resort" title="Open lawns, red roofs and evening light" id="experiences-heading">
            The grounds are laid out with lawns, landscaped paths and red-roofed pavilions, and the property is lit up
            after dark.
          </SectionHeading>
          <Button href={`${ROUTES.gallery}#resort`} variant="text" className="mt-8">
            See the resort in photos<span aria-hidden="true"> →</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <Photo
            src="/images/resort/cottages-dusk.webp"
            alt="Lit red-roofed pavilions around a lawn at sunset"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="col-span-2 aspect-[16/9]"
          />
          <Photo
            src="/images/resort/aerial-night.webp"
            alt="Aerial night view of the resort grounds with the entrance and lit pavilions"
            sizes="(min-width: 1024px) 27vw, 50vw"
            className="aspect-[4/3]"
          />
          <Photo
            src="/images/hero/resort-and-hill.webp"
            alt="Resort lawn and buildings in front of a rocky hill"
            sizes="(min-width: 1024px) 27vw, 50vw"
            className="aspect-[4/3]"
          />
        </div>
      </div>
    </section>
  );
}
