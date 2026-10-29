"use client";

import { useMemo, useState } from "react";
import { MENU, rupees, tidyName, titleCase, type MenuItem } from "@/data/menu";

function Price({ item }: { item: MenuItem }) {
  if (item.prices.length === 1) return <span className="font-semibold tabular-nums">{rupees(item.prices[0])}</span>;
  return (
    <span className="flex flex-col items-end gap-0.5 sm:flex-row sm:gap-3">
      {item.prices.map((p, i) => (
        <span key={i} className="whitespace-nowrap tabular-nums">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">{item.variants?.[i]} </span>
          <span className="font-semibold">{rupees(p)}</span>
        </span>
      ))}
    </span>
  );
}

export function MenuExplorer({ onShowPrinted }: { onShowPrinted?: (page: number) => void }) {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const sections = useMemo(
    () =>
      MENU.filter((c) => category === "all" || c.id === category)
        .map((c) => ({ ...c, items: q ? c.items.filter((i) => tidyName(i.name).toLowerCase().includes(q)) : c.items }))
        .filter((c) => c.items.length > 0),
    [category, q],
  );
  const total = sections.reduce((n, c) => n + c.items.length, 0);

  return (
    <div>
      <div className="sticky top-[4.5rem] z-30 -mx-5 border-t border-forest-900/10 bg-sand-50 px-5 py-3 sm:-mx-8 sm:px-8">
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, e.g. paneer, noodles, soup"
            autoComplete="off"
            className="h-12 w-full border border-forest-900/25 bg-white pl-10 pr-4 text-base text-ink placeholder:text-ink-soft"
          />
        </div>
      </div>

      {/* Chips stay pinned under the search box on phones (one scrolling row); on larger screens they scroll away to save space. */}
      <div
        role="group"
        aria-label="Filter by section"
        className="sticky top-[9rem] z-20 -mx-5 flex gap-2 overflow-x-auto border-b border-forest-900/10 bg-sand-50 px-5 pb-3 sm:static sm:mx-0 sm:flex-wrap sm:border-0 sm:px-0 sm:pb-0 sm:pt-1"
      >
        {[{ id: "all", title: "All" }, ...MENU].map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-forest-900 bg-forest-900 text-sand-50"
                  : "border-forest-900/25 bg-white text-forest-950 hover:border-forest-900"
              }`}
            >
              {titleCase(c.title)}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-ink-soft" role="status" aria-live="polite">
        {total === 0
          ? ""
          : q || category !== "all"
            ? `${total} ${total === 1 ? "dish" : "dishes"} shown`
            : `${total} dishes in ${sections.length} sections`}
      </p>

      {total === 0 ? (
        <div className="mt-8 border border-forest-900/15 bg-sand-100 p-8 text-center">
          <p className="font-display text-2xl text-forest-950">No dishes match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-2 text-base text-ink-soft">Check the spelling, or try a shorter word such as &ldquo;paneer&rdquo; or &ldquo;rice&rdquo;.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="mt-5 border border-forest-900 px-5 py-2.5 text-sm font-semibold text-forest-900 hover:bg-forest-900 hover:text-sand-50"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-12">
          {sections.map((c) => (
            <section key={c.id} id={`menu-${c.id}`} aria-labelledby={`h-${c.id}`} className="scroll-mt-52 sm:scroll-mt-32">
              <div className="flex items-baseline justify-between gap-4 border-b border-forest-900/20 pb-3">
                <h3 id={`h-${c.id}`} className="font-display text-3xl text-forest-950">
                  {titleCase(c.title)}
                </h3>
                {onShowPrinted && (
                  <button
                    type="button"
                    onClick={() => onShowPrinted(c.page)}
                    className="shrink-0 text-sm font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700"
                  >
                    Printed page {c.page}
                  </button>
                )}
              </div>
              <ul className="divide-y divide-forest-900/10">
                {c.items.map((item) => (
                  <li key={item.name} className="flex items-start justify-between gap-4 py-3.5">
                    <span className="text-base leading-snug text-ink">{tidyName(item.name)}</span>
                    <Price item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
