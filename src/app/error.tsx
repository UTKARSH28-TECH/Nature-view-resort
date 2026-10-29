"use client";

import { Button } from "@/components/Button";
import { LINKS, ROUTES, SITE } from "@/lib/site";

/** Shown if a page crashes while rendering. Deliberately shows no error details; those stay in the server log. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-start justify-center px-5 pb-20 pt-36 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Something went wrong</p>
      <h1 className="mt-3 font-display text-5xl text-forest-950">This page couldn&rsquo;t load</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        Please try again. If it keeps happening, call {SITE.name} on{" "}
        <a className="underline underline-offset-4" href={LINKS.tel}>{SITE.phoneDisplay}</a>.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center bg-clay-600 px-6 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-clay-700"
        >
          Try again
        </button>
        <Button href={ROUTES.home} variant="outline">Back to the homepage</Button>
      </div>
    </section>
  );
}
