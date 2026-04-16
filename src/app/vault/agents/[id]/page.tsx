"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef, useEffect } from "react";
import { getAgent } from "@/lib/agents";
import type { Agent } from "@/lib/agents";
import Link from "next/link";

// Per-agent onboarding: what it does + suggested prompts
const AGENT_ONBOARDING: Record<string, { steps: string[]; prompts: string[] }> = {
  strategy: {
    steps: [
      "Reads your soul, audience, and offer profiles",
      "Analyses your market position against competitors",
      "Recommends specific strategic moves you can act on",
    ],
    prompts: [
      "What's my strongest competitive advantage right now?",
      "Where are the gaps in my current positioning?",
      "What should my next strategic move be this quarter?",
    ],
  },
  brand: {
    steps: [
      "Reads your voice profile and brand identity",
      "Reviews content for tone, vocabulary, and consistency",
      "Flags anything that sounds generic or off-brand",
    ],
    prompts: [
      "Review this copy and tell me if it sounds like me",
      "What makes my brand voice different from competitors?",
      "Write a brand-consistent intro for my new landing page",
    ],
  },
  gtm: {
    steps: [
      "Reads your offer, audience, and voice profiles",
      "Plans launch sequences, ad copy, and promotion timelines",
      "Produces campaign briefs ready to execute",
    ],
    prompts: [
      "Plan a launch sequence for my new coaching program",
      "What channels should I prioritise for this offer?",
      "Build a 2-week promotion calendar for my webinar",
    ],
  },
  sales: {
    steps: [
      "Reads your offer and audience psychology",
      "Builds email sequences, call scripts, and objection handling",
      "Writes follow-ups and proposals in your voice",
    ],
    prompts: [
      "Write a 3-email follow-up sequence for cold leads",
      "What are the top objections my audience has?",
      "Draft a proposal template for my consulting package",
    ],
  },
  product: {
    steps: [
      "Reads your decisions log and research files",
      "Prioritises features based on business context",
      "Logs decisions so your team stays aligned",
    ],
    prompts: [
      "What should I build next based on client feedback?",
      "Help me prioritise these 5 feature requests",
      "Document the decision to change our pricing model",
    ],
  },
  engineering: {
    steps: [
      "Reads your business context and existing decisions",
      "Translates requirements into technical specifications",
      "Plans architecture and implementation approaches",
    ],
    prompts: [
      "What's the best tech stack for this project?",
      "Break down this feature into implementation tasks",
      "Review this architecture decision for trade-offs",
    ],
  },
  "client-success": {
    steps: [
      "Reads your audience profile and offer details",
      "Optimises onboarding flows and retention strategies",
      "Produces playbooks for client experience",
    ],
    prompts: [
      "Design an onboarding sequence for new clients",
      "What are the key moments where clients drop off?",
      "Write a check-in email for clients at the 30-day mark",
    ],
  },
  research: {
    steps: [
      "Deep-dives into any topic, competitor, or trend",
      "Organises findings into structured reports",
      "Stores insights in your vault so they compound",
    ],
    prompts: [
      "Research my top 3 competitors and compare pricing",
      "What are the emerging trends in my industry?",
      "Find case studies relevant to my offer",
    ],
  },
};

interface ChatMessage {
  role: "user" | "assistant" | "status";
  content: string;
}

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="text-muted text-sm">Loading...</span></div>}>
      <AgentPageContent />
    </Suspense>
  );
}

function AgentPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const agent = getAgent(params.id as string);
  const initialPrompt = searchParams.get("prompt") ?? undefined;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && !hasRun.current) {
      hasRun.current = true;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Agent not found</p>
      </div>
    );
  }

  const onboarding = AGENT_ONBOARDING[agent.id] || {
    steps: ["Reads your vault context", "Analyses and generates insights", "Delivers actionable recommendations"],
    prompts: ["What should I focus on?", "Help me with my next task"],
  };

  async function sendMessage(text: string) {
    if (running || !text.trim()) return;
    setRunning(true);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text.trim() },
      { role: "status", content: "Reading your vault..." },
    ];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text.trim() }],
          agentId: agent!.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        const statusIdx = newMessages.findIndex((m) => m.role === "status");
        if (statusIdx >= 0) newMessages.splice(statusIdx, 1);
        newMessages.push({ role: "assistant", content: `Error: ${err.error}` });
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
              const assistantIdx = newMessages.findIndex((m) => m.role === "assistant");
              const statusIdx = newMessages.findIndex((m) => m.role === "status");
              if (statusIdx >= 0) newMessages.splice(statusIdx, 1);
              if (assistantIdx >= 0) {
                newMessages[assistantIdx] = { role: "assistant", content: fullOutput };
              } else {
                newMessages.push({ role: "assistant", content: fullOutput });
              }
              setMessages([...newMessages]);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      const statusIdx = newMessages.findIndex((m) => m.role === "status");
      if (statusIdx >= 0) newMessages.splice(statusIdx, 1);
      newMessages.push({ role: "assistant", content: "Connection error. Please try again." });
      setMessages([...newMessages]);
    }

    setRunning(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/vault/agents" className="text-dim hover:text-muted transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-sm shrink-0`}>
            <span className="text-base">{agent.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-sans font-bold text-foreground">{agent.name}</h1>
            <p className="text-[11px] text-muted truncate">{agent.shortDescription}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {agent.knowledgeSources.slice(0, 3).map((source) => (
              <span key={source} className="px-2 py-0.5 text-[10px] text-dim bg-background border border-border rounded">
                {source.replace("reference/core/", "").replace(".md", "").replace("/", "")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {isEmpty ? (
          /* ═══ Onboarding — ClickUp style ═══ */
          <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Agent intro */}
            <div className="flex items-start gap-4 mb-8">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-lg shadow-black/20 shrink-0`}>
                <span className="text-2xl">{agent.emoji}</span>
              </div>
              <div>
                <h2 className="text-lg font-sans font-bold text-foreground mb-1">{agent.name} Agent</h2>
                <p className="text-sm text-muted leading-relaxed">{agent.description}</p>
              </div>
            </div>

            {/* What the agent will do */}
            <div className="mb-8">
              <h3 className="text-sm font-sans font-bold text-foreground mb-3">What this agent will do</h3>
              <div className="space-y-2.5">
                {onboarding.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[11px] font-bold text-blue">{i + 1}</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge sources */}
            <div className="mb-8">
              <h3 className="text-sm font-sans font-bold text-foreground mb-3">Reads from your vault</h3>
              <div className="flex flex-wrap gap-2">
                {agent.knowledgeSources.map((source) => (
                  <span key={source} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted bg-surface border border-border rounded-lg">
                    <svg className="w-3 h-3 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {source.replace("reference/core/", "").replace(".md", "")}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested prompts */}
            <div>
              <h3 className="text-sm font-sans font-bold text-foreground mb-3">Try asking</h3>
              <div className="space-y-2">
                {onboarding.prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl hover:border-blue/30 transition-colors text-left group"
                  >
                    <svg className="w-4 h-4 text-dim group-hover:text-blue transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    <span className="text-sm text-muted group-hover:text-foreground transition-colors">{prompt}</span>
                    <svg className="w-4 h-4 text-dim opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ═══ Chat messages ═══ */
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className="text-sm">{agent.emoji}</span>
                  </div>
                )}
                {msg.role === "status" && (
                  <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue animate-pulse" />
                  </div>
                )}
                <div className={`max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-blue/10 text-foreground rounded-2xl rounded-tr-sm px-4 py-3"
                    : msg.role === "status"
                    ? "text-dim text-sm italic py-2"
                    : "text-foreground py-1"
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {running && messages[messages.length - 1]?.role !== "status" && (
              <div className="flex gap-3">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shrink-0`}>
                  <span className="text-sm">{agent.emoji}</span>
                </div>
                <div className="flex items-center gap-1.5 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Input bar ═══ */}
      <div className="border-t border-border bg-[#0d0d0d] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="border border-border rounded-xl bg-surface focus-within:border-blue/40 transition-colors overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask the ${agent.name} agent anything...`}
              rows={2}
              disabled={running}
              className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-4 pt-3 pb-1 disabled:opacity-50"
            />
            <div className="flex items-center gap-1 px-3 pb-2.5">
              <button title="Attach document" className="p-1.5 rounded-md text-dim hover:text-muted hover:bg-[#1a1a1a] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </button>
              <span className="text-[11px] text-dim">{agent.name} agent reads your vault</span>
              <div className="flex-1" />
              <button
                onClick={() => sendMessage(input)}
                disabled={running || !input.trim()}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue to-purple text-white flex items-center justify-center hover:opacity-80 disabled:opacity-20 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
