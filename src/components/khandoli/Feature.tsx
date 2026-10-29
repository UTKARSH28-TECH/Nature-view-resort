import { Photo } from "@/components/Photo";

export type FeaturePhoto = {
  src: string;
  alt: string;
  /** Says where the photo comes from so visitors are not misled about what is on the property. */
  origin: "area" | "resort";
  className?: string;
};

const ORIGIN_LABEL = { area: "Khandoli area", resort: "Resort photograph" } as const;

export function Feature({
  id,
  eyebrow,
  title,
  children,
  photos,
  flip,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  photos: FeaturePhoto[];
  flip?: boolean;
}) {
  return (
    <article id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <div className={`grid grid-cols-2 gap-3 lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        {photos.map((p, i) => (
          <div
            key={p.src}
            className={`relative ${i === 0 || photos.length === 2 ? "col-span-2" : "col-span-1"} ${
              i === 0 ? "aspect-[3/2]" : photos.length === 2 ? "aspect-[21/9]" : "aspect-[4/3]"
            }`}
          >
            <Photo
              src={p.src}
              alt={p.alt}
              sizes={i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 29vw, 50vw"}
              className="h-full w-full"
              imgClassName="transition-transform duration-700 hover:scale-105"
            />
            <span className="absolute bottom-0 left-0 bg-forest-950/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-sand-50">
              {ORIGIN_LABEL[p.origin]}
            </span>
          </div>
        ))}
      </div>
      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-600">{eyebrow}</p>
        <h2 id={`${id}-heading`} className="mt-3 font-display text-3xl leading-tight text-forest-950 sm:text-4xl">
          {title}
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">{children}</div>
      </div>
    </article>
  );
}
