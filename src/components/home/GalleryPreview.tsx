import Link from "next/link";
import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { ROUTES } from "@/lib/site";

// Only approved images. `kitty party` and `winter -1` stay out until consent is confirmed.
const TILES = [
  { src: "/images/rooms/twin-balcony.webp", alt: "Glass-railed balcony looking over a rocky hill and a lake", span: "col-span-2 row-span-2" },
  { src: "/images/events/restaurant-hall-evening.webp", alt: "Dining hall with red drapes, a long table and a floral backdrop", span: "col-span-2" },
  { src: "/images/food/gulab-jamun.webp", alt: "Tray of gulab jamun", span: "" },
  { src: "/images/rooms/deluxe-bed.webp", alt: "Deluxe room bed with a panelled headboard and warm lighting", span: "" },
  { src: "/images/khandoli/hill-and-park.webp", alt: "Khandoli hill above a landscaped park with pine trees", span: "col-span-2" },
  { src: "/images/khandoli/lake-and-jetty.webp", alt: "Reservoir with a jetty, trees and a road in the foreground", span: "col-span-2" },
];

export function GalleryPreview() {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow="Gallery" title="A closer look" id="gallery-heading" />
        <Button href={ROUTES.gallery} variant="text" className="shrink-0">
          Open the gallery<span aria-hidden="true"> →</span>
        </Button>
      </div>

      <ul className="mt-12 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-4">
        {TILES.map((t) => (
          <li key={t.src} className={`group ${t.span}`}>
            <Link href={ROUTES.gallery} className="block h-full" aria-label={`Open gallery: ${t.alt}`}>
              <Photo
                src={t.src}
                alt=""
                sizes="(min-width: 640px) 25vw, 50vw"
                className="h-full"
                imgClassName="transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
