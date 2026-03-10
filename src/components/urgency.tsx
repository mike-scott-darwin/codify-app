"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";
import { useState, useEffect, useRef } from "react";

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const num = parseInt(value.replace(/[^0-9]/g, ""));
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current || isNaN(num)) return;
    hasAnimated.current = true;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, num]);

  return <>{display}%</>;
}

export function Urgency() {
  const { ref, inView } = useInView(0.1);
  const { urgency } = siteConfig;
  const [visibleLines, setVisibleLines] = useState(0);
  const hasTyped = useRef(false);

  useEffect(() => {
    if (!inView || hasTyped.current) return;
    hasTyped.current = true;
    const total = urgency.terminal.lines.length;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= total) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [inView, urgency.terminal.lines.length]);

  const lineColor = (type: string) => {
    switch (type) {
      case "growth": return "text-green font-bold";
      case "warning": return "text-amber";
      case "result": return "text-white font-bold";
      case "blank": return "";
      default: return "text-muted";
    }
  };

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-amber mb-4">
          {urgency.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-16"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          {urgency.headline}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Terminal market status */}
          <div
            className={`transition-all duration-600 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="bg-surface border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red opacity-60" />
                <div className="w-3 h-3 rounded-full bg-amber opacity-60" />
                <div className="w-3 h-3 rounded-full bg-green opacity-60" />
                <span className="ml-2 font-mono text-xs text-dim">market-status</span>
              </div>
              <div className="p-6 font-mono text-sm leading-loose">
                <p className="text-green mb-4">
                  <span className="text-dim">❯ </span>
                  {urgency.terminal.command}
                </p>
                {urgency.terminal.lines.map((line, i) => (
                  <p
                    key={i}
                    className={`transition-all duration-300 ${lineColor(line.type)} ${
                      i < visibleLines
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2"
                    }`}
                    style={{ minHeight: line.type === "blank" ? "1.5em" : undefined }}
                  >
                    {line.text}
                  </p>
                ))}
                {visibleLines >= urgency.terminal.lines.length && (
                  <span className="animate-blink text-green">█</span>
                )}
              </div>
            </div>

            {/* Big stat */}
            <div className="mt-8 text-center">
              <div className="font-mono font-bold text-green" style={{ fontSize: "var(--text-4xl)" }}>
                <AnimatedNumber value="47" inView={inView} />
              </div>
              <p className="font-mono text-xs text-dim uppercase tracking-wider mt-1">
                year-over-year market growth
              </p>
            </div>
          </div>

          {/* Timeline cards */}
          <div className="flex flex-col gap-4">
            {urgency.cards.map((card, i) => (
              <div
                key={card.label}
                className={`bg-surface border border-border p-6 transition-all duration-600 ${
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${(i + 2) * 200}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-black bg-green px-2 py-0.5 font-bold">
                    {card.label}
                  </span>
                  <h3 className="font-mono font-bold text-white">
                    {card.title}
                  </h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing line */}
        <div
          className={`text-center transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "1200ms" }}
        >
          <p
            className="font-mono font-bold text-white max-w-[700px] mx-auto"
            style={{ fontSize: "var(--text-xl)" }}
          >
            {urgency.closingLine}
          </p>
        </div>
      </div>
    </section>
  );
}
