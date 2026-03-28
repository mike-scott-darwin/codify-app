"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Testimonials() {
  const { ref, inView } = useInView(0.05);
  const { testimonials } = siteConfig;

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-10 md:py-20 border-t border-border"
    >
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {testimonials.eyebrow}
          </p>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {testimonials.headline}
          </h2>
          {"description" in testimonials && (
            <p className="text-muted text-sm max-w-[500px] mx-auto">
              {testimonials.description}
            </p>
          )}
        </div>

        {/* Masonry-style columns for varied-length quotes */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.items.map((item, i) => (
            <div
              key={item.name + item.result}
              className={`break-inside-avoid bg-surface border border-border rounded-xl p-6 flex flex-col transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Result badge */}
              <div className="text-xs text-green bg-green/10 border border-green/20 px-3 py-1 rounded-full inline-block self-start mb-4">
                {item.result}
              </div>

              {/* Quote */}
              <blockquote className="text-white text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-blue/15 border border-blue/25 flex items-center justify-center text-blue text-xs font-semibold shrink-0">
                  {item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  {"context" in item && (
                    <p className="text-dim text-xs">{item.context}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
