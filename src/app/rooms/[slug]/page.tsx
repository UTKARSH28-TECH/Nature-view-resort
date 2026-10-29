import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { RoomGallery } from "@/components/rooms/RoomGallery";
import { ROOM_LIST, ROOM_PHOTO_NOTE, bookRoomHref, getRoom, roomHref } from "@/lib/rooms";
import { LINKS, ROUTES, SITE } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ROOM_LIST.map((r) => ({ slug: r.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const room = getRoom((await params).slug);
  if (!room) return {};
  return {
    title: room.name,
    description: room.metaDescription,
    alternates: { canonical: roomHref(room.slug) },
    openGraph: { title: room.name, description: room.metaDescription, images: [{ url: room.gallery[0].src }] },
  };
}

export default async function RoomPage({ params }: { params: Promise<Params> }) {
  const room = getRoom((await params).slug);
  if (!room) notFound();
  const others = ROOM_LIST.filter((r) => r.slug !== room.slug);
  const hero = room.gallery.find((p) => !p.portrait) ?? room.gallery[0];

  return (
    <>
      <PageHero eyebrow="Rooms & Suites" title={room.name} image={hero.src} alt={hero.alt}>
        {room.intro}
      </PageHero>

      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href={ROUTES.home} className="underline-offset-4 hover:underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={ROUTES.rooms} className="underline-offset-4 hover:underline">Rooms</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-forest-950">{room.name}</li>
          </ol>
        </nav>
      </div>

      <section aria-labelledby="room-details" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="room-details" className="sr-only">{room.name} photographs</h2>
            <RoomGallery photos={room.gallery} roomName={room.name} />
          </div>

          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl text-forest-950 sm:text-4xl">About this room</h2>
            {room.description.map((p) => (
              <p key={p} className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{p}</p>
            ))}

            <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">
              Seen in the photographs
            </h3>
            <ul className="mt-4 space-y-3 text-base text-ink-soft">
              {room.seenInPhotos.map((f) => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-clay-600" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              This list reflects what is visible in the photos. For rates, occupancy and the full amenity list, send an
              enquiry or call us.
            </p>

            <div className="mt-8 border border-forest-900/15 bg-sand-100 p-6">
              <p className="font-display text-2xl text-forest-950">Interested in this room?</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Send an enquiry with your dates. It does not guarantee availability or confirm a reservation; the resort
                will contact you.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button href={bookRoomHref(room.slug)}>Enquire About This Room</Button>
                <Button href={LINKS.tel} variant="outline">Call {SITE.phoneDisplay}</Button>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-12 max-w-3xl text-sm leading-relaxed text-ink-soft">{ROOM_PHOTO_NOTE}</p>
      </section>

      <section aria-labelledby="other-rooms" className="bg-sand-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 id="other-rooms" className="font-display text-3xl text-forest-950 sm:text-4xl">Other rooms</h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug} className="group">
                <Link href={roomHref(o.slug)} className="block" aria-label={`${o.name}: view room details`}>
                  <Photo
                    src={o.image}
                    alt={o.alt}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="aspect-[3/2]"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <h3 className="mt-5 font-display text-2xl text-forest-950">{o.name}</h3>
                </Link>
                <p className="mt-2 text-base text-ink-soft">{o.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
