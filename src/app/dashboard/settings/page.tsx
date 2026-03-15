"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTier } from "@/lib/tier-context";
import { TierBadge } from "@/components/dashboard/tier-badge";
import { TIER_LIMITS } from "@/lib/tier";

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const { tier, enrichmentCount, generationCount } = useTier();

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-8">Settings</h1>

      {/* Account */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Account
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Email</span>
            <span className="font-mono text-sm text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Plan</span>
            <TierBadge tier={tier} />
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Usage
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Enrichments</span>
            <span className="font-mono text-sm text-white">
              {enrichmentCount}
              {TIER_LIMITS[tier].enrichments !== Infinity && (
                <span className="text-[#6b6b6b]"> / {TIER_LIMITS[tier].enrichments}</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#6b6b6b]">Generations (this month)</span>
            <span className="font-mono text-sm text-white">
              {generationCount}
              {TIER_LIMITS[tier].generations !== Infinity && TIER_LIMITS[tier].generations > 0 && (
                <span className="text-[#6b6b6b]"> / {TIER_LIMITS[tier].generations}</span>
              )}
              {TIER_LIMITS[tier].generations === 0 && (
                <span className="text-[#6b6b6b]"> (upgrade to unlock)</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
