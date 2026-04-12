"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SKILLS = [
  { command: "/brief", label: "Brief me", description: "Summarise what's in my vault and recent activity", prompt: "Brief me — read my core context files and recent activity, then give me a summary of where things stand." },
  { command: "/draft", label: "Draft content", description: "Write a LinkedIn post, email, or newsletter", prompt: "/draft " },
  { command: "/research", label: "Research", description: "Investigate a topic using vault context", prompt: "/research " },
  { command: "/decide", label: "Capture decision", description: "Record a strategic decision to the vault", prompt: "/decide " },
  { command: "/extract", label: "Extract context", description: "Pull insights from a conversation or document", prompt: "/extract " },
  { command: "/audit", label: "Audit vault", description: "Check what needs attention or is missing", prompt: "Audit my vault — check which core files need work, what's outdated, and what's missing." },
  { command: "/search", label: "Search vault", description: "Find files related to a topic", prompt: "/search " },
  { command: "/update", label: "Update file", description: "Modify an existing vault file", prompt: "/update " },
  { command: "/voice", label: "Voice check", description: "Review content against my voice profile", prompt: "/voice " },
  { command: "/activity", label: "Recent activity", description: "Show what changed recently", prompt: "Show me recent vault activity — what's been synced, extracted, added, or updated." },
];

interface ChatCoreProps {
  className?: string;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
}

export default function ChatCore({
  className = "",
  initialPrompt,
  onPromptConsumed,
}: ChatCoreProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && !streaming && messages.length === 0) {
      sendMessage(initialPrompt);
      onPromptConsumed?.();
    }
  }, [initialPrompt]);

  const filteredSkills = useMemo(() => {
    if (!skillFilter) return SKILLS;
    const q = skillFilter.toLowerCase();
    return SKILLS.filter(
      (s) =>
        s.command.toLowerCase().includes(q) ||
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [skillFilter]);

  useEffect(() => {
    setSelectedSkillIndex(0);
  }, [filteredSkills]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setInput(value);

    // Show skills menu when typing / at the start
    if (value === "/") {
      setShowSkills(true);
      setSkillFilter("");
    } else if (value.startsWith("/") && !value.includes(" ")) {
      setShowSkills(true);
      setSkillFilter(value);
    } else {
      setShowSkills(false);
    }
  }

  function selectSkill(skill: typeof SKILLS[0]) {
    setShowSkills(false);
    if (skill.prompt.endsWith(" ")) {
      // Partial prompt — let user complete it
      setInput(skill.prompt);
      textareaRef.current?.focus();
    } else {
      // Full prompt — send immediately
      setInput("");
      sendMessage(skill.prompt);
    }
  }

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content || streaming) return;
    setShowSkills(false);

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        setMessages([
          ...newMessages,
          { role: "assistant", content: `Error: ${err.error}` },
        ]);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Connection error. Check your configuration.",
        },
      ]);
    }

    setStreaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showSkills && filteredSkills.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSkillIndex((i) => Math.min(i + 1, filteredSkills.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSkillIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectSkill(filteredSkills[selectedSkillIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSkills(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="py-8">
              <p className="text-muted text-sm mb-4 px-1">
                Type <span className="text-blue font-mono">/</span> for skills, or ask anything.
              </p>
              <div className="space-y-1">
                {SKILLS.map((skill) => (
                  <button
                    key={skill.command}
                    onClick={() => selectSkill(skill)}
                    className="w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <span className="text-blue font-mono text-xs mt-0.5 shrink-0 w-16">
                      {skill.command}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground group-hover:text-blue transition-colors">
                        {skill.label}
                      </p>
                      <p className="text-xs text-dim truncate">
                        {skill.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-blue/10 border border-blue/20 text-foreground"
                    : "bg-surface border border-border text-foreground"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-xs text-blue mb-1 font-medium">
                    Claude Sonnet
                  </p>
                )}
                <div className="text-sm whitespace-pre-wrap">
                  {msg.content ||
                    (streaming && i === messages.length - 1
                      ? "Thinking..."
                      : "")}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 relative">
        {/* Slash command dropdown */}
        {showSkills && filteredSkills.length > 0 && (
          <div
            ref={skillsRef}
            className="absolute bottom-full left-4 right-4 mb-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          >
            {filteredSkills.map((skill, i) => (
              <button
                key={skill.command}
                onClick={() => selectSkill(skill)}
                onMouseEnter={() => setSelectedSkillIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  i === selectedSkillIndex
                    ? "bg-blue/10 text-foreground"
                    : "hover:bg-[#1a1a1a] text-muted"
                }`}
              >
                <span className="text-blue font-mono text-xs shrink-0 w-16">
                  {skill.command}
                </span>
                <span className="text-sm truncate">{skill.label}</span>
                <span className="text-xs text-dim truncate ml-auto hidden sm:block">
                  {skill.description}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type / for skills or ask anything..."
            rows={1}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-dim focus:outline-none focus:border-blue resize-none text-sm"
            style={{ minHeight: "40px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "40px";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className="px-4 py-2 bg-blue text-background rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
