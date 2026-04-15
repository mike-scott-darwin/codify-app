"use client";

import { useState } from "react";

const STATUS_OPTIONS = ["All", "Completed", "Running", "Failed"];

export default function AgentActivityPage() {
  const [status, setStatus] = useState("All");
  const [scope, setScope] = useState<"mine" | "all">("mine");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-sans font-bold text-foreground">Activity</h1>
        <button className="px-4 py-2 text-xs text-blue bg-blue/10 border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors">
          See AI Usage
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        {/* Status filter */}
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

        {/* Scope toggle */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={() => setScope("mine")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              scope === "mine"
                ? "bg-purple text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            My activity
          </button>
          <button
            onClick={() => setScope("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              scope === "all"
                ? "bg-purple text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20">
        {/* Activity icon */}
        <div className="w-16 h-16 mb-4 relative">
          <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16">
            {/* Chat bubbles illustration */}
            <rect x="8" y="12" width="36" height="24" rx="4" fill="#2a2a3a" />
            <rect x="14" y="18" width="20" height="3" rx="1.5" fill="#4a4a5a" />
            <rect x="14" y="24" width="14" height="3" rx="1.5" fill="#4a4a5a" />
            <rect x="20" y="28" width="36" height="20" rx="4" fill="#3a2a5a" />
            <rect x="26" y="34" width="20" height="3" rx="1.5" fill="#6a5a8a" />
            <rect x="26" y="40" width="12" height="3" rx="1.5" fill="#6a5a8a" />
            {/* Checkmark */}
            <circle cx="50" cy="20" r="8" fill="#7c3aed" />
            <path d="M46 20l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-base font-sans font-bold text-foreground mb-2">No activity found</h2>
        <p className="text-sm text-muted mb-6 text-center max-w-sm">
          We couldn&apos;t find activity that matches your filters.
        </p>

        <button
          onClick={() => { setStatus("All"); setScope("mine"); }}
          className="px-6 py-2.5 text-sm font-medium text-white bg-purple rounded-lg hover:bg-purple/80 transition-colors"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
