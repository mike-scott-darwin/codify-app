"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { SKILLS } from "@/lib/skills";

export default function AgentNavPanel() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-sans font-bold text-foreground">AI</span>
      </div>

      {/* Codify — single agent */}
      <div className="border-b border-border py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Codify</p>
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
        {SKILLS.slice(0, 5).map((skill) => (
          <Link
            key={skill.id}
            href={`/vault/agents/strategy?prompt=${encodeURIComponent(skill.command + " ")}`}
            className="flex items-center gap-3 px-4 py-1.5 text-[12px] text-dim hover:text-muted hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="text-xs">{skill.emoji}</span>
            <span className="font-mono">{skill.command}</span>
          </Link>
        ))}
      </div>

      {/* Orchestrate — agent team */}
      <div className="border-b border-border py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-purple uppercase tracking-wider">Orchestrate</p>
        <Link
          href="/vault/agents/orchestrate"
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
            pathname === "/vault/agents/orchestrate"
              ? "text-purple bg-purple/5"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <svg className="w-3.5 h-3.5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
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
      </div>

      {/* Agent team list */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Agent Team</p>
        {AGENTS.map((agent) => {
          const active = pathname === `/vault/agents/${agent.id}`;
          return (
            <Link
              key={agent.id}
              href={`/vault/agents/${agent.id}`}
              className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
                active
                  ? "text-purple bg-purple/5"
                  : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-sm">{agent.emoji}</span>
              <span className="truncate">{agent.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
