"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AGENTS } from "@/lib/agents";

export default function AgentsBrowser() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    // Route to strategy agent by default with the prompt
    router.push(`/vault/agents/strategy?prompt=${encodeURIComponent(prompt.trim())}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-2xl font-sans font-bold text-foreground">Agents</h1>
        </div>
        <p className="text-sm text-muted">Your specialist AI team — grounded in your vault</p>
      </div>

      {/* Prompt bar */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="relative border border-border rounded-xl bg-surface p-1 focus-within:border-blue/40 transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the work that keeps you from what matters..."
            rows={3}
            className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-4 py-3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] text-dim">Press Enter to send</span>
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="px-3 py-1.5 text-xs bg-blue text-white rounded-lg disabled:opacity-30 hover:bg-blue/80 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </form>

      {/* Agent cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENTS.map((agent) => (
          <Link
            key={agent.id}
            href={`/vault/agents/${agent.id}`}
            className="group bg-surface border border-border rounded-xl p-5 hover:border-blue/40 transition-colors"
          >
            <div className={`text-2xl mb-3 ${agent.color}`}>{agent.icon}</div>
            <h3 className="text-sm font-sans font-bold text-foreground mb-1 group-hover:text-blue transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {agent.shortDescription}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
