"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function WhyNow() {
  const { ref, inView } = useInView(0.1);
  const { whyNow } = siteConfig;

  return (
    <section ref={ref} className="py-10 md:py-20 border-t border-border">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <div className="text-center mb-8 md:mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-2 md:mb-4">
            {whyNow.eyebrow}
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {whyNow.headline}
          </h2>
        </div>

        <div className="space-y-8 md:space-y-10">
          {whyNow.statements.map((item, i) => (
            <div
              key={i}
              className={`transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <p className="text-muted text-base md:text-lg leading-relaxed mb-2">
                {item.text}
              </p>
              <p className="text-white font-semibold text-sm md:text-base border-l-2 border-blue pl-4">
                {item.highlight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
