"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getAgent } from "@/lib/agents";
import AgentTerminal from "@/components/vault/agent-terminal";

export default function AgentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const agent = getAgent(params.id as string);
  const initialPrompt = searchParams.get("prompt") ?? undefined;
  const [configOpen, setConfigOpen] = useState(false);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Agent not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Agent header */}
      <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-sm`}>
            <span className="text-base">{agent.emoji}</span>
          </div>
          <div>
            <h1 className="text-base font-sans font-bold text-foreground">{agent.name}</h1>
            <p className="text-xs text-muted">{agent.shortDescription}</p>
          </div>
        </div>
        <button
          onClick={() => setConfigOpen(!configOpen)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            configOpen
              ? "text-blue border-blue/30 bg-blue/5"
              : "text-muted border-border hover:text-foreground hover:border-blue/20"
          }`}
        >
          {configOpen ? "Hide config" : "Config"}
        </button>
      </div>

      {/* Config panel — collapsible */}
      {configOpen && (
        <div className="px-6 py-4 border-b border-border bg-surface/50 space-y-4 shrink-0 max-h-[300px] overflow-y-auto">
          {/* Instructions */}
          <div>
            <h3 className="text-xs font-medium text-dim uppercase tracking-wider mb-2">Instructions</h3>
            <p className="text-sm text-muted leading-relaxed">{agent.description}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-medium text-dim uppercase tracking-wider mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 text-xs text-blue bg-blue/10 border border-blue/20 rounded-md font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Knowledge sources */}
          <div>
            <h3 className="text-xs font-medium text-dim uppercase tracking-wider mb-2">Knowledge</h3>
            <div className="space-y-1">
              {agent.knowledgeSources.map((source) => (
                <p key={source} className="text-xs text-muted font-mono">
                  {source}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Terminal — fills remaining space */}
      <div className="flex-1 p-4 min-h-0">
        <AgentTerminal agent={agent} initialPrompt={initialPrompt} />
      </div>
    </div>
  );
}
