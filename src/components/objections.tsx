"use client";

import { useState } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Objections() {
  const { ref, inView } = useInView(0.1);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { objections } = siteConfig;

  return (
    <section id="faq" ref={ref} className="py-16 md:py-20 border-t border-border">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
            FAQ
          </p>
          <h2
            className="font-mono font-bold text-white"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {objections.headline}
          </h2>
        </div>

        <div className="space-y-2">
          {objections.items.map((item, i) => (
            <div
              key={i}
              className={`border border-border transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-surface transition-colors"
              >
                <span className="font-mono text-sm text-foreground">
                  {item.question}
                </span>
                <span
                  className={`font-mono text-blue text-lg shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-[300px]" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 border-t border-border pt-4">
                  <p className="text-sm text-muted leading-relaxed">
                    {item.answer}
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
