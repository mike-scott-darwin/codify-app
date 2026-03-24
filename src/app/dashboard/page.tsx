"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRepo } from "@/lib/repo-context";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function DashboardPage() {
  const { contextScore, totalFiles } = useRepo();

  const [messages, setMessages] = useState<Message[]>(() => {
    return [];
  });
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const score = totalFiles > 0 ? contextScore + "/100 · " + totalFiles + " files" : "no files yet";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([{
      role: "system",
      content: "codify — " + score + "\nType /help or ask anything.",
    }]);
  }, [totalFiles, contextScore]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const add = useCallback((role: Message["role"], content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    add("system", "Reading " + file.name + "...");
    try {
      const text = (await file.text()).substring(0, 15000);
      setProcessing(true);
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "I uploaded " + file.name + ". Analyze it and suggest how to strengthen my reference files.\n\n--- " + file.name + " ---\n" + text,
        }),
      });
      const data = await res.json();
      add("assistant", data.response || data.error || "No response.");
    } catch { add("system", "Error reading file."); }
    setProcessing(false);
  }, [add]);

  const handleSubmit = async () => {
    const cmd = input.trim();
    if (!cmd || processing) return;
    setInput("");
    add("user", cmd);

    if (cmd === "/clear") {
      setMessages([{ role: "system", content: "Cleared." }]);
      return;
    }

    if (cmd === "/help") {
      add("assistant",
        "FREE\n" +
        "  /extract     Build your reference files\n" +
        "  /files       View your reference files\n" +
        "  /score       Business brain score\n" +
        "  /help        Show this menu\n\n" +
        "BUILD — $99/mo\n" +
        "  /think       Research, decide, codify\n" +
        "  /audit       Congruence check across files\n" +
        "  /refine      Improve and tighten content\n" +
        "  /voice       Transcript → reference extraction\n" +
        "  /end         Session crystallize — capture what compounded\n\n" +
        "PRO — $199/mo\n" +
        "  /ads         Ad copy and hooks\n" +
        "  /organic     Social content\n" +
        "  /email       Email sequences\n" +
        "  /newsletter  Newsletter writing\n" +
        "  /brainstorm  Angles and ideas\n" +
        "  /seo         Score content for search\n" +
        "  /blog        End-to-end blog post\n" +
        "  /repurpose   One content → 5 formats\n" +
        "  /site        Generate a landing page from your brain\n\n" +
        "VIP — $497/mo\n" +
        "  /scout       Opportunities from your brain\n" +
        "  /vsl         Camera-ready VSL scripts\n" +
        "  /proposal    Client proposal generation\n" +
        "  /report      Monthly context health report\n\n" +
        "Or just ask a question. Drop files to enrich."
      );
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
      add("assistant", data.response || data.error || "No response.");
    } catch { add("system", "Could not reach the server."); }
    setProcessing(false);
  };

  return (
    <div
      className="flex flex-col h-full"
      onClick={() => inputRef.current?.focus()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <div
        className={"flex-1 bg-[#0a0a0a] p-5 overflow-y-auto font-mono text-sm transition-colors " +
          (dragOver ? "border border-[#f59e0b]" : "")}
      >
        {dragOver ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#f59e0b] animate-pulse">Drop to enrich</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className="mb-3">
                {msg.role === "user" ? (
                  <div><span className="text-[#22c55e]">❯ </span><span className="text-white">{msg.content}</span></div>
                ) : msg.role === "system" ? (
                  <pre className="text-[#4a9eff] whitespace-pre-wrap leading-relaxed">{msg.content}</pre>
                ) : (
                  <pre className="text-[#a0a0a0] whitespace-pre-wrap leading-relaxed">{msg.content}</pre>
                )}
              </div>
            ))}
            {processing && <span className="text-[#f59e0b] animate-pulse">...</span>}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="flex items-center gap-2 bg-[#0a0a0a] border-t border-[#1a1a1a] px-5 py-3">
        <span className="text-[#22c55e] font-mono text-sm">❯</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="/help"
          className="flex-1 bg-transparent font-mono text-sm text-white focus:outline-none"
          disabled={processing}
        />
      </div>
    </div>
  );
}
