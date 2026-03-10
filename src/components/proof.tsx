"use client";

import { useEffect, useState } from "react";
import { useInView } from "./use-in-view";

function AnimatedNumber({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
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
  }, [active, value]);

  return <>{display}</>;
}

export function Proof() {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          THE PROOF
        </p>
        <h2
          className="font-mono font-bold text-white mb-4"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          Same prompt. Different context.
          <br />
          <span className="text-green">Different business.</span>
        </h2>
        <p className="text-muted text-lg max-w-[640px] mb-6 leading-relaxed">
          Prompts are disposable — you write one, it works once, you start over.
          Context compounds — you build it once, it informs every output, forever.
          That&apos;s leverage.
        </p>
        <p className="text-muted text-base max-w-[640px] mb-16 leading-relaxed">
          One business. Seven months. Every metric below is real. Every piece of
          content on this page was generated from the same system we sell.
        </p>

        {/* Case study terminal */}
        <div
          className={`bg-surface border border-border overflow-hidden mb-12 transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-border">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="font-mono text-xs text-dim ml-2">
              codify status --live
            </span>
          </div>

          <div className="p-8">
            <div className="font-mono text-sm text-green mb-8">
              ✓ System active — 7 months daily use, compounding
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-border">
              {[
                { value: 48, label: "reference files" },
                { value: 322, label: "git commits", plus: true },
                { value: 73, label: "research docs" },
                { value: 43, label: "decisions logged" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`transition-all duration-600 ${
                    inView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <div className="font-mono text-5xl font-bold text-white mb-1">
                    <AnimatedNumber value={stat.value} active={inView} />
                    {stat.plus && (
                      <span className="text-blue text-3xl">+</span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-dim uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* The leverage metrics */}
            <div className="font-mono text-sm space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green shrink-0">→</span>
                <div>
                  <span className="text-white font-bold">9 hours/week</span>
                  <span className="text-dim">
                    {" "}
                    to run the entire business — ads, content, email, landing
                    pages
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green shrink-0">→</span>
                <div>
                  <span className="text-white font-bold">
                    Minutes per ad batch
                  </span>
                  <span className="text-dim">
                    {" "}
                    — not hours. Context does the heavy lifting.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green shrink-0">→</span>
                <div>
                  <span className="text-white font-bold">Zero platform lock</span>
                  <span className="text-dim">
                    {" "}
                    — markdown files work with Claude, GPT, Gemini, whatever
                    comes next
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green shrink-0">→</span>
                <div>
                  <span className="text-white font-bold">
                    Every output improves the next
                  </span>
                  <span className="text-dim">
                    {" "}
                    — research feeds reference, reference feeds outputs, outputs
                    feed decisions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Before/After - terminal diff style */}
        <div
          className={`bg-surface border border-border overflow-hidden transition-all duration-600 delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-border">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="font-mono text-xs text-dim ml-2">
              diff --prompting vs --codified
            </span>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                before: "Re-explain your business every session",
                after: "AI reads 48 files before generating anything",
              },
              {
                before: "Generic outputs that sound like everyone else",
                after: "Outputs match your voice from the first draft",
              },
              {
                before: "Hours editing AI copy to match your voice",
                after: "Minutes to generate an entire ad batch",
              },
              {
                before: "Knowledge locked in your head, walking out the door",
                after: "Knowledge codified, versioned, compounding daily",
              },
              {
                before: "Every tool, every session starts from zero",
                after: "Every session builds on 322+ commits of context",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border"
              >
                <div className="px-6 py-4 flex items-start gap-3 bg-[#ef444408]">
                  <span className="font-mono text-red text-sm shrink-0 mt-0.5 font-bold">
                    −
                  </span>
                  <span className="text-sm text-dim">{row.before}</span>
                </div>
                <div className="px-6 py-4 flex items-start gap-3 bg-[#22c55e08]">
                  <span className="font-mono text-green text-sm shrink-0 mt-0.5 font-bold">
                    +
                  </span>
                  <span className="text-sm text-foreground">{row.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
