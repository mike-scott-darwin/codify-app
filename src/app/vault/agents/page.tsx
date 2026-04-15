"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import { SKILLS } from "@/lib/skills";

export default function AgentsBrowser() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"codify" | "orchestrate">("codify");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (activeTab === "orchestrate") {
      router.push(`/vault/agents/orchestrate?goal=${encodeURIComponent(prompt.trim())}`);
    } else {
      router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-full">
      {/* Branding header */}
      <div className="pt-12 pb-4 text-center">
        {activeTab === "codify" ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h1 className="text-2xl font-sans font-bold text-foreground">Codify</h1>
            </div>
            <p className="text-sm text-muted">One agent. Your vault. Manual skills you trigger.</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-8 h-8 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <h1 className="text-2xl font-sans font-bold text-foreground">Orchestrate</h1>
            </div>
            <p className="text-sm text-muted">Autonomous agent team. They talk to each other. You set the goal.</p>
          </>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-full p-1 mb-6">
        <button
          onClick={() => setActiveTab("codify")}
          className={`px-5 py-1.5 text-xs font-medium rounded-full transition-colors ${
            activeTab === "codify"
              ? "bg-blue text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Codify
        </button>
        <button
          onClick={() => setActiveTab("orchestrate")}
          className={`px-5 py-1.5 text-xs font-medium rounded-full transition-colors ${
            activeTab === "orchestrate"
              ? "bg-purple text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Orchestrate
        </button>
      </div>

      {/* Prompt bar */}
      <div className="w-full max-w-2xl px-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="relative border border-border rounded-2xl bg-surface focus-within:border-blue/40 transition-colors overflow-hidden"
            style={{
              background: activeTab === "orchestrate"
                ? "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))"
                : undefined,
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                activeTab === "codify"
                  ? "Ask anything or type a /skill command..."
                  : "Describe the goal for your agent team..."
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
              <span className="text-[11px] text-dim">
                {activeTab === "codify" ? "1 agent reads your vault" : "Multiple agents coordinate autonomously"}
              </span>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-20 transition-colors ${
                  activeTab === "codify"
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

      {/* Content */}
      <div className="w-full max-w-4xl px-6 pb-12">
        {activeTab === "codify" ? (
          /* ═══ CODIFY TAB: Single agent + skills ═══ */
          <div>
            {/* How it works */}
            <div className="flex items-center gap-4 mb-6 px-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-black/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-sans font-bold text-foreground">One agent. Your 4 core files.</h2>
                <p className="text-xs text-muted">Reads your Soul, Offer, Audience, and Voice — then executes the skill you choose.</p>
              </div>
            </div>

            {/* Skills grid */}
            <p className="text-xs text-dim uppercase tracking-wider px-2 mb-3">Skills</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    setPrompt(skill.command + " ");
                  }}
                  className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl hover:border-blue/30 transition-colors text-left group"
                >
                  <span className="text-xl mt-0.5">{skill.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-sans font-bold text-foreground group-hover:text-blue transition-colors">{skill.name}</span>
                      <span className="text-[11px] text-dim font-mono">{skill.command}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{skill.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Upgrade nudge */}
            <div className="mt-8 bg-purple/5 border border-purple/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-sans font-bold text-foreground">Need agents working together?</p>
                <p className="text-xs text-muted mt-0.5">Orchestrate runs a full agent team autonomously on your goal.</p>
              </div>
              <button
                onClick={() => setActiveTab("orchestrate")}
                className="px-4 py-2 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg hover:bg-purple/20 transition-colors shrink-0"
              >
                Try Orchestrate
              </button>
            </div>
          </div>
        ) : (
          /* ═══ ORCHESTRATE TAB: Autonomous agent team ═══ */
          <div>
            {/* How it works */}
            <div className="bg-surface border border-purple/20 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {AGENTS.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center ring-2 ring-[#0a0a0a]`}
                    >
                      <span className="text-sm">{agent.emoji}</span>
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center ring-2 ring-[#0a0a0a]">
                    <span className="text-[10px] text-muted">+3</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-sans font-bold text-foreground">8 specialist agents. One goal.</p>
                  <p className="text-xs text-muted">They read your vault, coordinate with each other, and deliver the result.</p>
                </div>
              </div>

              {/* Pipeline visualisation */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-dim">You set goal</span>
                  <svg className="w-4 h-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] px-2 py-1 bg-blue/10 text-blue rounded-md">Strategy plans</span>
                  <svg className="w-3 h-3 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] px-2 py-1 bg-amber/10 text-amber rounded-md">Research feeds</span>
                  <svg className="w-3 h-3 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] px-2 py-1 bg-purple/10 text-purple rounded-md">Brand checks</span>
                  <svg className="w-3 h-3 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] px-2 py-1 bg-green/10 text-green rounded-md">Output delivered</span>
                </div>
              </div>
            </div>

            {/* Agent team grid */}
            <p className="text-xs text-dim uppercase tracking-wider px-2 mb-3">Your Agent Team</p>
            <div className="space-y-1 mb-8">
              {AGENTS.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/vault/agents/${agent.id}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 shadow-md shadow-black/20`}>
                    <span className="text-lg">{agent.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-sans font-bold text-foreground">{agent.name}</h3>
                    <p className="text-xs text-muted truncate">{agent.shortDescription}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {agent.knowledgeSources.slice(0, 2).map((source) => (
                      <span
                        key={source}
                        className="px-2 py-0.5 text-[10px] text-dim bg-background border border-border rounded font-mono"
                      >
                        {source.replace("reference/core/", "").replace(".md", "")}
                      </span>
                    ))}
                  </div>
                  <span className="px-3 py-1.5 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Configure
                  </span>
                </Link>
              ))}
            </div>

            {/* Run orchestration CTA */}
            <Link
              href="/vault/agents/orchestrate"
              className="flex items-center justify-center gap-3 p-5 bg-purple/10 border border-purple/30 rounded-xl hover:bg-purple/15 transition-colors group"
            >
              <svg className="w-6 h-6 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-sans font-bold text-foreground group-hover:text-purple transition-colors">Run Orchestration</p>
                <p className="text-xs text-muted">Set a goal and let your agent team deliver</p>
              </div>
            </Link>

            {/* Create agent */}
            <div className="mt-4">
              <Link
                href="/vault/agents/create"
                className="flex items-center gap-4 px-4 py-4 rounded-xl border border-dashed border-border hover:border-purple/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 group-hover:bg-purple/10 transition-colors">
                  <span className="text-lg text-muted group-hover:text-purple transition-colors">+</span>
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-foreground">Create a custom agent</h3>
                  <p className="text-xs text-muted">Add a specialist to your team for a specific workflow</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
