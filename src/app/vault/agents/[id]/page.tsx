"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getAgent } from "@/lib/agents";
import { MOCK_AUDIT_LOG, formatAuditTimestamp } from "@/lib/audit-log";
import AgentTerminal from "@/components/vault/agent-terminal";

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
  const [activeTab, setActiveTab] = useState<"agent" | "activity" | "tasks">("agent");

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted">Agent not found</p>
      </div>
    );
  }

  const agentLogs = MOCK_AUDIT_LOG.filter((e) => e.agentId === agent.id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Agent header */}
      <div className="px-6 py-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-sm`}>
            <span className="text-lg">{agent.emoji}</span>
          </div>
          <div>
            <h1 className="text-base font-sans font-bold text-foreground">{agent.name}</h1>
            <p className="text-xs text-muted">{agent.shortDescription}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1 w-fit">
          {(["agent", "activity", "tasks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "agent" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Collapsible config sections */}
          <div className="px-6 py-3 border-b border-border bg-surface/50 space-y-1 shrink-0 max-h-[240px] overflow-y-auto">
            <details className="group">
              <summary className="flex items-center justify-between py-2 cursor-pointer text-xs font-medium text-dim uppercase tracking-wider hover:text-muted transition-colors">
                Instructions
                <svg className="w-3 h-3 text-dim group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <p className="text-sm text-muted leading-relaxed pb-2">{agent.description}</p>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between py-2 cursor-pointer text-xs font-medium text-dim uppercase tracking-wider hover:text-muted transition-colors">
                Skills
                <svg className="w-3 h-3 text-dim group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="flex flex-wrap gap-1.5 pb-2">
                {agent.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 text-xs text-blue bg-blue/10 border border-blue/20 rounded-md font-mono">
                    {skill}
                  </span>
                ))}
              </div>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between py-2 cursor-pointer text-xs font-medium text-dim uppercase tracking-wider hover:text-muted transition-colors">
                Knowledge
                <svg className="w-3 h-3 text-dim group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="space-y-1 pb-2">
                {agent.knowledgeSources.map((source) => (
                  <p key={source} className="text-xs text-muted font-mono">{source}</p>
                ))}
              </div>
            </details>
          </div>

          {/* Terminal */}
          <div className="flex-1 p-4 min-h-0">
            <AgentTerminal agent={agent} initialPrompt={initialPrompt} />
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {agentLogs.length > 0 ? (
            <div className="space-y-1">
              {agentLogs.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface transition-colors">
                  <span className="text-xs text-dim tabular-nums shrink-0 w-16">
                    {formatAuditTimestamp(entry.timestamp)}
                  </span>
                  <span className="text-sm text-foreground flex-1">{entry.action}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    entry.status === "completed" ? "text-green bg-green/10" :
                    entry.status === "running" ? "text-amber bg-amber/10 animate-pulse" :
                    "text-red bg-red/10"
                  }`}>
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-sm text-muted mb-1">No activity yet</p>
              <p className="text-xs text-dim">Run a task with this agent to see activity here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-muted mb-1">No tasks yet</p>
            <p className="text-xs text-dim">Tasks assigned to this agent will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
