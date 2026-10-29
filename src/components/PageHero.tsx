import Image from "next/image";

type Props = {
  eyebrow: string;
  title: string;
  image: string;
  alt: string;
  children?: React.ReactNode;
  /** Extra content under the text, e.g. buttons. */
  actions?: React.ReactNode;
};

/** Inner-page hero. The fixed header is transparent over it, so keep a dark overlay. */
export function PageHero({ eyebrow, title, image, alt, children, actions }: Props) {
  return (
    <section className="on-dark relative isolate flex min-h-[68svh] items-end overflow-hidden bg-forest-950">
      <Image src={image} alt={alt} fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-950/40 to-forest-950/30" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sand-100">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] text-white sm:text-6xl">{title}</h1>
        {children && <p className="mt-5 max-w-xl text-lg leading-relaxed text-sand-100">{children}</p>}
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </section>
  );
}
