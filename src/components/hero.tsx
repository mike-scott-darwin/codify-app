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
    <section className="pt-24 md:pt-32 pb-12 relative overflow-hidden">
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center relative z-10">
        <div
          className={`transition-all duration-700 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Brand mark */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="text-green font-mono text-lg">❯</span>
            <span className="font-mono text-lg font-bold text-white">
              codify
            </span>
            <span className="w-[14px] h-[22px] bg-blue animate-blink" />
          </div>
        </div>

        <div
          className={`transition-all duration-700 delay-300 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
        >
          <h1
            className="font-mono font-bold text-white leading-[1.05] tracking-tight mb-6 whitespace-pre-line"
            style={{ fontSize: "var(--text-hero)" }}
          >
            {hero.headline}
          </h1>
        </div>

        <div
          className={`transition-all duration-700 delay-500 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-lg md:text-xl text-muted max-w-[640px] mx-auto mb-10 leading-relaxed whitespace-pre-line">
            {hero.subhead}
          </p>
        </div>

        <div
          className={`flex flex-col items-center gap-3 transition-all duration-700 delay-700 ${
            revealed ? "opacity-100" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Inline email capture */}
          <div className="flex items-center w-full max-w-[480px] border border-border bg-surface overflow-hidden">
            <input
              type="email"
              placeholder="What's your email?"
              className="flex-1 bg-transparent px-5 py-3.5 font-mono text-sm text-white placeholder:text-dim outline-none"
            />
            <a
              href={hero.ctaUrl}
              className="inline-flex items-center gap-2 bg-green text-black font-mono font-bold text-sm px-6 py-3.5 hover:brightness-110 transition-all shrink-0"
            >
              {hero.ctaText}
              <span>→</span>
            </a>
          </div>
          {hero.badge && (
            <div className="flex items-center gap-2 font-mono text-xs text-dim">
              {hero.badge.dot && (
                <span className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              )}
              {hero.badge.text}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
