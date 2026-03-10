"use client";

import { useInView } from "./use-in-view";

export function ProcessMap() {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          HOW IT WORKS
        </p>
        <h2
          className="font-mono font-bold text-white mb-4"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          Two ways to use AI. One compounds.
        </h2>
        <p className="text-muted text-lg max-w-[640px] mb-16 leading-relaxed">
          Most people are stuck in the prompt loop. Same effort every session,
          same generic results. Codification breaks the loop.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* THE PROMPT LOOP */}
          <div
            className={`bg-surface border border-border overflow-hidden transition-all duration-600 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-border">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="font-mono text-xs text-dim ml-2">
                the prompt loop
              </span>
            </div>

            <div className="p-8">
              <div className="font-mono text-xs tracking-[0.2em] uppercase text-red mb-6">
                ↻ Every session resets
              </div>

              {/* Loop visualization */}
              <div className="space-y-0">
                {[
                  {
                    step: "1",
                    text: "Open AI tool",
                    detail: "blank context",
                  },
                  {
                    step: "2",
                    text: "Re-explain your business",
                    detail: "10-15 min every time",
                  },
                  {
                    step: "3",
                    text: "Write detailed prompt",
                    detail: "hope it works this time",
                  },
                  {
                    step: "4",
                    text: "Get generic output",
                    detail: "sounds like everyone else",
                  },
                  {
                    step: "5",
                    text: "Edit for 30+ minutes",
                    detail: "to make it sound like you",
                  },
                  {
                    step: "6",
                    text: "Close session",
                    detail: "nothing saved",
                  },
                  {
                    step: "↻",
                    text: "Start over tomorrow",
                    detail: "zero compounding",
                    isLoop: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    {/* Connector line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          (item as { isLoop?: boolean }).isLoop
                            ? "bg-[#ef444433] text-red border border-red"
                            : "bg-[#1a1a1a] text-dim border border-border"
                        }`}
                      >
                        {item.step}
                      </div>
                      {i < 6 && (
                        <div className="w-px h-6 bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="text-sm text-foreground font-mono">
                        {item.text}
                      </div>
                      <div className="text-xs text-dim mt-0.5">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="font-mono text-xs text-red">
                  output quality: <span className="text-foreground">flat</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 w-full bg-[#ef444433] rounded-sm"
                      style={{ height: "12px" }}
                    />
                  ))}
                </div>
                <div className="font-mono text-[10px] text-dim mt-1">
                  session 1 → session 8: no improvement
                </div>
              </div>
            </div>
          </div>

          {/* THE CODIFY FLOW */}
          <div
            className={`bg-surface border border-[#22c55e33] overflow-hidden transition-all duration-600 delay-150 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-border">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="font-mono text-xs text-dim ml-2">
                the codify flow
              </span>
            </div>

            <div className="p-8">
              <div className="font-mono text-xs tracking-[0.2em] uppercase text-green mb-6">
                → Each session builds on the last
              </div>

              {/* Linear flow */}
              <div className="space-y-0">
                {[
                  {
                    step: "1",
                    text: "Extract your knowledge",
                    detail: "one time — soul, offer, audience, voice",
                    phase: "setup",
                  },
                  {
                    step: "2",
                    text: "Codify into reference files",
                    detail: "structured markdown AI reads first",
                    phase: "setup",
                  },
                  {
                    step: "3",
                    text: "AI reads your full context",
                    detail: "48 files loaded before generating",
                    phase: "daily",
                  },
                  {
                    step: "4",
                    text: "Generate from context",
                    detail: "sounds like you from the first draft",
                    phase: "daily",
                  },
                  {
                    step: "5",
                    text: "Research enriches the stack",
                    detail: "new insights feed back into reference",
                    phase: "compound",
                  },
                  {
                    step: "6",
                    text: "Decisions sharpen positioning",
                    detail: "every choice makes future outputs better",
                    phase: "compound",
                  },
                  {
                    step: "∞",
                    text: "System compounds daily",
                    detail: "the moat widens automatically",
                    isCompound: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          (item as { isCompound?: boolean }).isCompound
                            ? "bg-[#22c55e33] text-green border border-green"
                            : item.phase === "setup"
                            ? "bg-[#4a9eff15] text-blue border border-[#4a9eff44]"
                            : item.phase === "compound"
                            ? "bg-[#22c55e15] text-green border border-[#22c55e44]"
                            : "bg-[#1a1a1a] text-foreground border border-border"
                        }`}
                      >
                        {item.step}
                      </div>
                      {i < 6 && (
                        <div
                          className={`w-px h-6 ${
                            item.phase === "compound" || (item as { isCompound?: boolean }).isCompound
                              ? "bg-[#22c55e44]"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="text-sm text-foreground font-mono">
                        {item.text}
                      </div>
                      <div className="text-xs text-dim mt-0.5">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="font-mono text-xs text-green">
                  output quality:{" "}
                  <span className="text-foreground">compounding</span>
                </div>
                <div className="flex items-end gap-1 mt-2">
                  {[3, 4, 5, 6, 7, 9, 11, 14].map((h, i) => (
                    <div
                      key={i}
                      className="w-full bg-[#22c55e44] rounded-sm"
                      style={{ height: `${h * 2.5}px` }}
                    />
                  ))}
                </div>
                <div className="font-mono text-[10px] text-dim mt-1">
                  session 1 → session 8: exponential improvement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom summary */}
        <div
          className={`mt-12 grid md:grid-cols-3 gap-6 transition-all duration-600 delay-300 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {[
            {
              icon: "⟳",
              label: "Prompting",
              value: "Linear effort",
              detail: "10x work = 1x results",
              color: "text-red",
            },
            {
              icon: "→",
              label: "Codifying",
              value: "Compound effort",
              detail: "1x work = 10x results over time",
              color: "text-green",
            },
            {
              icon: "Δ",
              label: "The difference",
              value: "Context, not prompts",
              detail: "same AI, structured knowledge, better outputs",
              color: "text-blue",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-surface border border-border p-6 text-center"
            >
              <div className={`font-mono text-2xl mb-2 ${item.color}`}>
                {item.icon}
              </div>
              <div className="font-mono text-xs tracking-[0.15em] uppercase text-dim mb-2">
                {item.label}
              </div>
              <div className="font-mono text-sm font-bold text-white mb-1">
                {item.value}
              </div>
              <div className="text-xs text-dim">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
