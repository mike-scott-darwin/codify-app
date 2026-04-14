"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";

const AGENT_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "strategy", label: "Strategy" },
  { id: "creative", label: "Creative" },
  { id: "execution", label: "Execution" },
] as const;

function getCategory(agentId: string): string {
  if (["strategy", "research", "product"].includes(agentId)) return "strategy";
  if (["brand", "gtm", "sales"].includes(agentId)) return "creative";
  return "execution";
}

export default function AgentsBrowser() {
  const [prompt, setPrompt] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(prompt.trim())}`);
  }

  function handleOrchestrate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    // Orchestrate sends to strategy agent which coordinates
    router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(`[ORCHESTRATE] ${prompt.trim()}`)}`);
  }

  const filteredAgents = filter === "all"
    ? AGENTS
    : AGENTS.filter((a) => getCategory(a.id) === filter);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 className="text-xl font-sans font-bold text-foreground">AI Agents</h1>
      </div>

      {/* Prompt bar */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="border border-border rounded-xl bg-surface focus-within:border-blue/40 transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you need done? Describe the goal and an agent will handle it..."
            rows={2}
            className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-4 pt-3 pb-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-[11px] text-dim">Enter to send to best agent</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOrchestrate}
                disabled={!prompt.trim()}
                className="px-3 py-1.5 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg disabled:opacity-30 hover:bg-purple/20 transition-colors"
              >
                Orchestrate
              </button>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="px-3 py-1.5 text-xs bg-blue text-white rounded-lg disabled:opacity-30 hover:bg-blue/80 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {AGENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              filter === cat.id
                ? "text-blue border-blue"
                : "text-muted border-transparent hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Orchestrate banner */}
      <div className="bg-purple/5 border border-purple/20 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-foreground">Orchestrate</h3>
            <p className="text-xs text-muted">Run all 8 agents as a full-stack marketing team on a single goal</p>
          </div>
        </div>
        <Link
          href="/vault/agents/strategy?prompt=%5BORCHESTRATE%5D%20"
          className="px-4 py-2 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg hover:bg-purple/20 transition-colors"
        >
          Start
        </Link>
      </div>

      {/* Agent list */}
      <div className="space-y-1">
        {filteredAgents.map((agent) => {
          // Map agent colors to background shades
          const bgMap: Record<string, string> = {
            "text-blue": "bg-blue/10",
            "text-purple": "bg-purple/10",
            "text-green": "bg-green/10",
            "text-amber": "bg-amber/10",
            "text-cyan": "bg-cyan/10",
            "text-red": "bg-red/10",
          };
          const avatarBg = bgMap[agent.color] || "bg-blue/10";

          return (
            <div
              key={agent.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-lg ${avatarBg} flex items-center justify-center shrink-0`}>
                <span className={`text-lg ${agent.color}`}>{agent.icon}</span>
              </div>

              {/* Name + description */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-sans font-bold text-foreground">{agent.name}</h3>
                <p className="text-xs text-muted truncate">{agent.shortDescription}</p>
              </div>

              {/* Skills badges */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                {agent.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-[10px] text-dim bg-background border border-border rounded font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Chat button */}
              <Link
                href={`/vault/agents/${agent.id}`}
                className="px-4 py-2 text-xs text-blue bg-blue/10 border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                Chat
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
