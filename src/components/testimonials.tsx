"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Testimonials() {
  const { ref, inView } = useInView(0.05);
  const { testimonials } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          {testimonials.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-6"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          {testimonials.headline}
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-[600px] mb-16">
          {testimonials.description}
        </p>

        {/* Masonry-style grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.items.map((item, i) => (
            <div
              key={item.name + item.result}
              className={`break-inside-avoid bg-surface border border-border p-6 flex flex-col transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Result badge */}
              <div className="font-mono text-[11px] text-green bg-green/10 border border-green/20 px-2.5 py-1 inline-block self-start mb-4">
                {item.result}
              </div>

              {/* Quote */}
              <blockquote className="text-white text-sm leading-relaxed mb-5 flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-blue/20 border border-blue/30 flex items-center justify-center font-mono text-blue text-[11px] font-bold shrink-0">
                  {item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-mono text-white text-xs font-bold">
                    {item.name}
                  </p>
                  <p className="font-mono text-dim text-[10px]">
                    {item.context}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
