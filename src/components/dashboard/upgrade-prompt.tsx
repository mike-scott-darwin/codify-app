"use client";

import Link from "next/link";
import { TIER_LABELS, TIER_COLORS, TIER_PRICES } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

interface UpgradePromptProps {
  requiredTier: Tier;
  feature: string;
  description?: string;
}

export function UpgradePrompt({ requiredTier, feature, description }: UpgradePromptProps) {
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
      <div className="mb-4">
        <span className="font-mono text-2xl text-[#6b6b6b]">\u26BF</span>
      </div>
      <p className="font-mono text-sm text-white mb-2">
        {feature} requires{" "}
        <span style={{ color: TIER_COLORS[requiredTier] }}>
          {TIER_LABELS[requiredTier]}
        </span>
      </p>
      {description && (
        <p className="text-sm text-[#6b6b6b] mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      <Link
        href="/dashboard/upgrade"
        className="inline-block font-mono text-sm font-bold px-6 py-3 hover:brightness-110 transition-all"
        style={{
          backgroundColor: TIER_COLORS[requiredTier],
          color: "#000000",
          borderRadius: 0,
        }}
      >
        Upgrade to {TIER_LABELS[requiredTier]} — {TIER_PRICES[requiredTier]}
      </Link>
    </div>
  );
}
