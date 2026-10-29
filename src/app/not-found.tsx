import { Button } from "@/components/Button";
import { LINKS, ROUTES, SITE } from "@/lib/site";

export const metadata = { title: "Page coming soon" };

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-3xl flex-col items-start justify-center px-5 pb-20 pt-36 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">Page not available yet</p>
      <h1 className="mt-3 font-display text-5xl text-forest-950">We&rsquo;re still preparing this page</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        This part of the {SITE.name} website isn&rsquo;t ready. In the meantime, you can call us on{" "}
        <a className="underline underline-offset-4" href={LINKS.tel}>{SITE.phoneDisplay}</a>.
      </p>
      <Button href={ROUTES.home} className="mt-8">Back to the homepage</Button>
    </section>
  );
}
