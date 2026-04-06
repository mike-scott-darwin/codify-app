"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Problem() {
  const { ref, inView } = useInView(0.1);
  const { problem } = siteConfig;

  return (
    <section ref={ref} className="py-8 md:py-20 border-t border-border">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="text-center mb-6 md:mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-2 md:mb-4">
            {problem.eyebrow}
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {problem.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {problem.items.map((item, i) => (
            <div
              key={item.title}
              className={`bg-surface border border-border rounded-xl p-5 md:p-8 transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="mb-4">
                <div className="text-3xl font-bold text-red mb-1">
                  {item.stat}
                </div>
                <div className="text-[11px] text-dim uppercase tracking-wider">
                  {item.statLabel}
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
