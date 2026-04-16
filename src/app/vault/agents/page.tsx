"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EXTRACT_SKILLS, SKILLS } from "@/lib/skills";
import type { Skill } from "@/lib/skills";
import { AGENTS as AGENT_LIST } from "@/lib/agents";

const MODELS = [
  { id: "claude-sonnet", label: "Claude Sonnet", badge: "Fast" },
  { id: "claude-opus", label: "Claude Opus", badge: "Deep" },
  { id: "gpt-4o", label: "GPT-4o", badge: null },
  { id: "gemini-pro", label: "Gemini Pro", badge: null },
];

// Agent categories matching business owner needs
const CATEGORIES = ["All", "Marketing", "Sales", "Content", "Strategy", "Research", "Operations"] as const;

// Map agents to categories
const AGENT_CATEGORIES: Record<string, string[]> = {
  strategy: ["Strategy", "Operations"],
  brand: ["Marketing", "Content"],
  gtm: ["Marketing", "Sales"],
  sales: ["Sales"],
  product: ["Strategy", "Operations"],
  engineering: ["Operations"],
  "client-success": ["Sales", "Operations"],
  research: ["Research", "Strategy"],
};

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<"ask" | "orchestrate">("ask");
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [slashIdx, setSlashIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (input.startsWith("/")) {
      setSlashFilter(input.slice(1).toLowerCase());
      setShowSlashMenu(true);
      setSlashIdx(0);
    } else {
      setShowSlashMenu(false);
    }
  }, [input]);

  const filteredSkills = SKILLS.filter(
    (s) => s.command.toLowerCase().includes(slashFilter) || s.name.toLowerCase().includes(slashFilter)
  );

  function selectSkill(skill: Skill) {
    setInput(skill.command + " ");
    setShowSlashMenu(false);
    inputRef.current?.focus();
  }

  function handleSend() {
    if (!input.trim()) return;
    router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(input.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showSlashMenu && filteredSkills.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIdx((i) => Math.min(i + 1, filteredSkills.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Tab" || (e.key === "Enter" && showSlashMenu)) {
        e.preventDefault();
        selectSkill(filteredSkills[slashIdx]);
      } else if (e.key === "Escape") {
        setShowSlashMenu(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const filteredAgents = activeCategory === "All"
    ? AGENT_LIST
    : AGENT_LIST.filter((a: { id: string }) => AGENT_CATEGORIES[a.id]?.includes(activeCategory));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ═══ Shared header — branding + tabs ═══ */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          {activeTab === "ask" ? (
            <svg className="w-10 h-10 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.2">
              <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          )}
          <h1 className="text-4xl font-sans font-bold text-foreground tracking-tight">
            {activeTab === "ask" ? "Codify" : "Orchestrate"}
          </h1>
        </div>

        <div className="flex items-center gap-0.5 bg-[#1a1a1a] rounded-full p-0.5">
          <button
            onClick={() => setActiveTab("ask")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeTab === "ask" ? "bg-blue/15 text-blue" : "text-muted hover:text-foreground"
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
              <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ask
          </button>
          <button
            onClick={() => setActiveTab("orchestrate")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeTab === "orchestrate" ? "bg-purple/15 text-purple" : "text-muted hover:text-foreground"
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Orchestrate
          </button>
        </div>
      </div>

      {activeTab === "ask" ? (
        /* ═══ ASK TAB ═══ */
        <div className="flex flex-col items-center flex-1 px-6 overflow-y-auto">
          {/* Input area */}
          <div className="w-full max-w-2xl relative">
            {showSlashMenu && filteredSkills.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border rounded-xl shadow-2xl max-h-[320px] overflow-y-auto z-10">
                {filteredSkills.some((s) => s.phase === "extract") && (
                  <>
                    <div className="px-4 pt-2.5 pb-1">
                      <p className="text-[10px] font-bold text-blue uppercase tracking-wider">Extract</p>
                    </div>
                    {filteredSkills.filter((s) => s.phase === "extract").map((skill) => {
                      const idx = filteredSkills.indexOf(skill);
                      return (
                        <button key={skill.id} onClick={() => selectSkill(skill)} className={`w-full flex items-center gap-3 px-4 py-1.5 text-left transition-colors ${idx === slashIdx ? "bg-blue/10 text-foreground" : "text-muted hover:bg-[#1a1a1a]"}`}>
                          <span className="text-sm">{skill.emoji}</span>
                          <span className="text-xs font-mono text-blue w-28">{skill.command}</span>
                          <span className="text-xs text-muted truncate">{skill.description}</span>
                        </button>
                      );
                    })}
                  </>
                )}
                {filteredSkills.some((s) => s.phase === "create") && (
                  <>
                    <div className="px-4 pt-2.5 pb-1">
                      <p className="text-[10px] font-bold text-green uppercase tracking-wider">Create</p>
                    </div>
                    {filteredSkills.filter((s) => s.phase === "create").map((skill) => {
                      const idx = filteredSkills.indexOf(skill);
                      return (
                        <button key={skill.id} onClick={() => selectSkill(skill)} className={`w-full flex items-center gap-3 px-4 py-1.5 text-left transition-colors ${idx === slashIdx ? "bg-green/10 text-foreground" : "text-muted hover:bg-[#1a1a1a]"}`}>
                          <span className="text-sm">{skill.emoji}</span>
                          <span className="text-xs font-mono text-green w-28">{skill.command}</span>
                          <span className="text-xs text-muted truncate">{skill.description}</span>
                        </button>
                      );
                    })}
                  </>
                )}
                <div className="px-4 py-1.5 border-t border-border">
                  <p className="text-[10px] text-dim"><span className="text-muted">↑↓</span> navigate <span className="text-muted ml-3">Tab</span> select <span className="text-muted ml-3">Esc</span> dismiss</p>
                </div>
              </div>
            )}

            <div className="border border-border rounded-2xl bg-surface focus-within:border-blue/40 transition-colors overflow-hidden">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Extract your expertise, create content, or ask anything..."
                rows={3}
                className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-5 pt-4 pb-2"
              />
              {/* Toolbar row */}
              <div className="flex items-center gap-1 px-3 pb-3">
                {/* + menu: Attach file / Saved prompts */}
                <div className="relative">
                  <button onClick={() => setShowPlusMenu(!showPlusMenu)} className="p-1.5 rounded-md text-dim hover:text-muted hover:bg-[#1a1a1a] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </button>
                  {showPlusMenu && (
                    <div className="absolute bottom-full left-0 mb-1 w-44 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-10">
                      <button onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors">
                        <svg className="w-4 h-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                        Attach file
                      </button>
                      <button onClick={() => { setInput("/"); setShowPlusMenu(false); inputRef.current?.focus(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors">
                        <svg className="w-4 h-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                        Saved prompts
                      </button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setInput((prev) => prev + `[Attached: ${f.name}] `); } e.target.value = ""; setShowPlusMenu(false); }} />
                </div>

                {/* Model selector */}
                <div className="relative">
                  <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors">
                    <svg className="w-3.5 h-3.5 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5"><path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {model.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {showModelPicker && (
                    <div className="absolute bottom-full left-0 mb-1 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-10">
                      {MODELS.map((m) => (
                        <button key={m.id} onClick={() => { setModel(m); setShowModelPicker(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${m.id === model.id ? "bg-blue/10 text-foreground" : "text-muted hover:bg-[#1a1a1a]"}`}>
                          <span className="flex-1">{m.label}</span>
                          {m.badge && <span className="text-[10px] text-blue bg-blue/10 px-1.5 py-0.5 rounded">{m.badge}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* Web search toggle */}
                <button
                  onClick={() => setWebSearch(!webSearch)}
                  title={webSearch ? "Web search enabled" : "Enable web search"}
                  className={`p-1.5 rounded-md transition-colors ${webSearch ? "text-blue bg-blue/10" : "text-dim hover:text-muted hover:bg-[#1a1a1a]"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                </button>
                {webSearch && <span className="text-[10px] text-blue">Web</span>}

                {/* Send */}
                <button onClick={handleSend} disabled={!input.trim()} className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue to-purple text-white flex items-center justify-center hover:opacity-80 disabled:opacity-20 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 4 suggestion cards */}
          <div className="grid grid-cols-4 gap-3 mt-6 w-full max-w-2xl">
            {EXTRACT_SKILLS.map((skill) => (
              <button key={skill.id} onClick={() => { setInput(skill.command + " "); inputRef.current?.focus(); }} className="flex flex-col gap-1.5 p-3 bg-surface border border-border rounded-xl hover:border-blue/30 transition-colors text-left group">
                <span className="text-base">{skill.emoji}</span>
                <p className="text-xs font-sans font-bold text-foreground group-hover:text-blue transition-colors leading-tight">{skill.name}</p>
                <p className="text-[11px] text-dim leading-snug line-clamp-2">{skill.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ═══ ORCHESTRATE TAB — ClickUp Agents style ═══ */
        <div className="flex-1 overflow-y-auto">
          {/* Category filter bar */}
          <div className="flex flex-col items-center pb-6 px-6">
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    activeCategory === cat
                      ? "bg-purple text-white"
                      : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Agent grid */}
          <div className="max-w-4xl mx-auto px-6 pb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredAgents.map((agent: { id: string; name: string; emoji: string; gradient: string; shortDescription: string }) => (
                <Link
                  key={agent.id}
                  href={`/vault/agents/${agent.id}`}
                  className="flex flex-col p-4 bg-surface border border-border rounded-xl hover:border-purple/30 transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center mb-3 shadow-lg shadow-black/20`}>
                    <span className="text-lg">{agent.emoji}</span>
                  </div>
                  {/* Name */}
                  <p className="text-sm font-sans font-bold text-foreground group-hover:text-purple transition-colors mb-0.5">{agent.name}</p>
                  {/* Description */}
                  <p className="text-[11px] text-dim leading-snug line-clamp-2">{agent.shortDescription}</p>
                  {/* Badge */}
                  <div className="mt-3 flex items-center gap-1">
                    {(AGENT_CATEGORIES[agent.id] || []).slice(0, 2).map((cat) => (
                      <span key={cat} className="text-[10px] text-purple/70 bg-purple/5 border border-purple/10 rounded px-1.5 py-0.5">{cat}</span>
                    ))}
                  </div>
                </Link>
              ))}

              {/* Custom agent card */}
              <Link
                href="/vault/agents/create"
                className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl hover:border-purple/40 transition-colors group min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-3 group-hover:bg-purple/10 transition-colors">
                  <span className="text-lg text-muted group-hover:text-purple transition-colors">+</span>
                </div>
                <p className="text-xs font-sans font-bold text-muted group-hover:text-purple transition-colors">Custom Agent</p>
                <p className="text-[10px] text-dim mt-0.5">Build your own</p>
              </Link>
            </div>

            {/* Run orchestration CTA */}
            <div className="mt-8 bg-purple/5 border border-purple/20 rounded-xl p-5 flex items-center gap-4">
              <div className="flex -space-x-2 shrink-0">
                {AGENT_LIST.slice(0, 4).map((agent: { id: string; gradient: string; emoji: string }) => (
                  <div key={agent.id} className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center ring-2 ring-[#0a0a0a]`}>
                    <span className="text-sm">{agent.emoji}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans font-bold text-foreground">Run all agents on one goal</p>
                <p className="text-xs text-muted">They coordinate autonomously and deliver the result.</p>
              </div>
              <Link
                href="/vault/agents/orchestrate"
                className="px-4 py-2 text-xs font-medium text-purple bg-purple/10 border border-purple/20 rounded-lg hover:bg-purple/20 transition-colors shrink-0"
              >
                Run Orchestration →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
