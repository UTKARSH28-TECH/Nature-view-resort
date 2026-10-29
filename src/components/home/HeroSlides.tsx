"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/hero/resort-and-hill.webp",
    alt: "Nature View Resort's red-roofed buildings and lawn in front of a rocky green hill under a blue sky",
    label: "the resort and the hill",
    tone: "",
  },
  {
    src: "/images/hero/suite-interior.webp",
    alt: "A suite with a double bed, tan leather sofa and large windows looking over green trees and the lake",
    label: "a suite with a lake view",
    // The suite photo is bright; dim it so the white heading stays readable.
    tone: "brightness-[0.62]",
  },
] as const;

const INTERVAL_MS = 6500;

/** Full-bleed background photos for the home hero: crossfades automatically, with dots and a pause button. */
export function HeroSlides() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const running = !paused && !reduceMotion;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [running, active]);

  return (
    <>
      {SLIDES.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={index === active ? slide.alt : ""}
          aria-hidden={index === active ? undefined : true}
          fill
          priority={index === 0}
          loading="eager"
          sizes="100vw"
          className={`-z-20 object-cover transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none ${slide.tone} ${
            index === active ? "animate-drift opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-3 sm:bottom-8 sm:right-8">
        <div role="group" aria-label="Hero photos" className="flex items-center gap-1">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1} of ${SLIDES.length}: ${slide.label}`}
              aria-current={index === active ? "true" : undefined}
              className="group flex h-11 w-8 items-center justify-center focus-visible:outline-none"
            >
              <span
                className={`block h-1.5 rounded-full transition-all group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-forest-950 ${
                  index === active ? "w-7 bg-white" : "w-3 bg-white/55 group-hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Play hero photo rotation" : "Pause hero photo rotation"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-950/55 text-white backdrop-blur-sm transition-colors hover:bg-forest-950/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            {paused || reduceMotion ? (
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z" />
            ) : (
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            )}
          </svg>
        </button>
      </div>
    </>
  );
}
