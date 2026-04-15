"use client";

import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export default function MyAgentsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* Floating avatars */}
      <div className="relative w-[280px] h-[180px] mb-6">
        {AGENTS.slice(0, 4).map((agent, i) => {
          const positions = [
            { top: "15%", left: "30%" },
            { top: "10%", left: "60%" },
            { top: "55%", left: "20%" },
            { top: "50%", left: "55%" },
          ];
          const pos = positions[i];
          return (
            <div
              key={agent.id}
              className={`absolute w-12 h-12 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg shadow-black/30 ring-2 ring-black/20 opacity-40`}
              style={{ top: pos.top, left: pos.left }}
            >
              <span className="text-lg">{agent.emoji}</span>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-sans font-bold text-foreground mb-2">My Agents</h2>
      <p className="text-sm text-muted mb-6 text-center max-w-sm">
        Build an AI agent that can think, act, and automate work for you.
      </p>

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
