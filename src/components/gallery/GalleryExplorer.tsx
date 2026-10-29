"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GALLERY, GALLERY_GROUPS, groupLabel, type GalleryGroupId } from "@/data/gallery";

type Filter = "all" | GalleryGroupId;

const isFilter = (v: string): v is Filter => v === "all" || GALLERY_GROUPS.some((g) => g.id === v);

export function GalleryExplorer() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

  // Deep links such as /gallery#khandoli preselect a group.
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      setFilter(isFilter(h) ? h : "all");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const choose = (f: Filter) => {
    setFilter(f);
    history.replaceState(null, "", f === "all" ? window.location.pathname : `#${f}`);
  };

  const photos = useMemo(() => (filter === "all" ? GALLERY : GALLERY.filter((p) => p.group === filter)), [filter]);
  const note = filter === "all" ? undefined : GALLERY_GROUPS.find((g) => g.id === filter)?.note;
  const counts = useMemo(
    () => Object.fromEntries(GALLERY_GROUPS.map((g) => [g.id, GALLERY.filter((p) => p.group === g.id).length])),
    [],
  );

  const open = (i: number, el: HTMLElement) => {
    trigger.current = el;
    setOpenIndex(i);
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (openIndex !== null && !d.open) d.showModal();
    if (openIndex === null && d.open) d.close();
  }, [openIndex]);

  const step = useCallback(
    (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  const current = openIndex !== null ? photos[openIndex] : null;

  return (
    <div>
      <div
        role="group"
        aria-label="Filter photographs by group"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {[{ id: "all" as const, label: "All photos", n: GALLERY.length }, ...GALLERY_GROUPS.map((g) => ({ id: g.id, label: g.label, n: counts[g.id] }))].map(
          (g) => {
            const active = filter === g.id;
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={active}
                onClick={() => choose(g.id)}
                className={`shrink-0 border px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-forest-900 bg-forest-900 text-sand-50"
                    : "border-forest-900/25 bg-white text-forest-950 hover:border-forest-900"
                }`}
              >
                {g.label} <span className={active ? "text-sand-200" : "text-ink-soft"}>({g.n})</span>
              </button>
            );
          },
        )}
      </div>

      <p className="mt-5 min-h-[1.5rem] text-sm text-ink-soft" role="status" aria-live="polite">
        {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
        {filter !== "all" ? ` · ${groupLabel(filter)}` : ""}
        {note ? ` · ${note}` : ""}
      </p>

      <ul className="mt-6 columns-2 gap-3 sm:gap-4 lg:columns-3">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              aria-label={`Open photo: ${p.caption}`}
              className="group relative block w-full overflow-hidden bg-sand-200"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/80 to-transparent px-3 pb-2.5 pt-8 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {p.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClose={() => {
          setOpenIndex(null);
          trigger.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        className="on-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-forest-950 p-0 text-white backdrop:bg-black"
      >
        {current && (
          <div
            className="flex h-full flex-col"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="text-sm text-sand-100" aria-live="polite">
                {(openIndex ?? 0) + 1} / {photos.length}
                <span className="hidden sm:inline"> · {groupLabel(current.group)}</span>
              </p>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                autoFocus
                className="inline-flex h-11 items-center gap-2 border border-white/60 px-4 text-sm font-semibold hover:bg-white hover:text-forest-950"
              >
                Close
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <Image
                key={current.id}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-forest-950/70 text-2xl hover:bg-forest-950 sm:left-4"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-forest-950/70 text-2xl hover:bg-forest-950 sm:right-4"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>

            <div className="px-4 py-4 text-center sm:px-6">
              <p className="font-display text-xl text-white sm:text-2xl">{current.caption}</p>
              {GALLERY_GROUPS.find((g) => g.id === current.group)?.note && (
                <p className="mt-1 text-xs text-sand-200">{GALLERY_GROUPS.find((g) => g.id === current.group)?.note}</p>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
