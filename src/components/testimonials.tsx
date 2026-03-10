"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Testimonials() {
  const { ref, inView } = useInView(0.1);
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

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.items.map((item, i) => (
            <div
              key={item.name}
              className={`bg-surface border border-border p-8 flex flex-col transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Result badge */}
              <div className="font-mono text-xs text-green bg-green/10 border border-green/20 px-3 py-1.5 inline-block self-start mb-5">
                {item.result}
              </div>

              {/* Quote */}
              <blockquote className="text-white text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div
                  className="w-10 h-10 rounded-full bg-blue/20 border border-blue/30 flex items-center justify-center font-mono text-blue text-sm font-bold"
                >
                  {item.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-mono text-white text-sm font-bold">
                    {item.name}
                  </p>
                  <p className="font-mono text-dim text-xs">
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
