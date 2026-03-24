"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  congruence_audit: "audit",
  deep_research: "think",
  ad_campaign: "ads",
  content_calendar: "organic",
  email_campaign: "email",
  research_scout: "scout",
  trend_monitor: "scout",
  social_post_generator: "organic",
  publisher: "organic",
  audit_agent: "audit",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b6b6b",
  running: "#4a9eff",
  complete: "#22c55e",
  failed: "#ef4444",
};

const TABS = [
  { key: "agents", label: "Agents", href: "/dashboard/agents" },
  { key: "schedules", label: "Schedules", href: "/dashboard/agents/schedules" },
  { key: "chains", label: "Chains", href: "/dashboard/agents/chains" },
  { key: "usage", label: "Usage", href: "/dashboard/agents/usage" },
];

function AgentsPageContent() {
  const { tier } = useTier();
  const searchParams = useSearchParams();
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [launching, setLaunching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoLaunched = useRef(false);

  const launchAgent = async (agentType: AgentType, config: Record<string, unknown> = {}) => {
    setLaunching(agentType);
    setError(null);
    try {
      const res = await fetch("/api/agent/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType, config }),
      });
      const data = await res.json();
      if (data.jobId) {
        window.location.href = "/dashboard/agents/" + data.jobId;
      } else {
        setError(data.error || "Failed to launch agent. Check that supabase-schema-v3.sql has been run.");
        setLaunching(null);
      }
    } catch (e) {
      setError("Network error — could not reach the server.");
      setLaunching(null);
    }
  };
  useEffect(() => {
    if (autoLaunched.current) return;
    const launchType = searchParams.get("launch") as AgentType | null;
    if (launchType && AGENT_CONFIGS[launchType]) {
      autoLaunched.current = true;
      const topic = searchParams.get("topic");
      const config: Record<string, unknown> = {};
      if (topic) config.topic = topic;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      launchAgent(launchType, config);
    }
  }, [searchParams]);


  // Separate chain-only agents from direct-launch agents
  const chainOnlyAgents: AgentType[] = ["research_scout", "trend_monitor", "social_post_generator", "publisher", "audit_agent"];

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Agents</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        Multi-step AI agents that go beyond single-prompt generation.
      </p>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-[#1a1a1a] mb-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={
              "font-mono text-xs px-4 py-2.5 border-b-2 transition-colors " +
              (tab.key === "agents"
                ? "border-[#22c55e] text-[#22c55e]"
                : "border-transparent text-[#6b6b6b] hover:text-white")
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="bg-[#111111] border border-[#ef4444] p-4 mb-4">
          <p className="font-mono text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {(Object.entries(AGENT_CONFIGS) as [AgentType, typeof AGENT_CONFIGS[AgentType]][])
          .filter(([type]) => !chainOnlyAgents.includes(type))
          .filter(([type]) => type !== "congruence_audit" && type !== "deep_research")
          .map(([type, config]) => {
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

      {/* Chain-only agents section */}
      <div className="mt-8">
        <h2 className="font-mono text-sm font-bold text-[#8b5cf6] mb-4">Chain Agents</h2>
        <p className="text-xs text-[#6b6b6b] mb-4">
          These agents run as part of automated chains. Activate them from the{" "}
          <Link href="/dashboard/agents/chains" className="text-[#4a9eff] hover:underline">
            Chains
          </Link>{" "}
          tab.
        </p>
        <div className="space-y-2">
          {(Object.entries(AGENT_CONFIGS) as [AgentType, typeof AGENT_CONFIGS[AgentType]][])
            .filter(([type]) => chainOnlyAgents.includes(type))
            .map(([type, config]) => (
              <div key={type} className="bg-[#111111] border border-[#1a1a1a] p-4 flex items-center gap-4">
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1">
                  <span className="font-mono text-xs text-white font-bold">{config.label}</span>
                  <p className="text-[10px] text-[#6b6b6b] mt-0.5">{config.description}</p>
                </div>
                <span className="font-mono text-[9px] text-[#8b5cf6] border border-[#8b5cf6]/30 px-2 py-0.5">
                  CHAIN
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><span className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</span></div>}>
      <AgentsPageContent />
    </Suspense>
  );
}
