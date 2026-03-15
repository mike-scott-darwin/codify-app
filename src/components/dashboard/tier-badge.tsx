"use client";

import { TIER_LABELS, TIER_COLORS } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border inline-block"
      style={{ color: TIER_COLORS[tier], borderColor: TIER_COLORS[tier] }}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
