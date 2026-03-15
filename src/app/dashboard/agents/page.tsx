"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTier } from "@/lib/tier-context";
import { hasAccess, TIER_LABELS, TIER_COLORS } from "@/lib/tier";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import type { AgentType } from "@/lib/agents/types";
import type { Feature } from "@/lib/tier";

interface RecentJob {
  id: string;
  agent_type: string;
  status: string;
  created_at: string;
  progress: { currentAction: string };
}

const AGENT_FEATURE_MAP: Record<AgentType, Feature> = {
  congruence_audit: "research",
  deep_research: "research",
  ad_campaign: "generate:ad_copy",
  content_calendar: "generate:social_post",
  email_campaign: "generate:email_sequence",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b6b6b",
  running: "#4a9eff",
  complete: "#22c55e",
  failed: "#ef4444",
};

export default function AgentsPage() {
  const { tier } = useTier();
  const searchParams = useSearchParams();
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [launching, setLaunching] = useState<string | null>(null);
  const autoLaunched = useRef(false);

  useEffect(() => {
    if (autoLaunched.current) return;
    const launchType = searchParams.get("launch") as AgentType | null;
    if (launchType && AGENT_CONFIGS[launchType]) {
      autoLaunched.current = true;
      const topic = searchParams.get("topic");
      const config: Record<string, unknown> = {};
      if (topic) config.topic = topic;
      launchAgent(launchType, config);
    }
  }, [searchParams]);

  const launchAgent = async (agentType: AgentType, config: Record<string, unknown> = {}) => {
    setLaunching(agentType);
    try {
      const res = await fetch("/api/agent/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, config }),
      });
      const data = await res.json();
      if (data.jobId) {
        window.location.href = "/dashboard/agents/" + data.jobId;
      }
    } catch {
      setLaunching(null);
    }
  };

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Agents</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">
        Multi-step AI agents that go beyond single-prompt generation.
      </p>

      <div className="space-y-4">
        {(Object.entries(AGENT_CONFIGS) as [AgentType, typeof AGENT_CONFIGS[AgentType]][]).map(([type, config]) => {
          const feature = AGENT_FEATURE_MAP[type];
          const locked = !hasAccess(tier, feature);
          const isLaunching = launching === type;

          return (
            <div key={type} className="bg-[#111111] border border-[#1a1a1a] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white font-bold">
                        {config.label}
                      </span>
                      <span className="font-mono text-[9px] text-[#6b6b6b]">
                        {config.steps} steps
                      </span>
                    </div>
                    <p className="text-xs text-[#6b6b6b] mt-0.5">{config.description}</p>
                  </div>
                </div>

                {locked ? (
                  <Link
                    href="/dashboard/upgrade"
                    className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border"
                    style={{ color: TIER_COLORS[config.requiredTier], borderColor: TIER_COLORS[config.requiredTier] }}
                  >
                    {TIER_LABELS[config.requiredTier]}
                  </Link>
                ) : (
                  <button
                    onClick={() => launchAgent(type)}
                    disabled={isLaunching}
                    className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                    style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                  >
                    {isLaunching ? "Launching..." : "Launch →"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
