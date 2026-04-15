"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";

const QUICK_ACTIONS = [
  { label: "Brief me", prompt: "Brief me — read my core context files and give me a summary of where things stand.", icon: "📋" },
  { label: "Draft content", prompt: "/draft ", icon: "✏️" },
  { label: "Brainstorm campaign", prompt: "Brainstorm a campaign idea for my next launch based on my audience and offer.", icon: "💡" },
  { label: "Find gaps", prompt: "Audit my vault — what's missing, outdated, or needs more depth?", icon: "🔎" },
];

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "strategy", label: "Strategy" },
  { id: "creative", label: "Creative" },
  { id: "execution", label: "Execution" },
  { id: "research", label: "Research" },
] as const;

function getCategory(agentId: string): string {
  if (["strategy", "product"].includes(agentId)) return "strategy";
  if (["brand", "gtm", "sales"].includes(agentId)) return "creative";
  if (["engineering", "client-success"].includes(agentId)) return "execution";
  return "research";
}

export default function AgentsBrowser() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"ask" | "agents">("ask");
  const [category, setCategory] = useState("all");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (activeTab === "agents") {
      // Orchestrate mode — runs multiple agents
      router.push(`/vault/agents/orchestrate?goal=${encodeURIComponent(prompt.trim())}`);
    } else {
      // Codify mode — single agent
      router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  }

  const filteredAgents = category === "all"
    ? AGENTS
    : AGENTS.filter((a) => getCategory(a.id) === category);

  return (
    <div className="flex flex-col items-center min-h-full">
      {/* Branding header */}
      <div className="pt-12 pb-6 text-center">
        {activeTab === "ask" ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h1 className="text-2xl font-sans font-bold text-foreground">Codify</h1>
            </div>
            <p className="text-sm text-muted">Your AI strategist — grounded in your vault</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-8 h-8 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <h1 className="text-2xl font-sans font-bold text-foreground">Orchestrate</h1>
            </div>
            <p className="text-sm text-muted">Your full-stack marketing team — 8 specialist agents</p>
          </>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-full p-1 mb-6">
        <button
          onClick={() => setActiveTab("ask")}
          className={`px-5 py-1.5 text-xs font-medium rounded-full transition-colors ${
            activeTab === "ask"
              ? "bg-blue text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Ask
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`px-5 py-1.5 text-xs font-medium rounded-full transition-colors ${
            activeTab === "agents"
              ? "bg-purple text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Agents
        </button>
      </div>

      {/* Prompt bar */}
      <div className="w-full max-w-2xl px-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="relative border border-border rounded-2xl bg-surface focus-within:border-blue/40 transition-colors overflow-hidden"
            style={{
              background: activeTab === "agents"
                ? "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))"
                : undefined,
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === "ask"
                  ? "Ask Codify anything about your business..."
                  : "Describe the work that keeps you from what matters..."
              }
              rows={2}
              className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-5 pt-4 pb-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-dim">
                  {activeTab === "ask" ? "Codify" : "Orchestrate"} mode
                </span>
              </div>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-20 transition-colors ${
                  activeTab === "ask"
                    ? "bg-blue text-white hover:bg-blue/80"
                    : "bg-purple text-white hover:bg-purple/80"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Content based on active tab */}
      <div className="w-full max-w-4xl px-6 pb-12">
        {activeTab === "ask" ? (
          /* --- ASK TAB: Quick actions --- */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setPrompt(action.prompt);
                    router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(action.prompt)}`);
                  }}
                  className="flex flex-col items-start gap-2 p-4 bg-surface border border-border rounded-xl hover:border-blue/30 transition-colors text-left group"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-xs font-medium text-muted group-hover:text-foreground transition-colors">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Featured agents preview */}
            <div className="text-center">
              <p className="text-xs text-dim mb-4">or choose a specialist agent</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {AGENTS.slice(0, 4).map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/vault/agents/${agent.id}`}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{agent.emoji}</span>
                    </div>
                    <span className="text-[11px] text-muted group-hover:text-foreground transition-colors">{agent.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* --- AGENTS TAB: Full agent browser --- */
          <div>
            {/* Featured agents — floating avatars */}
            <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
              {AGENTS.map((agent, i) => (
                <Link
                  key={agent.id}
                  href={`/vault/agents/${agent.id}`}
                  className="flex flex-col items-center gap-2 group"
                  style={{ transform: `translateY(${i % 2 === 0 ? -8 : 8}px)` }}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg shadow-black/30 group-hover:scale-110 transition-transform ring-2 ring-black/20`}>
                    <span className="text-2xl">{agent.emoji}</span>
                  </div>
                  <span className="text-[11px] text-muted group-hover:text-foreground transition-colors">{agent.name}</span>
                </Link>
              ))}
            </div>

            {/* Category filter tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                    category === cat.id
                      ? "text-purple border-purple"
                      : "text-muted border-transparent hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Agent list */}
            <div className="space-y-1">
              {filteredAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/vault/agents/${agent.id}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
                >
                  {/* Gradient avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 shadow-md shadow-black/20`}>
                    <span className="text-lg">{agent.emoji}</span>
                  </div>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-sans font-bold text-foreground">{agent.name}</h3>
                    <p className="text-xs text-muted truncate">{agent.shortDescription}</p>
                  </div>

                  {/* Skills */}
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
                  <span className="px-4 py-2 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Chat
                  </span>
                </Link>
              ))}
            </div>

            {/* Create your own */}
            <div className="mt-8 pt-6 border-t border-border">
              <Link
                href="/vault/agents/create"
                className="flex items-center gap-4 px-4 py-4 rounded-xl border border-dashed border-border hover:border-purple/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 group-hover:bg-purple/10 transition-colors">
                  <span className="text-lg text-muted group-hover:text-purple transition-colors">+</span>
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-foreground">Create your own agent</h3>
                  <p className="text-xs text-muted">Build a custom agent for your specific workflow</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
