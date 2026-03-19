"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import type { AgentType } from "@/lib/agents/types";

interface ChainStep {
  id: string;
  step_order: number;
  agent_type: string;
  config: Record<string, unknown>;
  input_mapping: Record<string, string>;
}

interface Chain {
  id: string;
  name: string;
  description: string;
  is_template: boolean;
  template_key: string | null;
  agent_chain_steps: ChainStep[];
}

interface ChainRun {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  started_at: string;
  completed_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b6b6b",
  running: "#4a9eff",
  complete: "#22c55e",
  failed: "#ef4444",
  partial: "#f59e0b",
};

const FREQUENCY_OPTIONS = [
  { value: "4h", label: "Every 4 hours" },
  { value: "8h", label: "Every 8 hours" },
  { value: "12h", label: "Every 12 hours" },
  { value: "24h", label: "Daily" },
  { value: "7d", label: "Weekly" },
];

const TABS = [
  { key: "agents", label: "Agents", href: "/dashboard/agents" },
  { key: "schedules", label: "Schedules", href: "/dashboard/agents/schedules" },
  { key: "chains", label: "Chains", href: "/dashboard/agents/chains" },
  { key: "usage", label: "Usage", href: "/dashboard/agents/usage" },
];

function PipelineViz({ steps, runStatus }: { steps: ChainStep[]; runStatus?: string }) {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {sorted.map((step, i) => {
        const agentConfig = AGENT_CONFIGS[step.agent_type as AgentType];
        const stepColor = runStatus
          ? STATUS_COLORS[runStatus] || "#6b6b6b"
          : "#4a9eff";
        return (
          <div key={step.id} className="flex items-center">
            <div
              className="border px-3 py-1.5 font-mono text-[10px] whitespace-nowrap"
              style={{ borderColor: stepColor + "40", color: stepColor }}
            >
              <span className="mr-1">{agentConfig?.icon || "?"}</span>
              {agentConfig?.label || step.agent_type}
            </div>
            {i < sorted.length - 1 && (
              <span className="font-mono text-[#4a4a4a] px-1 text-xs">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ChainsPage() {
  const [templates, setTemplates] = useState<Chain[]>([]);
  const [userChains, setUserChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [activateFreq, setActivateFreq] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [runningChain, setRunningChain] = useState<string | null>(null);

  const fetchChains = async () => {
    try {
      const res = await fetch("/api/agent/chains");
      const data = await res.json();
      setTemplates(data.templates || []);
      setUserChains(data.userChains || []);
    } catch {
      setError("Failed to load chains.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChains(); }, []);

  const activateTemplate = async (templateKey: string) => {
    setActivating(templateKey);
    setError(null);
    try {
      const res = await fetch("/api/agent/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateKey,
          frequency: activateFreq[templateKey] || "24h",
        }),
      });
      const data = await res.json();
      if (data.chain) {
        await fetchChains();
      } else {
        setError(data.error || "Failed to activate template.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setActivating(null);
    }
  };

  const runChain = async (chainId: string) => {
    setRunningChain(chainId);
    try {
      const res = await fetch("/api/agent/chains/" + chainId, { method: "POST" });
      const data = await res.json();
      if (data.chainRunId) {
        // Refresh to show the run
        await fetchChains();
      }
    } catch {
      setError("Failed to start chain run.");
    } finally {
      setRunningChain(null);
    }
  };

  const deleteChain = async (chainId: string) => {
    try {
      await fetch("/api/agent/chains/" + chainId, { method: "DELETE" });
      setUserChains((prev) => prev.filter((c) => c.id !== chainId));
    } catch {
      setError("Failed to delete chain.");
    }
  };

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Chains</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        Multi-agent pipelines that pass output from one agent to the next.
      </p>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-[#1a1a1a] mb-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={
              "font-mono text-xs px-4 py-2.5 border-b-2 transition-colors " +
              (tab.key === "chains"
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

      {loading ? (
        <p className="font-mono text-sm text-[#6b6b6b]">Loading chains...</p>
      ) : (
        <>
          {/* Templates */}
          <h2 className="font-mono text-sm font-bold text-[#8b5cf6] mb-4">Chain Templates</h2>
          <div className="space-y-3 mb-10">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[#111111] border border-[#1a1a1a] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="font-mono text-sm text-white font-bold">
                      {template.name}
                    </span>
                    <p className="text-xs text-[#6b6b6b] mt-1">{template.description}</p>
                    <PipelineViz steps={template.agent_chain_steps} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={activateFreq[template.template_key || ""] || "24h"}
                      onChange={(e) =>
                        setActivateFreq((prev) => ({
                          ...prev,
                          [template.template_key || ""]: e.target.value,
                        }))
                      }
                      className="bg-[#0a0a0a] border border-[#1a1a1a] px-2 py-1.5 font-mono text-[10px] text-white focus:outline-none"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => activateTemplate(template.template_key || "")}
                      disabled={activating === template.template_key}
                      className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                      style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
                    >
                      {activating === template.template_key ? "Activating..." : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
                <p className="font-mono text-sm text-[#6b6b6b]">
                  No templates available. Run supabase-schema-v10.sql first.
                </p>
              </div>
            )}
          </div>

          {/* User Chains */}
          <h2 className="font-mono text-sm font-bold text-[#22c55e] mb-4">My Chains</h2>
          {userChains.length === 0 ? (
            <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
              <p className="font-mono text-sm text-[#6b6b6b]">
                No chains activated yet. Pick a template above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userChains.map((chain) => (
                <div
                  key={chain.id}
                  className="bg-[#111111] border border-[#1a1a1a] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="font-mono text-sm text-white font-bold">
                        {chain.name}
                      </span>
                      <p className="text-xs text-[#6b6b6b] mt-1">{chain.description}</p>
                      <PipelineViz steps={chain.agent_chain_steps} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => runChain(chain.id)}
                        disabled={runningChain === chain.id}
                        className="font-mono text-[10px] text-[#4a9eff] hover:text-white px-2 py-1 border border-[#4a9eff]/30 hover:border-[#4a9eff] transition-colors disabled:opacity-50"
                      >
                        {runningChain === chain.id ? "Starting..." : "Run Now"}
                      </button>
                      <button
                        onClick={() => deleteChain(chain.id)}
                        className="font-mono text-[10px] text-[#ef4444] hover:text-white px-2 py-1 border border-[#ef4444]/30 hover:border-[#ef4444] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
