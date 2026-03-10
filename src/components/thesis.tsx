"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Thesis() {
  const { ref, inView } = useInView(0.1);
  const { thesis } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          {thesis.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-6"
          style={{ fontSize: "var(--text-4xl)" }}
        >
          {thesis.headline}
        </h2>
        <p className="text-muted text-lg max-w-[640px] mb-16 leading-relaxed">
          {thesis.description}
        </p>

        {/* Terminal-style comparison table */}
        <div
          className={`bg-surface border border-border overflow-hidden transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-border">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="font-mono text-xs text-dim ml-2">
              diff --prompting vs --codifying
            </span>
          </div>

          <div className="divide-y divide-border">
            {thesis.comparison.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border"
              >
                <div className="px-6 py-4 flex items-start gap-3 bg-[#ef444406]">
                  <span className="font-mono text-red text-sm shrink-0 mt-0.5">
                    −
                  </span>
                  <span className="text-sm text-dim">{row.market}</span>
                </div>
                <div className="px-6 py-4 flex items-start gap-3 bg-[#22c55e06]">
                  <span className="font-mono text-green text-sm shrink-0 mt-0.5">
                    +
                  </span>
                  <span className="text-sm text-foreground">{row.codify}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kicker line */}
        {"kicker" in thesis && (
          <div
            className={`mt-12 text-center transition-all duration-600 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <p
              className="font-mono font-bold text-white max-w-[700px] mx-auto"
              style={{ fontSize: "var(--text-xl)" }}
            >
              {(thesis as { kicker: string }).kicker}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
