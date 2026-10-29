import Link from "next/link";
import { ROUTES, SITE } from "@/lib/site";

/** Typographic wordmark; replace with the official logo file when supplied. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href={ROUTES.home} aria-label={`${SITE.name} home`} className="leading-none">
      <span className={`block font-display text-2xl font-semibold tracking-wide sm:text-[1.7rem] ${light ? "text-white" : "text-forest-950"}`}>
        {SITE.shortName}
      </span>
      <span className={`mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.32em] ${light ? "text-sand-200" : "text-clay-600"}`}>
        Resort · Khandoli
      </span>
    </Link>
  );
}
