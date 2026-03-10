"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

function AnimatedNumber({
  value,
  active,
}: {
  value: string;
  active: boolean;
}) {
  const num = parseInt(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active || isNaN(num)) return;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(num * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [active, num]);

  if (isNaN(num)) return <>{value}</>;
  return <>{display}</>;
}

export function Proof() {
  const { ref, inView } = useInView(0.1);
  const { proof } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          {proof.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-4"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          {proof.headline}
        </h2>
        <p className="text-muted text-lg max-w-[640px] mb-16 leading-relaxed">
          {proof.description}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
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
              <div className="font-mono text-4xl font-bold text-white mb-1">
                <AnimatedNumber value={stat.value} active={inView} />
                <span className="text-blue text-2xl">{stat.suffix}</span>
              </div>
              <div className="font-mono text-xs text-dim uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Before/After */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border p-8">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-red mb-6">
              Before Codification
            </div>
            <ul className="space-y-4">
              {proof.before.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="font-mono text-red shrink-0 mt-0.5">✕</span>
                  <span className="text-sm text-dim">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface border border-[#22c55e33] p-8">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-green mb-6">
              After Codification
            </div>
            <ul className="space-y-4">
              {proof.after.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="font-mono text-green shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
