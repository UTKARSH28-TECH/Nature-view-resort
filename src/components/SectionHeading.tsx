type Props = {
  eyebrow: string;
  title: string;
  id: string;
  children?: React.ReactNode;
  light?: boolean;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, id, children, light, align = "left" }: Props) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${light ? "text-sand-200" : "text-clay-600"}`}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-3 font-display text-4xl leading-[1.1] sm:text-5xl ${light ? "text-white" : "text-forest-950"}`}
      >
        {title}
      </h2>
      {children && (
        <p className={`mt-5 text-base leading-relaxed sm:text-lg ${light ? "text-sand-100" : "text-ink-soft"}`}>
          {children}
        </p>
      )}
    </div>
  );
}
