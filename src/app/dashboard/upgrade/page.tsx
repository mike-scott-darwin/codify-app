"use client";

import { useTier } from "@/lib/tier-context";
import { TIER_COLORS, TIER_HIERARCHY } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

interface PlanCard {
  tier: Tier;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: PlanCard[] = [
  {
    tier: "free",
    price: "0",
    period: "",
    tagline: "Build your foundation",
    features: [
      "4 reference file interviews",
      "10 AI enrichments",
      "Download files",
      "Use with any AI tool",
    ],
  },
  {
    tier: "build",
    price: "99",
    period: "/mo",
    tagline: "The thinking engine",
    features: [
      "Everything in Free",
      "Unlimited enrichments",
      "Research workspace",
      "Community access",
    ],
  },
  {
    tier: "pro",
    price: "199",
    period: "/mo",
    tagline: "Turn context into content",
    highlight: true,
    features: [
      "Everything in Build",
      "50 AI generations/month",
      "Ad copy, social, email, VSL, landing pages",
      "Output history",
      "Guided onboarding sprint",
    ],
  },
  {
    tier: "vip",
    price: "497",
    period: "/mo",
    tagline: "Full system, built for you",
    features: [
      "Everything in Pro",
      "Unlimited generations",
      "Done-for-you onboarding",
      "Direct access to builder",
      "Agency multi-client support",
    ],
  },
];

export default function UpgradePage() {
  const { tier: currentTier } = useTier();

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Upgrade Your Plan</h1>
      <p className="text-sm text-[#6b6b6b] mb-10">
        Build context. Generate outputs. Compound results.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const isUpgrade = TIER_HIERARCHY[plan.tier] > TIER_HIERARCHY[currentTier];

          return (
            <div
              key={plan.tier}
              className="bg-[#111111] border p-6 flex flex-col"
              style={{
                borderColor: plan.highlight ? TIER_COLORS[plan.tier] : "#1a1a1a",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: TIER_COLORS[plan.tier] }}
                >
                  {plan.tier}
                </span>
                {plan.highlight && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8b5cf6]">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="font-mono text-sm text-[#6b6b6b]">{plan.period}</span>
                )}
              </div>

              <p className="text-xs text-[#6b6b6b] mb-5">{plan.tagline}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#22c55e] text-xs mt-0.5">\u2713</span>
                    <span className="text-sm text-[#a0a0a0]">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
                  Current Plan
                </span>
              ) : isUpgrade ? (
                <button
                  className="font-mono text-sm font-bold py-3 hover:brightness-110 transition-all"
                  style={{
                    backgroundColor: TIER_COLORS[plan.tier],
                    color: "#000",
                    borderRadius: 0,
                  }}
                >
                  Upgrade to {plan.tier.toUpperCase()}
                </button>
              ) : (
                <span className="font-mono text-sm text-center py-3 text-[#6b6b6b]">
                  &mdash;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
