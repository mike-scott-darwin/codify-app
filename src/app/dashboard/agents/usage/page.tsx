"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import type { AgentType } from "@/lib/agents/types";

interface UsageData {
  month: string;
  totalTokens: number;
  totalCost: number;
  totalRuns: number;
  byAgent: Record<string, { runs: number; tokens: number; cost: number }>;
  budget: {
    monthly_token_cap: number | null;
    monthly_cost_cap: number | null;
    alert_threshold: number;
  } | null;
}

const TABS = [
  { key: "agents", label: "Agents", href: "/dashboard/agents" },
  { key: "schedules", label: "Schedules", href: "/dashboard/agents/schedules" },
  { key: "chains", label: "Chains", href: "/dashboard/agents/chains" },
  { key: "usage", label: "Usage", href: "/dashboard/agents/usage" },
];

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [costCap, setCostCap] = useState("");
  const [tokenCap, setTokenCap] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/agent/usage");
      const data = await res.json();
      setUsage(data);
      if (data.budget) {
        setCostCap(data.budget.monthly_cost_cap ? String(data.budget.monthly_cost_cap) : "");
        setTokenCap(data.budget.monthly_token_cap ? String(data.budget.monthly_token_cap) : "");
      }
    } catch {
      setError("Failed to load usage data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsage(); }, []);

  const saveBudget = async () => {
    setSaving(true);
    try {
      await fetch("/api/agent/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyCostCap: costCap ? parseFloat(costCap) : null,
          monthlyTokenCap: tokenCap ? parseInt(tokenCap) : null,
        }),
      });
      await fetchUsage();
    } catch {
      setError("Failed to save budget settings.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate budget warning
  const budgetWarning = usage?.budget?.monthly_cost_cap
    ? (usage.totalCost / usage.budget.monthly_cost_cap) * 100
    : null;
  const showWarning =
    budgetWarning !== null &&
    usage?.budget?.alert_threshold &&
    budgetWarning >= usage.budget.alert_threshold;

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Usage</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        Token usage, costs, and budget controls.
      </p>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-[#1a1a1a] mb-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={
              "font-mono text-xs px-4 py-2.5 border-b-2 transition-colors " +
              (tab.key === "usage"
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

      {/* Budget Warning */}
      {showWarning && (
        <div className="bg-[#111111] border border-[#f59e0b] p-4 mb-6">
          <p className="font-mono text-sm text-[#f59e0b]">
            ⚠ Budget alert: You have used {budgetWarning?.toFixed(0)}% of your monthly cost cap
            (${usage?.totalCost.toFixed(4)} / ${usage?.budget?.monthly_cost_cap?.toFixed(2)})
          </p>
        </div>
      )}

      {loading ? (
        <p className="font-mono text-sm text-[#6b6b6b]">Loading usage data...</p>
      ) : usage ? (
        <>
          {/* Monthly Summary */}
          <h2 className="font-mono text-sm font-bold text-[#8b5cf6] mb-4">{usage.month}</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111111] border border-[#1a1a1a] p-5">
              <p className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider mb-1">
                Total Tokens
              </p>
              <p className="font-mono text-2xl text-white font-bold">
                {formatTokens(usage.totalTokens)}
              </p>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] p-5">
              <p className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider mb-1">
                Est. Cost
              </p>
              <p className="font-mono text-2xl text-white font-bold">
                ${usage.totalCost.toFixed(4)}
              </p>
            </div>
            <div className="bg-[#111111] border border-[#1a1a1a] p-5">
              <p className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider mb-1">
                Total Runs
              </p>
              <p className="font-mono text-2xl text-white font-bold">{usage.totalRuns}</p>
            </div>
          </div>

          {/* Per-Agent Table */}
          <h2 className="font-mono text-sm font-bold text-[#22c55e] mb-4">Per-Agent Breakdown</h2>
          <div className="bg-[#111111] border border-[#1a1a1a] mb-8">
            <div className="grid grid-cols-4 gap-4 p-3 border-b border-[#1a1a1a]">
              <span className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider">
                Agent
              </span>
              <span className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider text-right">
                Runs
              </span>
              <span className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider text-right">
                Tokens
              </span>
              <span className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider text-right">
                Cost
              </span>
            </div>
            {Object.keys(usage.byAgent).length === 0 ? (
              <div className="p-4 text-center">
                <p className="font-mono text-xs text-[#4a4a4a]">No usage data this month.</p>
              </div>
            ) : (
              Object.entries(usage.byAgent).map(([type, data]) => {
                const config = AGENT_CONFIGS[type as AgentType];
                return (
                  <div
                    key={type}
                    className="grid grid-cols-4 gap-4 p-3 border-b border-[#0a0a0a] last:border-0"
                  >
                    <span className="font-mono text-xs text-white">
                      {config?.icon || "?"} {config?.label || type}
                    </span>
                    <span className="font-mono text-xs text-[#6b6b6b] text-right">
                      {data.runs}
                    </span>
                    <span className="font-mono text-xs text-[#6b6b6b] text-right">
                      {formatTokens(data.tokens)}
                    </span>
                    <span className="font-mono text-xs text-[#6b6b6b] text-right">
                      ${data.cost.toFixed(4)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Budget Settings */}
          <h2 className="font-mono text-sm font-bold text-[#4a9eff] mb-4">Budget Settings</h2>
          <div className="bg-[#111111] border border-[#1a1a1a] p-5 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider block mb-1">
                  Monthly Cost Cap (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costCap}
                  onChange={(e) => setCostCap(e.target.value)}
                  placeholder="e.g. 10.00"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:border-[#4a9eff] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider block mb-1">
                  Monthly Token Cap
                </label>
                <input
                  type="number"
                  value={tokenCap}
                  onChange={(e) => setTokenCap(e.target.value)}
                  placeholder="e.g. 1000000"
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:border-[#4a9eff] focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={saveBudget}
              disabled={saving}
              className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ backgroundColor: "#4a9eff", color: "#000", borderRadius: 0 }}
            >
              {saving ? "Saving..." : "Save Budget Settings"}
            </button>
          </div>
        </>
      ) : (
        <p className="font-mono text-sm text-[#6b6b6b]">No usage data available.</p>
      )}
    </>
  );
}
