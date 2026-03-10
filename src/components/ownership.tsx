"use client";

import { useInView } from "./use-in-view";

export function Ownership() {
  const { ref, inView } = useInView(0.1);

  const theirs = [
    { name: "Dust.tt", issue: "Your knowledge lives on their servers" },
    { name: "CustomGPT", issue: "Locked to their platform" },
    { name: "Notion AI", issue: "Tied to their workspace" },
    { name: "ChatGPT", issue: "Gone when your session ends" },
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
        <p className="text-muted text-sm leading-relaxed max-w-[600px] mb-16">
          Every competitor locks your knowledge inside their platform. Codify uses plain markdown files in your own git repository. Portable. Version-controlled. Yours forever.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Their way */}
          <div
            className={`transition-all duration-600 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="bg-surface border border-border p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="font-mono text-red text-sm">✗</span>
                <h3 className="font-mono text-red font-bold text-sm uppercase tracking-wider">
                  Platform-locked
                </h3>
              </div>
              <div className="space-y-4">
                {theirs.map((t) => (
                  <div key={t.name} className="flex items-start gap-3">
                    <span className="font-mono text-red text-xs mt-0.5">−</span>
                    <div>
                      <span className="font-mono text-white text-sm">{t.name}</span>
                      <span className="text-dim text-sm"> — {t.issue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Our way */}
          <div
            className={`transition-all duration-600 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="bg-surface border border-green/20 p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="font-mono text-green text-sm">✓</span>
                <h3 className="font-mono text-green font-bold text-sm uppercase tracking-wider">
                  You own it
                </h3>
              </div>
              {/* Mini terminal */}
              <div className="bg-[#0a0a0a] border border-border p-4 font-mono text-sm">
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
                <p className="text-dim mt-3 text-xs">
                  Plain markdown. Git versioned. Works with any AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
