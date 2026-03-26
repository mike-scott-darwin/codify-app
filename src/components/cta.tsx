"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function CTA() {
  const { ref, inView } = useInView(0.1);
  const { cta } = siteConfig;

  return (
    <section ref={ref} className="py-16 md:py-20 border-t border-border">
      <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
        <div
          className={`transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="font-bold text-white mb-6 whitespace-pre-line"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            {cta.headline}
          </h2>
          <p className="text-muted text-lg max-w-[540px] mx-auto mb-10 leading-relaxed whitespace-pre-line">
            {cta.subhead}
          </p>

          <a
            href={cta.ctaUrl}
            className="inline-flex items-center gap-2 bg-blue text-black font-semibold text-base px-10 py-4 rounded-lg hover:brightness-110 transition-all"
          >
            {cta.ctaText}
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
