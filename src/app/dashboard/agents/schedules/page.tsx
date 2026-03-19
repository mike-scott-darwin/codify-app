"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import type { AgentType } from "@/lib/agents/types";

interface Schedule {
  id: string;
  name: string;
  schedule_type: string;
  cron_expression: string;
  agent_type: string | null;
  chain_id: string | null;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  max_runs: number | null;
  agent_chains: { name: string } | null;
}

const FREQUENCY_LABELS: Record<string, string> = {
  "4h": "Every 4 hours",
  "8h": "Every 8 hours",
  "12h": "Every 12 hours",
  "24h": "Daily",
  "7d": "Weekly",
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

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"single" | "chain">("single");
  const [formAgentType, setFormAgentType] = useState<string>("congruence_audit");
  const [formFrequency, setFormFrequency] = useState("24h");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/agent/schedules");
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch {
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const toggleSchedule = async (id: string, enabled: boolean) => {
    await fetch("/api/agent/schedules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled } : s))
    );
  };

  const deleteSchedule = async (id: string) => {
    await fetch("/api/agent/schedules?id=" + id, { method: "DELETE" });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const createSchedule = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          scheduleType: formType,
          agentType: formType === "single" ? formAgentType : undefined,
          frequency: formFrequency,
        }),
      });
      const data = await res.json();
      if (data.schedule) {
        setSchedules((prev) => [data.schedule, ...prev]);
        setShowForm(false);
        setFormName("");
      } else {
        setError(data.error || "Failed to create schedule.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setCreating(false);
    }
  };

  const runNow = async (schedule: Schedule) => {
    if (schedule.schedule_type === "single" && schedule.agent_type) {
      const res = await fetch("/api/agent/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: schedule.agent_type, config: {} }),
      });
      const data = await res.json();
      if (data.jobId) {
        window.location.href = "/dashboard/agents/" + data.jobId;
      }
    } else if (schedule.schedule_type === "chain" && schedule.chain_id) {
      await fetch("/api/agent/chains/" + schedule.chain_id, { method: "POST" });
      fetchSchedules();
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Schedules</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        Automate agent runs on a recurring schedule.
      </p>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-[#1a1a1a] mb-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={
              "font-mono text-xs px-4 py-2.5 border-b-2 transition-colors " +
              (tab.key === "schedules"
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

      {/* New Schedule Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="font-mono text-xs font-bold px-4 py-2 mb-6 hover:brightness-110 transition-all"
          style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
        >
          + New Schedule
        </button>
      ) : (
        <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-6 space-y-4">
          <div>
            <label className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider block mb-1">
              Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Daily Audit"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider block mb-1">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "single" | "chain")}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:border-[#22c55e] focus:outline-none"
              >
                <option value="single">Single Agent</option>
                <option value="chain">Chain (use Chains tab)</option>
              </select>
            </div>

            {formType === "single" && (
              <div className="flex-1">
                <label className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider block mb-1">
                  Agent
                </label>
                <select
                  value={formAgentType}
                  onChange={(e) => setFormAgentType(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:border-[#22c55e] focus:outline-none"
                >
                  {Object.entries(AGENT_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1">
              <label className="font-mono text-[10px] text-[#6b6b6b] uppercase tracking-wider block mb-1">
                Frequency
              </label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:border-[#22c55e] focus:outline-none"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createSchedule}
              disabled={!formName || creating}
              className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
            >
              {creating ? "Creating..." : "Create Schedule"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="font-mono text-xs px-4 py-2 text-[#6b6b6b] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schedule List */}
      {loading ? (
        <p className="font-mono text-sm text-[#6b6b6b]">Loading schedules...</p>
      ) : schedules.length === 0 ? (
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
          <p className="font-mono text-sm text-[#6b6b6b]">No schedules yet.</p>
          <p className="font-mono text-xs text-[#4a4a4a] mt-1">
            Create a schedule above or activate a chain from the Chains tab.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-[#111111] border border-[#1a1a1a] p-4 flex items-center gap-4"
            >
              {/* Toggle */}
              <button
                onClick={() => toggleSchedule(schedule.id, !schedule.enabled)}
                className={
                  "w-10 h-5 rounded-full relative transition-colors " +
                  (schedule.enabled ? "bg-[#22c55e]" : "bg-[#2a2a2a]")
                }
              >
                <span
                  className={
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform " +
                    (schedule.enabled ? "left-5" : "left-0.5")
                  }
                />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white font-bold truncate">
                    {schedule.name}
                  </span>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5 border"
                    style={{
                      color: schedule.schedule_type === "chain" ? "#8b5cf6" : "#4a9eff",
                      borderColor:
                        schedule.schedule_type === "chain"
                          ? "rgba(139,92,246,0.3)"
                          : "rgba(74,158,255,0.3)",
                    }}
                  >
                    {schedule.schedule_type === "chain"
                      ? schedule.agent_chains?.name || "CHAIN"
                      : schedule.agent_type
                        ? AGENT_CONFIGS[schedule.agent_type as AgentType]?.label || schedule.agent_type
                        : "SINGLE"}
                  </span>
                  <span className="font-mono text-[9px] text-[#22c55e] border border-[#22c55e]/30 px-1.5 py-0.5">
                    {FREQUENCY_LABELS[schedule.cron_expression] || schedule.cron_expression}
                  </span>
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="font-mono text-[10px] text-[#4a4a4a]">
                    Last: {formatTime(schedule.last_run_at)}
                  </span>
                  <span className="font-mono text-[10px] text-[#4a4a4a]">
                    Next: {formatTime(schedule.next_run_at)}
                  </span>
                  <span className="font-mono text-[10px] text-[#4a4a4a]">
                    Runs: {schedule.run_count}
                    {schedule.max_runs ? "/" + schedule.max_runs : ""}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => runNow(schedule)}
                className="font-mono text-[10px] text-[#4a9eff] hover:text-white px-2 py-1 border border-[#4a9eff]/30 hover:border-[#4a9eff] transition-colors"
              >
                Run Now
              </button>
              <button
                onClick={() => deleteSchedule(schedule.id)}
                className="font-mono text-[10px] text-[#ef4444] hover:text-white px-2 py-1 border border-[#ef4444]/30 hover:border-[#ef4444] transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
