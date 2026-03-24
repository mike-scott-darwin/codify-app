"use client";

import { useTier } from "@/lib/tier-context";
import { TIER_HIERARCHY } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

export default function UpgradePage() {
  const { tier: currentTier } = useTier();

  const isExplore = currentTier === "explore";
  const isArchitect = currentTier === "architect";
  const isFocus = currentTier === "focus";

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Upgrade your plan</h1>
      <p className="text-sm text-[#6b6b6b] mb-10">
        Every tier unlocks more skills. Your context compounds at every level.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
        {/* Explore */}
        <div
          className="bg-[#111111] border p-5 flex flex-col"
          style={{ borderColor: isExplore ? "#6b6b6b" : "#1a1a1a" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3 text-[#6b6b6b]">
            Explore
          </span>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-mono text-3xl font-bold">Free</span>
          </div>
          <p className="text-xs text-[#6b6b6b] mb-5">Demo the system</p>
          <ul className="space-y-1.5 mb-6 flex-1">
            {["/extract (3x)", "/files", "/score", "/help"].map((skill) => (
              <li key={skill} className="flex items-start gap-2">
                <span className="text-xs mt-0.5 text-[#6b6b6b]">+</span>
                <span className="font-mono text-sm text-[#a0a0a0]">{skill}</span>
              </li>
            ))}
          </ul>
          {isExplore ? (
            <span className="font-mono text-sm text-center py-3 border border-[#6b6b6b] text-[#6b6b6b]">
              Current
            </span>
          ) : (
            <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
              Included
            </span>
          )}
        </div>

        {/* Architect */}
        <div
          className="bg-[#111111] border p-5 flex flex-col"
          style={{ borderColor: isArchitect ? "#4a9eff" : "#1a1a1a" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3 text-[#4a9eff]">
            Architect
          </span>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-mono text-3xl font-bold">497</span>
            <span className="font-mono text-sm text-[#6b6b6b]">/mo</span>
          </div>
          <p className="text-xs text-[#6b6b6b] mb-5">The Brain Sync</p>
          <p className="text-xs text-[#a0a0a0] mb-4">
            Full access to every skill. Your context compounds monthly.
          </p>
          <ul className="space-y-1.5 mb-6 flex-1">
            {[
              "/think", "/audit", "/refine", "/voice", "/end",
              "/ads", "/organic", "/email", "/newsletter", "/brainstorm",
              "/seo", "/blog", "/repurpose", "/site", "/scout",
              "/vsl", "/proposal", "/report", "/output history",
            ].map((skill) => (
              <li key={skill} className="flex items-start gap-2">
                <span className="text-xs mt-0.5 text-[#4a9eff]">+</span>
                <span className="font-mono text-sm text-[#a0a0a0]">{skill}</span>
              </li>
            ))}
          </ul>
          {isArchitect ? (
            <span className="font-mono text-sm text-center py-3 border border-[#4a9eff] text-[#6b6b6b]">
              Current
            </span>
          ) : isFocus ? (
            <span className="font-mono text-sm text-center py-3 border border-[#1a1a1a] text-[#6b6b6b]">
              Included
            </span>
          ) : (
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-bold py-3 text-center hover:brightness-110 transition-all block bg-[#4a9eff] text-[#000]"
            >
              Start Architecting
            </a>
          )}
        </div>

        {/* Focus */}
        <div
          className="bg-[#111111] border p-5 flex flex-col"
          style={{ borderColor: isFocus ? "#22c55e" : "#1a1a1a" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3 text-[#22c55e]">
            Focus
          </span>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="font-mono text-3xl font-bold">1,497</span>
            <span className="font-mono text-sm text-[#6b6b6b]">+ $497/mo</span>
          </div>
          <p className="text-xs text-[#6b6b6b] mb-5">The Focus Engagement</p>
          <p className="text-xs text-[#a0a0a0] mb-4">
            Done-for-you context extraction + architecture + ongoing Brain Sync.
          </p>
          <p className="text-xs text-[#6b6b6b] mb-2">Everything in Architect, plus:</p>
          <ul className="space-y-1.5 mb-6 flex-1">
            {[
              "Personal Context Extraction interview",
              "Reference Stack built for you",
              "Opportunity Scout configured",
              "First batch of outputs generated",
              "Monthly Brain Sync included",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-xs mt-0.5 text-[#22c55e]">+</span>
                <span className="font-mono text-sm text-[#a0a0a0]">{item}</span>
              </li>
            ))}
          </ul>
          {isFocus ? (
            <span className="font-mono text-sm text-center py-3 border border-[#22c55e] text-[#6b6b6b]">
              Current
            </span>
          ) : (
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-bold py-3 text-center hover:brightness-110 transition-all block bg-[#22c55e] text-[#000]"
            >
              Book Your Extraction
            </a>
          )}
        </div>
      </div>
    </>
  );
}
