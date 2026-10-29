import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ROUTES } from "@/lib/site";

export function Khandoli() {
  return (
    <section id="khandoli" aria-labelledby="khandoli-heading" className="bg-sand-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Discover Khandoli" title="Hills, water and open sky" id="khandoli-heading">
          Khandoli is known for its dam and reservoir, a rocky hill and the park nearby. Boating and, in some seasons,
          migratory birds on the water are part of the scene. Wildlife sightings vary and are never guaranteed.
        </SectionHeading>

        <div className="mt-12 grid gap-4 md:grid-cols-12 md:gap-6">
          <Photo
            src="/images/khandoli/hill-sunset.webp"
            alt="The Khandoli hill silhouetted against a setting sun, reflected in the reservoir"
            sizes="(min-width: 768px) 66vw, 100vw"
            className="aspect-[16/9] md:col-span-8 md:aspect-auto md:row-span-2 md:min-h-[26rem]"
          />
          <Photo
            src="/images/khandoli/boating.webp"
            alt="Small pedal boats on the blue water of the Khandoli reservoir"
            sizes="(min-width: 768px) 33vw, 100vw"
            className="aspect-[4/3] md:col-span-4 md:aspect-auto"
          />
          <Photo
            src="/images/khandoli/birds-on-water.webp"
            alt="A group of geese swimming on the reservoir"
            sizes="(min-width: 768px) 33vw, 100vw"
            className="aspect-[4/3] md:col-span-4 md:aspect-auto"
          />
        </div>

        <Button href={ROUTES.khandoli} className="mt-10">
          Discover Khandoli
        </Button>
      </div>
    </section>
  );
}
