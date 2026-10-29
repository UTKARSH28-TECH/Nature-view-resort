"use client";

import Image from "next/image";
import { useState } from "react";
import type { RoomPhoto } from "@/lib/rooms";

/** Large viewer with thumbnails. The frame has a fixed aspect ratio so switching never shifts layout. */
export function RoomGallery({ photos, roomName }: { photos: RoomPhoto[]; roomName: string }) {
  const [active, setActive] = useState(0);
  const current = photos[active];

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-200 sm:aspect-[3/2]">
        {photos.map((p, i) => (
          <Image
            key={p.src}
            src={p.src}
            alt={p.alt}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            priority={i === 0}
            className={`transition-opacity duration-500 ${p.portrait ? "object-contain" : "object-cover"} ${
              i === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i === active ? undefined : true}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
        {current.caption} <span className="text-ink-soft">· {active + 1} of {photos.length}</span>
      </p>

      <ul className="mt-4 grid grid-cols-4 gap-3" aria-label={`${roomName} photographs`}>
        {photos.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Show photo: ${p.caption}`}
              className={`relative block aspect-[4/3] w-full overflow-hidden bg-sand-200 outline-offset-2 transition-opacity ${
                i === active ? "ring-2 ring-clay-600 ring-offset-2 ring-offset-sand-50" : "opacity-75 hover:opacity-100"
              }`}
            >
              <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 16vw, 25vw" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
