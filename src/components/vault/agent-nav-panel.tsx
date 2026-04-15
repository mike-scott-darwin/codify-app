"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AgentNavPanel() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* AI sparkle icon — multicolor like ClickUp Brain */}
          <div className="w-5 h-5 relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="url(#sparkle-grad)" />
              <path d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z" fill="url(#sparkle-grad2)" />
              <defs>
                <linearGradient id="sparkle-grad" x1="4" y1="2" x2="20" y2="18">
                  <stop stopColor="#818cf8" />
                  <stop offset="0.5" stopColor="#c084fc" />
                  <stop offset="1" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="sparkle-grad2" x1="16" y1="14" x2="22" y2="20">
                  <stop stopColor="#c084fc" />
                  <stop offset="1" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-sm font-sans font-bold text-foreground">AI</span>
        </div>
      </div>

      {/* Ask or Create */}
      <div className="border-b border-border py-2">
        <Link
          href="/vault/agents"
          className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors rounded-md mx-2 ${
            pathname === "/vault/agents"
              ? "text-foreground bg-blue/10"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <svg className="w-4 h-4 text-blue" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
          </svg>
          Ask or Create
        </Link>
      </div>

      {/* Agents section */}
      <div className="border-b border-border py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Agents</p>

        <Link
          href="/vault/agents/create"
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors rounded-md mx-2 ${
            pathname === "/vault/agents/create"
              ? "text-foreground bg-blue/10"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <svg className="w-4 h-4 text-red" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Agent
        </Link>

        <Link
          href="/vault/agents/orchestrate"
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors rounded-md mx-2 ${
            pathname === "/vault/agents/orchestrate"
              ? "text-foreground bg-purple/10"
              : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <svg className="w-4 h-4 text-purple" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 00-2 2v1h14V6a2 2 0 00-2-2H5zM3 14a2 2 0 002 2h10a2 2 0 002-2V9H3v5zm5-3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          </svg>
          All Agents
        </Link>

        <Link
          href="/vault/agents/create"
          className="flex items-center gap-3 px-4 py-2 text-[13px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors rounded-md mx-2"
        >
          <svg className="w-4 h-4 text-green" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          My Agents
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Recent Activity</p>
        {/* Placeholder — will populate with real agent activity */}
        <div className="px-4 py-3 space-y-3">
          <p className="text-[12px] text-dim italic">No agent activity yet</p>
          <p className="text-[11px] text-dim leading-relaxed">
            Activity from your Codify and Orchestrate sessions will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
