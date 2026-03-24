"use client";

import { useTier } from "@/lib/tier-context";
import { TIER_HIERARCHY, TIER_COLORS } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

const TIERS: {
  tier: Tier;
  name: string;
  price: string;
  period: string;
  tagline: string;
  skills: string[];
}[] = [
  {
    tier: "free",
    name: "Free",
    price: "0",
    period: "",
    tagline: "Start building your business brain",
    skills: ["/extract (3x)", "/files", "/score", "/help"],
  },
  {
    tier: "build",
    name: "Build",
    price: "99",
    period: "/mo",
    tagline: "Research, decide, improve",
    skills: ["/think", "/audit", "/refine", "/voice"],
  },
  {
    tier: "pro",
    name: "Pro",
    price: "199",
    period: "/mo",
    tagline: "Full content engine",
    skills: [
      "/ads",
      "/organic",
      "/email",
      "/newsletter",
      "/brainstorm",
      "/seo",
      "/blog",
      "/repurpose",
    ],
  },
  {
    tier: "vip",
    name: "VIP",
    price: "497",
    period: "/mo",
    tagline: "Your compounding machine",
    skills: [
      "/scout",
      "/vsl",
      "/proposal",
      "/report",
      "scheduled automation",
    ],
  },
];

export default function UpgradePage() {
  const { tier: currentTier } = useTier();

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Upgrade your plan</h1>
      <p className="text-sm text-[#6b6b6b] mb-10">
        Every tier unlocks more skills. Your context compounds at every level.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
        {TIERS.map((t) => {
          const isCurrent = currentTier === t.tier;
          const isLower =
            TIER_HIERARCHY[t.tier] <= TIER_HIERARCHY[currentTier];
          const color = TIER_COLORS[t.tier];

          return (
            <div
              key={t.tier}
              className="bg-[#111111] border p-5 flex flex-col"
              style={{
                borderColor: isCurrent ? color : "#1a1a1a",
              }}
            >
              {/* Tier label */}
              <span
                className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3"
                style={{ color }}
              >
                {t.name}
              </span>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-3xl font-bold">{t.price}</span>
                {t.period && (
                  <span className="font-mono text-sm text-[#6b6b6b]">
                    {t.period}
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p className="text-xs text-[#6b6b6b] mb-5">{t.tagline}</p>

              {/* Skills list */}
              <ul className="space-y-1.5 mb-6 flex-1">
                {t.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2">
                    <span style={{ color }} className="text-xs mt-0.5">
                      +
                    </span>
                    <span className="font-mono text-sm text-[#a0a0a0]">
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
                  Current
                </span>
              ) : isLower ? (
                <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
                  Included
                </span>
              ) : (
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-bold py-3 text-center hover:brightness-110 transition-all block"
                  style={{ backgroundColor: color, color: "#000" }}
                >
                  Upgrade
                </a>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
