"use client";

import { useState } from "react";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export default function AllAgentsPage() {
  const [view, setView] = useState<"gallery" | "list">("gallery");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-sans font-bold text-foreground">All Agents</h1>
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={() => setView("gallery")}
            title="Gallery view"
            className={`p-1.5 rounded-md transition-colors ${
              view === "gallery" ? "bg-surface text-foreground" : "text-dim hover:text-muted"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setView("list")}
            title="List view"
            className={`p-1.5 rounded-md transition-colors ${
              view === "list" ? "bg-surface text-foreground" : "text-dim hover:text-muted"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="2.5" rx="1" />
              <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
              <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {view === "gallery" ? (
        /* ─── Gallery view ─── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent) => (
            <Link
              key={agent.id}
              href={`/vault/agents/${agent.id}`}
              className="flex flex-col items-center gap-3 p-5 bg-surface border border-border rounded-xl hover:border-purple/30 transition-colors group"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg shadow-black/30 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{agent.emoji}</span>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-sans font-bold text-foreground">{agent.name}</h3>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{agent.shortDescription}</p>
              </div>
            </Link>
          ))}

          {/* Create new agent card */}
          <Link
            href="/vault/agents/create"
            className="flex flex-col items-center justify-center gap-3 p-5 border border-dashed border-border rounded-xl hover:border-purple/30 transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center group-hover:bg-purple/10 transition-colors">
              <span className="text-2xl text-dim group-hover:text-purple transition-colors">+</span>
            </div>
            <span className="text-sm font-sans font-bold text-muted group-hover:text-foreground transition-colors">Create Agent</span>
          </Link>
        </div>
      ) : (
        /* ─── List view ─── */
        <div className="space-y-1">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2 text-[11px] text-dim uppercase tracking-wider">
            <span className="w-10" />
            <span className="flex-1">Agent</span>
            <span className="w-32 hidden sm:block">Skills</span>
            <span className="w-20 text-right">Actions</span>
          </div>

          {AGENTS.map((agent) => (
            <Link
              key={agent.id}
              href={`/vault/agents/${agent.id}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 shadow-md shadow-black/20`}>
                <span className="text-base">{agent.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-sans font-bold text-foreground">{agent.name}</h3>
                <p className="text-xs text-muted truncate">{agent.shortDescription}</p>
              </div>
              <div className="w-32 hidden sm:flex items-center gap-1.5 shrink-0">
                {agent.skills.slice(0, 2).map((skill) => (
                  <span key={skill} className="px-2 py-0.5 text-[10px] text-dim bg-background border border-border rounded font-mono">
                    {skill}
                  </span>
                ))}
              </div>
              <span className="w-20 text-right">
                <span className="px-3 py-1.5 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Chat
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
