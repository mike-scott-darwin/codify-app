"use client";

import { useTier } from "@/lib/tier-context";
import { TIER_COLORS, TIER_HIERARCHY, TIER_PRICES } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

interface PlanCard {
  tier: Tier;
  price: string;
  period: string;
  annual: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  checkoutUrl?: string;
}

// GHL checkout URLs — update these once funnel pages are built
const GHL_CHECKOUT: Record<string, string> = {
  base: process.env.NEXT_PUBLIC_GHL_CHECKOUT_BASE || "",
  opp_engine: process.env.NEXT_PUBLIC_GHL_CHECKOUT_OPP || "",
  scale_partner: process.env.NEXT_PUBLIC_GHL_CHECKOUT_SCALE || "",
};

const PLANS: PlanCard[] = [
  {
    tier: "free",
    price: "0",
    period: "",
    annual: "",
    tagline: "Build your foundation",
    features: [
      "4 reference file interviews",
      "Read-only dashboard access",
      "Download sovereign files",
      "One-time AI context block",
    ],
  },
  {
    tier: "base",
    price: "147",
    period: "/mo",
    annual: "$1,497/yr (save $267)",
    tagline: "Identity & Context Persistence",
    checkoutUrl: GHL_CHECKOUT.base,
    features: [
      "Full Context Vault access",
      "Monthly 'Brain Sync' Audit",
      "Unlimited enrichments",
      "Research workspace + AI",
      "Context drift alerts",
      "Community access",
    ],
  },
  {
    tier: "opp_engine",
    price: "497",
    period: "/mo",
    annual: "$4,997/yr (save $967)",
    tagline: "Growth Discovery & Scale",
    highlight: true,
    checkoutUrl: GHL_CHECKOUT.opp_engine,
    features: [
      "Everything in Base Brain",
      "Weekly 'Opportunity Scout' Reports",
      "All Output Skills (Ads, VSL, Social)",
      "Daily Content Queue + Approval",
      "Calendar & Auto-Publishing",
      "Guided 4-week Onboarding Sprint",
    ],
  },
  {
    tier: "scale_partner",
    price: "1,497",
    period: "/mo",
    annual: "$14,997/yr (save $2,967)",
    tagline: "Institutional Memory Insurance",
    checkoutUrl: GHL_CHECKOUT.scale_partner,
    features: [
      "Everything in Opportunity Engine",
      "Legacy Codification (Senior Experts)",
      "Done-For-You Stack Build",
      "Direct Strategic Oversight",
      "Organization/Agency Multi-Workspace",
      "Unlimited agent throughput",
    ],
  },
];

export default function UpgradePage() {
  const { tier: currentTier } = useTier();

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Upgrade Your Business Brain</h1>
      <p className="text-sm text-[#6b6b6b] mb-10">
        Insure your wisdom. Find the revenue gaps. Scale your identity.
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
                  {plan.tier.replace('_', ' ')}
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

              {plan.annual && (
                <p className="text-[10px] text-[#4a9eff] mb-1">{plan.annual}</p>
              )}

              <p className="text-xs text-[#6b6b6b] mb-5">{plan.tagline}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#22c55e] text-xs mt-0.5">✓</span>
                    <span className="text-sm text-[#a0a0a0]">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
                  Current Plan
                </span>
              ) : isUpgrade && plan.checkoutUrl ? (
                <a
                  href={plan.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-bold py-3 text-center hover:brightness-110 transition-all block"
                  style={{
                    backgroundColor: TIER_COLORS[plan.tier],
                    color: "#000",
                    borderRadius: 0,
                  }}
                >
                  UPGRADE TO {plan.tier.replace('_', ' ').toUpperCase()}
                </a>
              ) : isUpgrade ? (
                <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
                  Coming Soon
                </span>
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
