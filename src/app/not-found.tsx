import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { LINKS, ROUTES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS_TO_SHOW = [
  { href: ROUTES.rooms, label: "Rooms & Suites" },
  { href: ROUTES.restaurant, label: "Restaurant & Menu" },
  { href: ROUTES.events, label: "Events" },
  { href: ROUTES.khandoli, label: "Discover Khandoli" },
  { href: ROUTES.gallery, label: "Gallery" },
  { href: ROUTES.contact, label: "Contact" },
];

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-start justify-center px-5 pb-20 pt-36 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Error 404</p>
      <h1 className="mt-3 font-display text-5xl text-forest-950">We can&rsquo;t find that page</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        The address may be mistyped or the page may have moved. Try one of these, or call {SITE.name} on{" "}
        <a className="underline underline-offset-4" href={LINKS.tel}>{SITE.phoneDisplay}</a>.
      </p>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-base">
        {LINKS_TO_SHOW.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="font-semibold text-forest-900 underline decoration-clay-600 underline-offset-4 hover:text-clay-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <Button href={ROUTES.home} className="mt-8">Back to the homepage</Button>
    </section>
  );
}
