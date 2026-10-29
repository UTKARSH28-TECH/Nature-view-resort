import Link from "next/link";
import { Button } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { bookRoomHref, roomHref, type RoomDetail } from "@/lib/rooms";

/** Listing entry: lead photo, two previews, summary and actions. `flip` swaps sides on large screens. */
export function RoomCard({ room, flip, priority }: { room: RoomDetail; flip?: boolean; priority?: boolean }) {
  const [lead, ...rest] = room.gallery;
  const previews = rest.slice(0, 2);
  const headingId = `${room.slug}-heading`;

  return (
    <article id={room.slug} aria-labelledby={headingId} className="scroll-mt-24 grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <Link href={roomHref(room.slug)} className="group block" aria-label={`${room.name}: view room details`}>
          <Photo
            src={lead.src}
            alt={lead.alt}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="aspect-[3/2]"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
        </Link>
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {previews.map((p) => (
            <li key={p.src}>
              <Link href={roomHref(room.slug)} tabIndex={-1} aria-hidden="true" className="group block">
                <Photo
                  src={p.src}
                  alt=""
                  sizes="(min-width: 1024px) 19vw, 33vw"
                  className="aspect-[4/3]"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={roomHref(room.slug)}
              className="flex aspect-[4/3] items-center justify-center bg-sand-100 px-2 text-center text-sm font-semibold text-forest-900 transition-colors hover:bg-sand-200"
            >
              All {room.gallery.length} photos
            </Link>
          </li>
        </ul>
      </div>

      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <h2 id={headingId} className="font-display text-3xl leading-tight text-forest-950 sm:text-4xl">
          {room.name}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{room.intro}</p>
        <ul className="mt-6 space-y-2 text-sm text-ink-soft">
          {room.seenInPhotos.slice(0, 3).map((f) => (
            <li key={f} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-clay-600" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={bookRoomHref(room.slug)}>Enquire Now</Button>
          <Button href={roomHref(room.slug)} variant="outline">
            View Room Details
          </Button>
        </div>
      </div>
    </article>
  );
}
