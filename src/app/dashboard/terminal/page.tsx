"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const SKILLS = [
  { cmd: "/think", desc: "Research, decide, and codify into reference" },
  { cmd: "/ads", desc: "Create ad copy, hooks, and creative variations" },
  { cmd: "/organic", desc: "Generate organic content" },
  { cmd: "/vsl", desc: "Write video sales letter scripts" },
  { cmd: "/email", desc: "Draft email sequences and newsletters" },
  { cmd: "/audit", desc: "Run a congruence audit on your files" },
  { cmd: "/brainstorm", desc: "Brainstorm angles, hooks, or content ideas" },
  { cmd: "/refine", desc: "Refine and improve a piece of content" },
  { cmd: "/help", desc: "Show available commands" },
  { cmd: "/files", desc: "View your current reference files" },
  { cmd: "/score", desc: "Check your Context Power Score" },
  { cmd: "/clear", desc: "Clear the terminal" },
];

export default function TerminalPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome to Codify Terminal. Type a command or ask a question. Type /help to see available skills.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const cmd = input.trim();
    if (!cmd || processing) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: cmd, timestamp: new Date() }]);

    if (cmd === "/clear") {
      setMessages([{ role: "system", content: "Terminal cleared. Type /help for commands.", timestamp: new Date() }]);
      return;
    }

    if (cmd === "/help") {
      const helpText = "Available skills:\n\n" + SKILLS.map((s) => "  " + s.cmd.padEnd(14) + s.desc).join("\n") + "\n\nOr just type a question.";
      setMessages((prev) => [...prev, { role: "assistant", content: helpText, timestamp: new Date() }]);
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || data.error || "No response.", timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not reach the server.", timestamp: new Date() },
      ]);
    }

    setProcessing(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-mono text-xl font-bold">Terminal</h1>
          <p className="font-mono text-[10px] text-[#6b6b6b]">Type /help for commands or ask anything</p>
        </div>
        <div className="flex gap-2">
          {["/think", "/ads", "/organic", "/brainstorm"].map((c) => (
            <button
              key={c}
              onClick={(e) => { e.stopPropagation(); setInput(c); inputRef.current?.focus(); }}
              className="font-mono text-[10px] px-2 py-1 border border-[#1a1a1a] text-[#6b6b6b] hover:text-[#22c55e] hover:border-[#22c55e] transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] p-4 overflow-y-auto font-mono text-sm">
        {messages.map((msg, i) => (
          <div key={i} className="mb-3">
            {msg.role === "user" ? (
              <div>
                <span className="text-[#22c55e]">{"❯ "}</span>
                <span className="text-white">{msg.content}</span>
              </div>
            ) : msg.role === "system" ? (
              <pre className="text-[#4a9eff] whitespace-pre-wrap leading-relaxed">{msg.content}</pre>
            ) : (
              <pre className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed pl-2 border-l border-[#1a1a1a]">{msg.content}</pre>
            )}
          </div>
        ))}
        {processing && (
          <div className="mb-3">
            <span className="text-[#f59e0b] animate-pulse">Processing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 mt-2 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3">
        <span className="text-[#22c55e] font-mono text-sm">{"❯"}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Type a command or question..."
          className="flex-1 bg-transparent font-mono text-sm text-white focus:outline-none"
          disabled={processing}
        />
      </div>
    </div>
  );
}
