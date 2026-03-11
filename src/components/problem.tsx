"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Problem() {
  const { ref, inView } = useInView(0.1);
  const { problem } = siteConfig;

  return (
    <section ref={ref} className="py-16 md:py-20 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {problem.eyebrow}
          </p>
          <h2
            className="font-mono font-bold text-white"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {problem.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problem.items.map((item, i) => (
            <div
              key={item.title}
              className={`bg-surface border border-border p-8 transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-mono font-bold text-white text-lg">
                  {item.title}
                </h3>
                <div className="text-right ml-4 shrink-0">
                  <div className="font-mono text-2xl font-bold text-red">
                    {item.stat}
                  </div>
                  <div className="font-mono text-[10px] text-dim uppercase tracking-wider">
                    {item.statLabel}
                  </div>
                </div>
              </div>
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
