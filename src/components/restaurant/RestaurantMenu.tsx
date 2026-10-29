"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MENU_PAGES, MENU_PAGE_COUNT, MENU_PDF } from "@/data/menu";
import { SectionHeading } from "@/components/SectionHeading";
import { MenuExplorer } from "./MenuExplorer";

/** Digital menu plus the printed menu pages with a zoomable viewer. Client-side for search, filters and the dialog. */
export function RestaurantMenu() {
  const [openPage, setOpenPage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const open = useCallback((page: number) => {
    lastTrigger.current = document.activeElement as HTMLElement | null;
    setZoom(false);
    setOpenPage(page);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (openPage !== null && !d.open) d.showModal();
    if (openPage === null && d.open) d.close();
  }, [openPage]);

  const close = () => {
    setOpenPage(null);
    lastTrigger.current?.focus();
  };
  const go = (delta: number) =>
    setOpenPage((p) => (p === null ? p : ((p - 1 + delta + MENU_PAGE_COUNT) % MENU_PAGE_COUNT) + 1));

  const current = openPage ? MENU_PAGES[openPage - 1] : null;

  return (
    <>
      <section id="menu" aria-labelledby="menu-heading" className="scroll-mt-20 mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading eyebrow="The Menu" title="Browse the full menu" id="menu-heading">
          Vegetarian and non-vegetarian dishes with prices in rupees, as printed on the restaurant&rsquo;s menu card.
          Search by dish name, or jump to a section.
        </SectionHeading>
        <div className="mt-10">
          <MenuExplorer onShowPrinted={open} />
        </div>
        <p className="mt-10 border-t border-forest-900/15 pt-6 text-sm leading-relaxed text-ink-soft">
          Prices and dishes are as printed on the current menu card and may change; please confirm with the restaurant.
          Where two prices are shown they are labelled as on the card (F/H, or Plain/Butter). Spellings follow the
          printed card. This website does not take online orders.
        </p>
      </section>

      <section id="printed-menu" aria-labelledby="printed-heading" className="bg-sand-100 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Printed menu" title="The menu card, page by page" id="printed-heading">
              Open any page to view the original card, and zoom in if you like.
            </SectionHeading>
            <a
              href={MENU_PDF}
              download
              className="inline-flex shrink-0 items-center justify-center border border-forest-900 px-6 py-3 text-sm font-semibold tracking-wide text-forest-900 transition-colors hover:bg-forest-900 hover:text-sand-50"
            >
              Download menu (PDF)
            </a>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
            {MENU_PAGES.map((p) => (
              <li key={p.page}>
                <button
                  type="button"
                  onClick={() => open(p.page)}
                  className="group block w-full text-left"
                >
                  <span className="relative block aspect-[3/4] overflow-hidden border border-forest-900/15 bg-sand-200">
                    <Image
                      src={p.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 30vw, 46vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-forest-950">Page {p.page}</span>
                  <span className="block text-xs leading-snug text-ink-soft">{p.sections.join(" · ")}</span>
                  <span className="sr-only"> (opens the page viewer)</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        onClose={() => {
          setOpenPage(null);
          lastTrigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        aria-label="Printed menu viewer"
        className="m-auto h-[94svh] w-[min(96vw,56rem)] max-w-none bg-sand-50 p-0 backdrop:bg-forest-950/80"
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-forest-900/15 px-4 py-3">
              <p className="min-w-0 whitespace-nowrap text-sm text-forest-950" aria-live="polite">
                <span className="font-semibold">
                  Page {current.page} of {MENU_PAGE_COUNT}
                </span>
                <span className="hidden text-ink-soft sm:inline"> · {current.sections.join(", ")}</span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => go(-1)} className="h-10 border border-forest-900/30 px-3 text-sm font-semibold" >
                  <span aria-hidden="true">‹ </span>Prev<span className="sr-only">ious page</span>
                </button>
                <button type="button" onClick={() => go(1)} className="h-10 border border-forest-900/30 px-3 text-sm font-semibold" >
                  Next<span className="sr-only"> page</span><span aria-hidden="true"> ›</span>
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => !z)}
                  aria-pressed={zoom}
                  className="h-10 border border-forest-900/30 px-3 text-sm font-semibold"
                >
                  {zoom ? "Fit page" : "Zoom in"}
                </button>
                <button type="button" onClick={close} className="h-10 bg-forest-900 px-4 text-sm font-semibold text-sand-50" autoFocus>
                  Close
                </button>
              </div>
            </div>
            {/* Scrollable when zoomed: focusable so keyboard users can scroll it with the arrow keys. */}
            <div
              tabIndex={0}
              role="region"
              aria-label={`Printed menu page ${current.page}, scrollable`}
              className="min-h-0 flex-1 overflow-auto bg-sand-200"
            >
              <Image
                key={current.page}
                src={current.src}
                alt={`Printed menu page ${current.page}: ${current.sections.join(", ")}`}
                width={1530}
                height={2040}
                sizes={zoom ? "200vw" : "(min-width: 896px) 56rem, 96vw"}
                className={`h-auto max-w-none ${zoom ? "w-[200%] sm:w-[160%]" : "w-full"}`}
              />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
