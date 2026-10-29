import Link from "next/link";
import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { bookRoomHref, roomHref } from "@/lib/rooms";
import { ROOMS, ROUTES } from "@/lib/site";

export function FeaturedRooms() {
  return (
    <section id="rooms" aria-labelledby="rooms-heading" className="bg-sand-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Rooms & Suites" title="Choose your room" id="rooms-heading">
            Three room categories. Send an enquiry for your preferred dates; the resort will confirm availability and
            pricing with you directly.
          </SectionHeading>
          <Button href={ROUTES.rooms} variant="text" className="shrink-0">
            View all rooms<span aria-hidden="true"> →</span>
          </Button>
        </div>

        <ul className="mt-14 grid gap-10 md:grid-cols-3">
          {ROOMS.map((room) => (
            <li key={room.slug} className="group flex flex-col">
              <Link href={roomHref(room.slug)} className="block" aria-label={`${room.name}: view details`}>
                <Photo
                  src={room.image}
                  alt={room.alt}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[4/3]"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <h3 className="mt-6 font-display text-2xl leading-snug text-forest-950">{room.name}</h3>
              <p className="mt-2 flex-1 text-base leading-relaxed text-ink-soft">{room.summary}</p>
              <div className="mt-5 flex items-center gap-6">
                <Button href={roomHref(room.slug)} variant="text">
                  View room
                </Button>
                <Button href={bookRoomHref(room.slug)} variant="text">
                  Enquire
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
