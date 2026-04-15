"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENTS } from "@/lib/agents";

export default function AgentNavPanel() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-sans font-bold text-foreground">AI</span>
        </div>
      </div>

      {/* Ask or Create */}
      <div className="border-b border-border py-2">
        <Link
          href="/vault/agents"
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
            pathname === "/vault/agents"
              ? "text-blue bg-blue/5"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <span className="text-sm">✦</span>
          Ask or Create
        </Link>
      </div>

      {/* Orchestrate section */}
      <div className="border-b border-border py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Orchestrate</p>
        <Link
          href="/vault/agents/orchestrate"
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
            pathname === "/vault/agents/orchestrate"
              ? "text-purple bg-purple/5"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <svg className="w-3.5 h-3.5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
          </svg>
          Run Orchestration
        </Link>
        <Link
          href="/vault/agents/create"
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
            pathname === "/vault/agents/create"
              ? "text-blue bg-blue/5"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <span className="text-red text-sm">+</span>
          Create Agent
        </Link>
        <Link
          href="/vault/agents?view=all"
          className="flex items-center gap-3 px-4 py-2 text-[13px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
        >
          <span className="text-purple text-sm">◉</span>
          All Agents
        </Link>
        <Link
          href="/vault/agents?view=mine"
          className="flex items-center gap-3 px-4 py-2 text-[13px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
        >
          <span className="text-green text-sm">●</span>
          My Agents
        </Link>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Agents</p>
        {AGENTS.map((agent) => {
          const active = pathname === `/vault/agents/${agent.id}`;
          return (
            <Link
              key={agent.id}
              href={`/vault/agents/${agent.id}`}
              className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
                active
                  ? "text-blue bg-blue/5"
                  : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
              }`}
            >
              <span className={`text-sm ${agent.color}`}>{agent.icon}</span>
              <span className="truncate">{agent.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
