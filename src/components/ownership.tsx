"use client";

import { useInView } from "./use-in-view";

export function Ownership() {
  const { ref, inView } = useInView(0.1);

  const comparisons = [
    {
      them: "Dust.tt",
      what: "Connects your chaos",
      us: "We structure it first",
    },
    {
      them: "CustomGPT",
      what: "Reads your files",
      us: "We read your identity",
    },
    {
      them: "Notion AI",
      what: "Searches your workspace",
      us: "We structure what belongs there",
    },
    {
      them: "ChatGPT",
      what: "Forgets you every session",
      us: "We compound every session",
    },
  ];

  const yours = [
    "soul.md",
    "offer.md",
    "audience.md",
    "voice.md",
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-green mb-4">
          YOUR DATA. YOUR REPO. YOUR RULES.
        </p>
        <h2
          className="font-mono font-bold text-white mb-6"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          You own everything you build.
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-[540px] mb-16">
          Every competitor locks your knowledge inside their platform. We use plain markdown in your own git repo.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Competitor comparison */}
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
                <span className="ml-2 font-mono text-xs text-dim">diff --them vs --codify</span>
              </div>
              <div className="divide-y divide-border">
                {comparisons.map((c, i) => (
                  <div key={c.them} className="px-6 py-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="font-mono text-red text-sm shrink-0">−</span>
                      <span className="text-sm">
                        <span className="text-dim">{c.them}</span>
                        <span className="text-muted"> — {c.what}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-green text-sm shrink-0">+</span>
                      <span className="text-sm">
                        <span className="text-white font-bold">Codify</span>
                        <span className="text-foreground"> — {c.us}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Your stack */}
          <div
            className={`transition-all duration-600 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="bg-surface border border-green/20 p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="font-mono text-green text-sm">✓</span>
                  <h3 className="font-mono text-green font-bold text-sm uppercase tracking-wider">
                    Portable. Versioned. Yours.
                  </h3>
                </div>
                {/* Mini terminal */}
                <div className="bg-[#0a0a0a] border border-border p-5 font-mono text-sm mb-6">
                  <p className="text-dim mb-3">❯ ls reference/core/</p>
                  {yours.map((file, i) => (
                    <p
                      key={file}
                      className={`text-green transition-all duration-300 ${
                        inView ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ transitionDelay: `${400 + i * 150}ms` }}
                    >
                      {file}
                    </p>
                  ))}
                  <p className="text-dim mt-4 text-xs leading-relaxed">
                    Plain markdown. Git versioned. Works with any AI.
                    <br />Cancel anytime — take everything with you.
                  </p>
                </div>
              </div>

              {/* Key differentiators */}
              <div className="grid grid-cols-3 gap-3">
                {["No lock-in", "No vendor risk", "No data hostage"].map((d) => (
                  <div key={d} className="text-center py-2 border border-border bg-[#0a0a0a]">
                    <p className="font-mono text-[10px] text-green uppercase tracking-wider">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
