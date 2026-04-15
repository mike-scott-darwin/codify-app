"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
  options?: string[];
}

const KNOWLEDGE_SOURCES = [
  "reference/core/soul.md",
  "reference/core/offer.md",
  "reference/core/audience.md",
  "reference/core/voice.md",
  "decisions/",
  "research/",
  "outputs/",
  "content/",
];

type Step = "name" | "purpose" | "knowledge" | "confirm" | "done";

export default function CreateAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'll help you create a new agent. What should this agent be called?",
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("name");
  const [agentName, setAgentName] = useState("");
  const [agentPurpose, setAgentPurpose] = useState("");
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  function addMessages(userMsg: string, assistantMsg: string, options?: string[]) {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: assistantMsg, options },
    ]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || step === "knowledge" || step === "confirm" || step === "done") return;
    processInput(input.trim());
    setInput("");
  }

  function processInput(value: string) {
    switch (step) {
      case "name":
        setAgentName(value);
        addMessages(
          value,
          `Got it — **${value}**. What should this agent do? Describe its purpose and the kind of work it handles.`
        );
        setStep("purpose");
        break;

      case "purpose":
        setAgentPurpose(value);
        addMessages(
          value,
          "Great. Which vault files should this agent have access to? Select the knowledge sources below."
        );
        setStep("knowledge");
        break;
    }
  }

  function handleKnowledgeConfirm() {
    const sources = selectedKnowledge.length > 0
      ? selectedKnowledge.map(s => `\`${s}\``).join(", ")
      : "none selected";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Selected: ${sources}` },
      {
        role: "assistant",
        content: `Here's your agent:\n\n**Name:** ${agentName}\n**Purpose:** ${agentPurpose}\n**Knowledge:** ${sources}\n\nReady to create this agent?`,
      },
    ]);
    setStep("confirm");
  }

  function handleCreate() {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Create it" },
      {
        role: "assistant",
        content: `**${agentName}** has been created! You can find it in My Agents. Click below to start chatting.`,
      },
    ]);
    setStep("done");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
          <span className="text-base">✦</span>
        </div>
        <div>
          <h1 className="text-base font-sans font-bold text-foreground">Agent Builder</h1>
          <p className="text-xs text-muted">Create a custom agent through conversation</p>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue/10 border border-blue/20 rounded-2xl rounded-br-md px-4 py-3"
                : "bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3"
            }`}>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                  part.startsWith("**") && part.endsWith("**")
                    ? <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>
                    : part.startsWith("`") && part.endsWith("`")
                    ? <code key={j} className="text-purple text-xs bg-purple/10 px-1 py-0.5 rounded">{part.slice(1, -1)}</code>
                    : <span key={j}>{part}</span>
                )}
              </p>
            </div>
          </div>
        ))}

        {/* Knowledge source picker */}
        {step === "knowledge" && (
          <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-4 max-w-[80%]">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {KNOWLEDGE_SOURCES.map((source) => (
                <button
                  key={source}
                  onClick={() => {
                    setSelectedKnowledge((prev) =>
                      prev.includes(source)
                        ? prev.filter((s) => s !== source)
                        : [...prev, source]
                    );
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg border transition-colors ${
                    selectedKnowledge.includes(source)
                      ? "border-purple/40 bg-purple/10 text-purple"
                      : "border-border text-muted hover:border-purple/20"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                    selectedKnowledge.includes(source)
                      ? "border-purple bg-purple"
                      : "border-dim"
                  }`}>
                    {selectedKnowledge.includes(source) && (
                      <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {source}
                </button>
              ))}
            </div>
            <button
              onClick={handleKnowledgeConfirm}
              className="px-4 py-2 text-xs font-medium text-white bg-purple rounded-lg hover:bg-purple/80 transition-colors"
            >
              Confirm selection
            </button>
          </div>
        )}

        {/* Confirm buttons */}
        {step === "confirm" && (
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="px-5 py-2 text-xs font-medium text-white bg-purple rounded-lg hover:bg-purple/80 transition-colors"
            >
              Create Agent
            </button>
            <button
              onClick={() => {
                setMessages([{ role: "assistant", content: "No problem. What should this agent be called?" }]);
                setStep("name");
                setAgentName("");
                setAgentPurpose("");
                setSelectedKnowledge([]);
              }}
              className="px-5 py-2 text-xs text-muted bg-surface border border-border rounded-lg hover:text-foreground transition-colors"
            >
              Start over
            </button>
          </div>
        )}

        {/* Done — link to agent */}
        {step === "done" && (
          <div className="flex gap-2">
            <a
              href="/vault/agents/mine"
              className="px-5 py-2 text-xs font-medium text-white bg-purple rounded-lg hover:bg-purple/80 transition-colors"
            >
              View My Agents
            </a>
          </div>
        )}
      </div>

      {/* Input */}
      {(step === "name" || step === "purpose") && (
        <form onSubmit={handleSubmit} className="border-t border-border px-6 py-4 bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
              <span className="text-[10px]">+</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                step === "name"
                  ? "e.g. Proposal Writer, Content Reviewer..."
                  : "Describe what this agent should do..."
              }
              className="flex-1 bg-transparent text-foreground text-sm placeholder:text-dim focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center disabled:opacity-20 hover:bg-purple/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
