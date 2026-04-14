"use client";

import { useState, useRef, useEffect } from "react";
import type { Agent } from "@/lib/agents";

interface TerminalLine {
  type: "input" | "status" | "output" | "error";
  content: string;
  timestamp: string;
}

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function AgentTerminal({
  agent,
  initialPrompt,
}: {
  agent: Agent;
  initialPrompt?: string;
}) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (initialPrompt && !hasRun.current) {
      hasRun.current = true;
      runAgent(initialPrompt);
    }
  }, [initialPrompt]);

  async function runAgent(prompt: string) {
    if (running || !prompt.trim()) return;
    setRunning(true);

    const newLines: TerminalLine[] = [
      ...lines,
      { type: "input", content: prompt, timestamp: timestamp() },
      { type: "status", content: `${agent.name} agent starting...`, timestamp: timestamp() },
    ];
    setLines(newLines);
    setInput("");

    // Show which knowledge sources are being read
    for (const source of agent.knowledgeSources.slice(0, 3)) {
      newLines.push({ type: "status", content: `Reading ${source}`, timestamp: timestamp() });
      setLines([...newLines]);
      await new Promise((r) => setTimeout(r, 200));
    }

    newLines.push({ type: "status", content: "Generating response...", timestamp: timestamp() });
    setLines([...newLines]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          agentId: agent.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        newLines.push({ type: "error", content: err.error, timestamp: timestamp() });
        setLines([...newLines]);
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
        const chunkLines = chunk.split("\n");

        for (const line of chunkLines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullOutput += delta;
              // Update the last output line or add new one
              const outputLineIdx = newLines.findIndex((l) => l.type === "output");
              if (outputLineIdx >= 0) {
                newLines[outputLineIdx] = { type: "output", content: fullOutput, timestamp: newLines[outputLineIdx].timestamp };
              } else {
                newLines.push({ type: "output", content: fullOutput, timestamp: timestamp() });
              }
              setLines([...newLines]);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      newLines.push({ type: "error", content: "Connection error", timestamp: timestamp() });
      setLines([...newLines]);
    }

    setRunning(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runAgent(input);
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden rounded-lg border border-border">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-[#0d0d0d]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green/60" />
        </div>
        <span className="text-xs text-dim font-mono ml-2">{agent.name.toLowerCase()}-agent</span>
        {running && (
          <span className="ml-auto text-[10px] text-green animate-pulse">running</span>
        )}
      </div>

      {/* Terminal output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed space-y-1">
        {lines.length === 0 && (
          <p className="text-dim">
            <span className="text-muted">$</span> Ready. Type a task or question for the {agent.name} agent.
          </p>
        )}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-dim text-[11px] shrink-0 w-16 tabular-nums">{line.timestamp}</span>
            {line.type === "input" && (
              <p className="text-foreground">
                <span className="text-blue">$</span> {line.content}
              </p>
            )}
            {line.type === "status" && (
              <p className="text-dim">[{line.content}]</p>
            )}
            {line.type === "output" && (
              <div className="text-foreground whitespace-pre-wrap">{line.content}</div>
            )}
            {line.type === "error" && (
              <p className="text-red">Error: {line.content}</p>
            )}
          </div>
        ))}
        {running && (
          <span className="inline-block w-2 h-4 bg-foreground animate-pulse" />
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3 flex items-center gap-3 bg-[#0d0d0d]">
        <span className="text-blue font-mono text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask the ${agent.name} agent...`}
          disabled={running}
          className="flex-1 bg-transparent text-foreground text-sm font-mono placeholder:text-dim focus:outline-none disabled:opacity-50"
        />
      </form>
    </div>
  );
}
