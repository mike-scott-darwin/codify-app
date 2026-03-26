"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Mechanism() {
  const { ref, inView } = useInView(0.1);
  const { mechanism } = siteConfig;

  return (
    <section
      id="mechanism"
      ref={ref}
      className="py-16 md:py-20 border-t border-border"
    >
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {mechanism.eyebrow}
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {mechanism.headline}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mechanism.steps.map((step, i) => (
            <div
              key={step.label}
              className={`relative transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Step number */}
              <div className="text-5xl font-bold text-white/10 mb-4">
                {step.label}
              </div>

              <h3 className="font-semibold text-white text-xl mb-3">
                {step.title}
              </h3>

              <p className="text-muted text-sm leading-relaxed mb-4">
                {step.description}
              </p>

              <div className="flex items-center gap-2 text-green text-sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8l3.5 3.5L13 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {step.outcome}
              </div>

              {/* Connector line (hidden on last item and mobile) */}
              {i < mechanism.steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-[2px] bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
