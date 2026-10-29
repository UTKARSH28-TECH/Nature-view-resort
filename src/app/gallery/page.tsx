import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";
import { LINKS, ROUTES, SITE } from "@/lib/site";
import { GALLERY } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Photographs of Nature View Resort near Khandoli Dam, Giridih: the resort and grounds, rooms and suites, the restaurant, events and the Khandoli landscape.",
  alternates: { canonical: ROUTES.gallery },
};

export default function GalleryPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pt-36">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Gallery</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] text-forest-950 sm:text-6xl">
          Nature View Resort in photographs
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
          {GALLERY.length} photographs of the resort, its rooms, restaurant and events, and the landscape of Khandoli.
          Tap any photo to view it larger.
        </p>

        <div className="mt-12">
          <GalleryExplorer />
        </div>
      </div>

      <section aria-labelledby="gallery-cta" className="bg-sand-100 py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center">
          <div>
            <h2 id="gallery-cta" className="font-display text-3xl text-forest-950 sm:text-4xl">
              Like what you see?
            </h2>
            <p className="mt-2 max-w-xl text-base text-ink-soft">
              Send a room enquiry, or call {SITE.phoneDisplay} to ask about a stay, a meal or an event.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={ROUTES.rooms}>View Rooms</Button>
            <Button href={ROUTES.book} variant="outline">Booking Enquiry</Button>
            <Button href={ROUTES.khandoli} variant="outline">Discover Khandoli</Button>
            <Button href={LINKS.tel} variant="text">Call us</Button>
          </div>
        </div>
      </section>
    </>
  );
}
