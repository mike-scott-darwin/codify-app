"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

function AnimatedNumber({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setMounted(true);
    setDisplay(0);
  }, []);

  useEffect(() => {
    if (!active || !mounted) return;
    const duration = 1800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [active, value, mounted]);

  return <>{display}</>;
}

export function Proof() {
  const { ref, inView } = useInView(0.1);
  const { proof } = siteConfig;

  return (
    <section id="proof" ref={ref} className="py-10 md:py-20 border-t border-border">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {proof.eyebrow}
          </p>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {proof.headline}
          </h2>
          <p className="text-muted text-lg max-w-[640px] mx-auto leading-relaxed">
            {proof.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {proof.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedNumber
                  value={parseInt(stat.value)}
                  active={inView}
                />
                <span className="text-blue">{stat.suffix}</span>
              </div>
              <div className="text-sm text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Before / After */}
        <div
          className={`grid md:grid-cols-2 gap-6 transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="bg-surface border border-border rounded-xl p-8">
            <h3 className="text-sm font-semibold text-red uppercase tracking-wider mb-6">
              Before Codify
            </h3>
            <ul className="space-y-4">
              {proof.before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="text-red shrink-0 mt-0.5">&#x2717;</span>
                  <span className="text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-green/20 rounded-xl p-8">
            <h3 className="text-sm font-semibold text-green uppercase tracking-wider mb-6">
              After Codify
            </h3>
            <ul className="space-y-4">
              {proof.after.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="text-green shrink-0 mt-0.5">&#x2713;</span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
