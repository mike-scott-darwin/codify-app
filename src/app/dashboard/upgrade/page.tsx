"use client";

import { useTier } from "@/lib/tier-context";
import { TIER_COLORS } from "@/lib/tier";

export default function UpgradePage() {
  const { tier: currentTier } = useTier();

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">
        Want us to build it for you?
      </h1>
      <p className="text-sm text-[#6b6b6b] mb-10">
        You can build your reference files yourself for free.
        Or let us extract and structure your institutional knowledge.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {/* Focus Engagement */}
        <div
          className="bg-[#111111] border p-6 flex flex-col"
          style={{ borderColor: TIER_COLORS.focus }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3"
            style={{ color: TIER_COLORS.focus }}
          >
            Focus Engagement
          </span>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-mono text-3xl font-bold">1,497</span>
          </div>
          <p className="text-xs text-[#6b6b6b] mb-5">
            One-time. Your knowledge extracted and codified.
          </p>

          <ul className="space-y-2 mb-6 flex-1">
            {[
              "Soul Mining — strategic interview",
              "Full reference stack built for you",
              "Opportunity Scout configured",
              "First batch of automated outputs",
              "All app features unlocked",
              "You own everything — your files, your repo",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-[#22c55e] text-xs mt-0.5">✓</span>
                <span className="text-sm text-[#a0a0a0]">{f}</span>
              </li>
            ))}
          </ul>

          {currentTier === "focus" || currentTier === "brain_sync" ? (
            <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
              Active
            </span>
          ) : (
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-bold py-3 text-center hover:brightness-110 transition-all block"
              style={{ backgroundColor: TIER_COLORS.focus, color: "#000" }}
            >
              Book a Call
            </a>
          )}
        </div>

        {/* Brain Sync */}
        <div
          className="bg-[#111111] border p-6 flex flex-col"
          style={{ borderColor: TIER_COLORS.brain_sync }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3"
            style={{ color: TIER_COLORS.brain_sync }}
          >
            Brain Sync
          </span>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-mono text-3xl font-bold">497</span>
            <span className="font-mono text-sm text-[#6b6b6b]">/mo</span>
          </div>
          <p className="text-xs text-[#6b6b6b] mb-5">
            Ongoing. Your context stays aligned and compounds.
          </p>

          <ul className="space-y-2 mb-6 flex-1">
            {[
              "Monthly context fidelity audit",
              "Market alignment updates",
              "Unlimited AI generations",
              "Automated scheduling + publishing",
              "Opportunity Scout active weekly",
              "Direct access to your Context Architect",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-[#4a9eff] text-xs mt-0.5">✓</span>
                <span className="text-sm text-[#a0a0a0]">{f}</span>
              </li>
            ))}
          </ul>

          {currentTier === "brain_sync" ? (
            <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
              Active
            </span>
          ) : (
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-bold py-3 text-center hover:brightness-110 transition-all block"
              style={{ backgroundColor: TIER_COLORS.brain_sync, color: "#000" }}
            >
              Book a Call
            </a>
          )}
        </div>
      </div>

      {/* Free tier reminder */}
      <div className="mt-10 max-w-2xl">
        <div className="bg-[#111111] border border-[#1a1a1a] p-6">
          <p className="font-mono text-sm text-white mb-2">
            Building it yourself? That&apos;s free.
          </p>
          <p className="text-sm text-[#6b6b6b]">
            Answer the interview questions, build your reference files, and use
            AI enrichment to strengthen them. Your files are stored in your own
            secure folder. No credit card needed.
          </p>
        </div>
      </div>
    </>
  );
}
