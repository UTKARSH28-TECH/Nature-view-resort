import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/** Fills its own relatively-positioned box; give `className` an aspect ratio or height. */
export function Photo({ src, alt, sizes, className = "", imgClassName = "", priority }: Props) {
  return (
    <div className={`relative overflow-hidden bg-sand-200 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${imgClassName}`}
      />
    </div>
  );
}
