import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "outlineLight" | "text";

const styles: Record<Variant, string> = {
  primary: "bg-clay-600 text-white hover:bg-clay-700",
  outline: "border border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-sand-50",
  outlineLight: "border border-white/80 text-white hover:bg-white hover:text-forest-950",
  text: "text-forest-900 underline underline-offset-4 decoration-clay-600 hover:text-clay-700",
};

type Props = ComponentProps<typeof Link> & { variant?: Variant };

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    variant === "text"
      ? "inline-flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors"
      : "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold tracking-wide transition-colors";
  return <Link className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
