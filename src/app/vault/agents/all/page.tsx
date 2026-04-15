"use client";

import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export default function AllAgentsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* Floating avatars */}
      <div className="relative w-[320px] h-[200px] mb-6">
        {AGENTS.slice(0, 6).map((agent, i) => {
          const positions = [
            { top: "10%", left: "25%" },
            { top: "5%", left: "60%" },
            { top: "55%", left: "10%" },
            { top: "60%", left: "50%" },
            { top: "45%", left: "75%" },
            { top: "20%", left: "5%" },
          ];
          const pos = positions[i];
          const sizes = ["w-14 h-14", "w-12 h-12", "w-11 h-11", "w-13 h-13", "w-12 h-12", "w-10 h-10"];
          return (
            <div
              key={agent.id}
              className={`absolute ${sizes[i]} rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg shadow-black/30 ring-2 ring-black/20`}
              style={{ top: pos.top, left: pos.left }}
            >
              <span className="text-xl">{agent.emoji}</span>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-sans font-bold text-foreground mb-2">All Agents</h2>
      <p className="text-sm text-muted mb-1 text-center max-w-sm">
        Build an AI agent that can think, act, and automate work for you.
      </p>
      <p className="text-xs text-dim mb-6">Your Codify and Orchestrate agents appear here.</p>

      {/* Agent list */}
      <div className="w-full max-w-lg space-y-2 mb-8">
        {AGENTS.map((agent) => (
          <Link
            key={agent.id}
            href={`/vault/agents/${agent.id}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 shadow-md shadow-black/20`}>
              <span className="text-base">{agent.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-sans font-bold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted truncate">{agent.shortDescription}</p>
            </div>
            <span className="px-3 py-1.5 text-xs text-blue bg-blue/10 border border-blue/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              Chat
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/vault/agents/create"
        className="px-6 py-2.5 text-sm font-medium text-white bg-purple rounded-lg hover:bg-purple/80 transition-colors"
      >
        Create Agent
      </Link>
      <p className="text-xs text-dim mt-2">Takes ~ 2 minutes to set up</p>
    </div>
  );
}
