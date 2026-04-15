"use client";

import { useState } from "react";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import { MOCK_AUDIT_LOG, formatAuditTimestamp } from "@/lib/audit-log";

const TIME_RANGES = ["Today", "7 days", "30 days", "All time"];
const STATUS_OPTIONS = ["All", "Completed", "Running", "Failed"];

export default function AuditLogPage() {
  const [timeRange, setTimeRange] = useState("All time");
  const [status, setStatus] = useState("All");
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [agentFilter, setAgentFilter] = useState("all");

  const filtered = MOCK_AUDIT_LOG.filter((entry) => {
    if (status !== "All" && entry.status !== status.toLowerCase()) return false;
    if (agentFilter !== "all" && entry.agentId !== agentFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-sans font-bold text-foreground">Audit Log</h1>
        <button className="px-4 py-2 text-xs text-blue bg-blue/10 border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors">
          See AI Usage
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Time range */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === range
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                status === opt
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Scope */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={() => setScope("mine")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              scope === "mine" ? "bg-purple text-white" : "text-muted hover:text-foreground"
            }`}
          >
            My activity
          </button>
          <button
            onClick={() => setScope("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              scope === "all" ? "bg-purple text-white" : "text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
        </div>

        {/* Agent filter */}
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-[#1a1a1a] border border-border rounded-lg text-muted focus:outline-none focus:border-purple/40"
        >
          <option value="all">All agents</option>
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
          ))}
        </select>
      </div>

      {/* Audit log entries */}
      {filtered.length > 0 ? (
        <div className="space-y-1">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2 text-[11px] text-dim uppercase tracking-wider">
            <span className="w-16">Time</span>
            <span className="w-10" />
            <span className="flex-1">Action</span>
            <span className="w-20 text-right">Status</span>
          </div>

          {filtered.map((entry) => (
            <Link
              key={entry.id}
              href={`/vault/agents/${entry.agentId}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
            >
              <span className="w-16 text-xs text-dim tabular-nums shrink-0">
                {formatAuditTimestamp(entry.timestamp)}
              </span>
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                AGENTS.find(a => a.id === entry.agentId)?.gradient || "from-gray-500 to-gray-700"
              } flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-sm">{entry.agentEmoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground">{entry.agentName}</span>
                <span className="text-sm text-muted ml-2">{entry.action}</span>
              </div>
              <span className={`w-20 text-right text-xs px-2 py-0.5 rounded-md font-medium ${
                entry.status === "completed" ? "text-green bg-green/10" :
                entry.status === "running" ? "text-amber bg-amber/10 animate-pulse" :
                "text-red bg-red/10"
              }`}>
                {entry.status}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 mb-4">
            <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16">
              <rect x="8" y="12" width="36" height="24" rx="4" fill="#2a2a3a" />
              <rect x="14" y="18" width="20" height="3" rx="1.5" fill="#4a4a5a" />
              <rect x="14" y="24" width="14" height="3" rx="1.5" fill="#4a4a5a" />
              <rect x="20" y="28" width="36" height="20" rx="4" fill="#3a2a5a" />
              <rect x="26" y="34" width="20" height="3" rx="1.5" fill="#6a5a8a" />
              <rect x="26" y="40" width="12" height="3" rx="1.5" fill="#6a5a8a" />
              <circle cx="50" cy="20" r="8" fill="#7c3aed" />
              <path d="M46 20l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-base font-sans font-bold text-foreground mb-2">No activity found</h2>
          <p className="text-sm text-muted mb-6 text-center max-w-sm">
            We couldn&apos;t find activity that matches your filters.
          </p>
          <button
            onClick={() => { setStatus("All"); setScope("mine"); setAgentFilter("all"); setTimeRange("All time"); }}
            className="px-6 py-2.5 text-sm font-medium text-white bg-purple rounded-lg hover:bg-purple/80 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
