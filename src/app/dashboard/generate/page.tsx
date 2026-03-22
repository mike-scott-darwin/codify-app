"use client";

import Link from "next/link";
import { useTier } from "@/lib/tier-context";
import { hasAccess, FEATURE_REQUIRED_TIER, TIER_LABELS, getGenerationLimit } from "@/lib/tier";
import { GENERATION_CONFIGS } from "@/lib/generation-types";
import type { Feature } from "@/lib/tier";

export default function GenerateHubPage() {
  const { tier } = useTier();

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Generate Outputs</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">
        Your reference files power every output. Pick a format and generate.
      </p>

      <div className="space-y-4">
        {GENERATION_CONFIGS.map((config) => {
          const feature = ("generate:" + config.type) as Feature;
          const locked = !hasAccess(tier, feature);
          const requiredTier = FEATURE_REQUIRED_TIER[feature];
          const limit = getGenerationLimit(tier, config.type);
          const limitLabel = limit === Infinity ? "Unlimited" : limit + "/mo";

          return (
            <Link
              key={config.type}
              href={locked ? "/dashboard/upgrade" : "/dashboard/generate/" + config.type}
              className="block bg-[#111111] border border-[#1a1a1a] p-6 hover:border-[#333] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <span className="font-mono text-sm text-white font-bold">
                      {config.label}
                    </span>
                    <p className="text-xs text-[#6b6b6b] mt-0.5">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!locked && (
                    <span className="font-mono text-[10px] text-[#6b6b6b]">
                      {limitLabel}
                    </span>
                  )}
                  {locked ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8b5cf6] border border-[#8b5cf6] px-2 py-1">
                      {TIER_LABELS[requiredTier]}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[#6b6b6b]">→</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Agent-powered campaigns */}
      <h2 className="font-mono text-sm text-[#6b6b6b] uppercase tracking-[0.2em] mt-10 mb-4">
        Campaign Mode (Multi-Step Agents)
      </h2>
      <div className="space-y-4">
        {[
          { type: "ad_campaign", label: "Ad Campaign", icon: "🎯", description: "9 hooks, 5 full ads, compliance-checked and ranked", feature: "agent:ad_campaign" as Feature, tier: "focus" as const },
          { type: "email_campaign", label: "Email Campaign", icon: "📧", description: "Full sequence with arc progression, subject lines, and timing", feature: "agent:email_campaign" as Feature, tier: "focus" as const },
          { type: "content_calendar", label: "Content Calendar", icon: "📅", description: "5 days of platform-aware posts from your content pillars", feature: "agent:content_calendar" as Feature, tier: "focus" as const },
        ].map((agent) => {
          const locked = !hasAccess(tier, agent.feature);
          const limit = getGenerationLimit(tier, agent.type);
          const limitLabel = limit === Infinity ? "Unlimited" : limit + "/mo";

          return (
            <Link
              key={agent.type}
              href={locked ? "/dashboard/upgrade" : "/dashboard/agents?launch=" + agent.type}
              className="block bg-[#111111] border border-[#1a1a1a] p-6 hover:border-[#333] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{agent.icon}</span>
                  <div>
                    <span className="font-mono text-sm text-white font-bold">
                      {agent.label}
                    </span>
                    <p className="text-xs text-[#6b6b6b] mt-0.5">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!locked && (
                    <span className="font-mono text-[10px] text-[#6b6b6b]">
                      {limitLabel}
                    </span>
                  )}
                  {locked ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#8b5cf6] border border-[#8b5cf6] px-2 py-1">
                      {TIER_LABELS[agent.tier]}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-[#f59e0b] border border-[#f59e0b] px-2 py-1">AGENT</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Compounding nudge */}
      <div className="bg-[#111111] border border-[#4a9eff] border-dashed p-4 mt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-1">
              After generating
            </p>
            <p className="font-mono text-sm text-[#a0a0a0]">
              Review outputs, publish to connected platforms, then research what to improve next
            </p>
          </div>
          <Link
            href="/dashboard/outputs"
            className="font-mono text-xs px-4 py-2 border border-[#4a9eff] text-[#4a9eff] hover:bg-[#4a9eff] hover:text-white transition-colors"
          >
            View Outputs →
          </Link>
        </div>
      </div>
    </>
  );
}
