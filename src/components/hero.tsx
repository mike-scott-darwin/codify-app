"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../site-config";

export function Hero() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const { hero } = siteConfig;

  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-28 relative overflow-hidden">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center relative z-10">
        <p
          className={`text-xs tracking-[0.2em] uppercase text-blue mb-6 transition-all duration-700 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-4"
          }`}
        >
          {hero.eyebrow}
        </p>

        <h1
          className={`font-bold text-white leading-[1.08] tracking-tight mb-6 whitespace-pre-line transition-all duration-700 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
          style={{
            fontSize: "var(--text-hero)",
            transitionDelay: "150ms",
          }}
        >
          {hero.headline}
        </h1>

        <p
          className={`text-lg md:text-xl text-muted max-w-[640px] mx-auto mb-10 leading-relaxed whitespace-pre-line transition-all duration-700 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          {hero.subhead}
        </p>

        <div
          className={`transition-all duration-700 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "450ms" }}
        >
          <a
            href={hero.ctaUrl}
            className="inline-flex items-center gap-2 bg-blue text-black font-semibold text-base px-8 py-4 rounded-lg hover:brightness-110 transition-all"
          >
            {hero.ctaText}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="ml-1"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
