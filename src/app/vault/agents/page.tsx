"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EXTRACT_SKILLS, CREATE_SKILLS, SKILLS } from "@/lib/skills";
import type { Skill } from "@/lib/skills";

const MODELS = [
  { id: "claude-sonnet", label: "Claude Sonnet", badge: "Fast" },
  { id: "claude-opus", label: "Claude Opus", badge: "Deep" },
  { id: "gpt-4o", label: "GPT-4o", badge: null },
  { id: "gemini-pro", label: "Gemini Pro", badge: null },
];

interface ChatMessage {
  role: "user" | "assistant" | "status";
  content: string;
  timestamp: string;
}

function ts() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

export default function AgentsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [slashIdx, setSlashIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Slash command detection
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

  async function handleSend() {
    if (running || !input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setShowSlashMenu(false);
    setRunning(true);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMsg, timestamp: ts() },
      { role: "status", content: "Reading your vault...", timestamp: ts() },
    ];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMsg }],
          agentId: "strategy",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        newMessages.push({ role: "assistant", content: `Error: ${err.error}`, timestamp: ts() });
        setMessages([...newMessages]);
        setRunning(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullOutput += delta;
              const idx = newMessages.findIndex((m) => m.role === "assistant");
              if (idx >= 0) {
                newMessages[idx] = { role: "assistant", content: fullOutput, timestamp: newMessages[idx].timestamp };
              } else {
                // Remove the status message, add assistant message
                const statusIdx = newMessages.findIndex((m) => m.role === "status");
                if (statusIdx >= 0) newMessages.splice(statusIdx, 1);
                newMessages.push({ role: "assistant", content: fullOutput, timestamp: ts() });
              }
              setMessages([...newMessages]);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      newMessages.push({ role: "assistant", content: "Connection error. Please try again.", timestamp: ts() });
      setMessages([...newMessages]);
    }

    setRunning(false);
    inputRef.current?.focus();
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

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat area — fills all available space */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {isEmpty ? (
          /* ═══ Empty state: centered branding + extract suggestions ═══ */
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-7 h-7 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h1 className="text-xl font-sans font-bold text-foreground">Codify</h1>
              </div>
              <p className="text-xs text-muted">Extract your expertise, then create content that sounds like you.</p>
            </div>

            {/* Quick-start: Extract skills */}
            <div className="w-full max-w-md">
              <p className="text-[10px] text-blue font-bold uppercase tracking-wider mb-2 px-1">Start here — extract your knowledge</p>
              <div className="space-y-0.5 mb-5">
                {EXTRACT_SKILLS.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => { setInput(skill.command + " "); inputRef.current?.focus(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-left"
                  >
                    <span className="text-sm">{skill.emoji}</span>
                    <span className="text-xs font-mono text-blue">{skill.command}</span>
                    <span className="text-xs text-muted flex-1">{skill.description}</span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-dim px-1 mb-1">
                Type <span className="text-muted font-mono">/</span> for all skills, or just ask a question.
              </p>
            </div>
          </div>
        ) : (
          /* ═══ Chat messages ═══ */
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {msg.role === "status" && (
                  <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                  </div>
                )}
                <div className={`max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-blue/10 text-foreground rounded-2xl rounded-tr-sm px-4 py-2.5"
                    : msg.role === "status"
                    ? "text-dim text-sm italic py-2"
                    : "text-foreground"
                }`}>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "prose-sm" : ""}`}>
                    {msg.content}
                  </div>
                  {msg.role !== "status" && (
                    <p className="text-[10px] text-dim mt-1">{msg.timestamp}</p>
                  )}
                </div>
              </div>
            ))}
            {running && messages[messages.length - 1]?.role !== "status" && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                </div>
                <span className="text-sm text-dim italic py-2">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Slash command palette — above input ═══ */}
      {showSlashMenu && filteredSkills.length > 0 && (
        <div className="border-t border-border bg-[#111] max-h-[320px] overflow-y-auto">
          {filteredSkills.some((s) => s.phase === "extract") && (
            <>
              <div className="px-4 pt-2.5 pb-1">
                <p className="text-[10px] font-bold text-blue uppercase tracking-wider">Extract</p>
              </div>
              {filteredSkills.filter((s) => s.phase === "extract").map((skill) => {
                const idx = filteredSkills.indexOf(skill);
                return (
                  <button
                    key={skill.id}
                    onClick={() => selectSkill(skill)}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 text-left transition-colors ${
                      idx === slashIdx ? "bg-blue/10 text-foreground" : "text-muted hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <span className="text-sm">{skill.emoji}</span>
                    <span className="text-xs font-mono text-blue w-28">{skill.command}</span>
                    <span className="text-xs text-foreground">{skill.name}</span>
                    <span className="text-[11px] text-dim ml-auto truncate max-w-[200px]">{skill.description}</span>
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
                  <button
                    key={skill.id}
                    onClick={() => selectSkill(skill)}
                    className={`w-full flex items-center gap-3 px-4 py-1.5 text-left transition-colors ${
                      idx === slashIdx ? "bg-green/10 text-foreground" : "text-muted hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <span className="text-sm">{skill.emoji}</span>
                    <span className="text-xs font-mono text-green w-28">{skill.command}</span>
                    <span className="text-xs text-foreground">{skill.name}</span>
                    <span className="text-[11px] text-dim ml-auto truncate max-w-[200px]">{skill.description}</span>
                  </button>
                );
              })}
            </>
          )}
          <div className="px-4 py-1.5 border-t border-border">
            <p className="text-[10px] text-dim">
              <span className="text-muted">↑↓</span> navigate
              <span className="text-muted ml-3">Tab</span> select
              <span className="text-muted ml-3">Esc</span> dismiss
            </p>
          </div>
        </div>
      )}

      {/* ═══ Rich input bar — ClickUp style ═══ */}
      <div className="border-t border-border bg-[#0d0d0d] px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="border border-border rounded-xl bg-surface focus-within:border-blue/40 transition-colors overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or type / for skills..."
              rows={3}
              disabled={running}
              className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-4 pt-3 pb-1 disabled:opacity-50"
            />

            {/* Toolbar row */}
            <div className="flex items-center gap-1 px-3 pb-2.5">
              {/* Model selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  {model.label}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {showModelPicker && (
                  <div className="absolute bottom-full left-0 mb-1 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-10">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m); setShowModelPicker(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                          m.id === model.id ? "bg-blue/10 text-foreground" : "text-muted hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <span className="flex-1">{m.label}</span>
                        {m.badge && (
                          <span className="text-[10px] text-blue bg-blue/10 px-1.5 py-0.5 rounded">{m.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Attach button */}
              <button
                title="Attach document"
                className="p-1.5 rounded-md text-dim hover:text-muted hover:bg-[#1a1a1a] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>

              {/* Web search button */}
              <button
                title="Search the web"
                className="p-1.5 rounded-md text-dim hover:text-muted hover:bg-[#1a1a1a] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={running || !input.trim()}
                className="w-8 h-8 rounded-lg bg-blue text-white flex items-center justify-center hover:bg-blue/80 disabled:opacity-20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
