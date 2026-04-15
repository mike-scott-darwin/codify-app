"use client";

import Link from "next/link";

export default function MyAgentsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
      {/* Illustration — structured agent network */}
      <div className="relative w-[200px] h-[200px] mb-8">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.06]" />
        {/* Inner ring */}
        <div className="absolute inset-6 rounded-full border border-dashed border-white/[0.06]" />

        {/* Center node — the "you" hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 z-10">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>

        {/* Orbit nodes — ghost agents waiting to be created */}
        {[
          { angle: 0, color: "from-blue-400/20 to-cyan-400/20", border: "border-blue-400/15" },
          { angle: 72, color: "from-emerald-400/20 to-green-400/20", border: "border-emerald-400/15" },
          { angle: 144, color: "from-amber-400/20 to-orange-400/20", border: "border-amber-400/15" },
          { angle: 216, color: "from-rose-400/20 to-pink-400/20", border: "border-rose-400/15" },
          { angle: 288, color: "from-violet-400/20 to-purple-400/20", border: "border-violet-400/15" },
        ].map(({ angle, color, border }) => {
          const r = 80;
          const x = 100 + r * Math.cos((angle - 90) * (Math.PI / 180)) - 16;
          const y = 100 + r * Math.sin((angle - 90) * (Math.PI / 180)) - 16;
          return (
            <div
              key={angle}
              className={`absolute w-8 h-8 rounded-full bg-gradient-to-br ${color} border ${border} flex items-center justify-center`}
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              <span className="text-white/20 text-xs">+</span>
            </div>
          );
        })}

        {/* Subtle connecting lines via SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          {[0, 72, 144, 216, 288].map((angle) => {
            const r = 80;
            const x = 100 + r * Math.cos((angle - 90) * (Math.PI / 180));
            const y = 100 + r * Math.sin((angle - 90) * (Math.PI / 180));
            return (
              <line
                key={angle}
                x1="100" y1="100" x2={x} y2={y}
                stroke="white" strokeOpacity="0.04" strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>
      </div>

      {/* Copy */}
      <h2 className="text-lg font-sans font-bold text-foreground mb-2">No agents yet</h2>
      <p className="text-sm text-muted mb-1 text-center max-w-xs leading-relaxed">
        Create an AI agent that knows your business and works the way you do.
      </p>
      <p className="text-xs text-dim mb-8 text-center max-w-xs">
        No technical skills required — just describe what you need.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-3">
        <Link
          href="/vault/agents/create"
          className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
        >
          Create Agent
        </Link>
        <Link
          href="/vault/agents/all"
          className="px-6 py-2.5 text-sm font-medium text-muted bg-surface border border-border rounded-lg hover:text-foreground hover:border-white/10 transition-colors"
        >
          Browse Agents
        </Link>
      </div>
    </div>
  );
}
