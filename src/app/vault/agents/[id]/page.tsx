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
  const [showConfig, setShowConfig] = useState(false);

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
      {/* Agent header — compact */}
      <div className="px-6 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-sm shrink-0`}>
            <span className="text-base">{agent.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-sans font-bold text-foreground">{agent.name}</h1>
            <p className="text-[11px] text-muted truncate">{agent.shortDescription}</p>
          </div>

          {/* Tabs + config toggle — inline with header */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-0.5">
              {(["agent", "activity", "tasks"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors capitalize ${
                    activeTab === tab
                      ? "bg-surface text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === "agent" && (
              <button
                onClick={() => setShowConfig(!showConfig)}
                title="Agent config"
                className={`p-1.5 rounded-md transition-colors ${
                  showConfig ? "text-blue bg-blue/10" : "text-dim hover:text-muted"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3.5a1 1 0 00-1 1v.3a1.7 1.7 0 01-1 1.5 1.7 1.7 0 01-1.8-.2l-.2-.2a1 1 0 10-1.4 1.4l.2.2a1.7 1.7 0 01.2 1.8 1.7 1.7 0 01-1.5 1H4.5a1 1 0 000 2h.3a1.7 1.7 0 011.5 1 1.7 1.7 0 01-.2 1.8l-.2.2a1 1 0 101.4 1.4l.2-.2a1.7 1.7 0 011.8-.2 1.7 1.7 0 011 1.5v.3a1 1 0 002 0v-.3a1.7 1.7 0 011-1.5 1.7 1.7 0 011.8.2l.2.2a1 1 0 101.4-1.4l-.2-.2a1.7 1.7 0 01-.2-1.8 1.7 1.7 0 011.5-1h.3a1 1 0 000-2h-.3a1.7 1.7 0 01-1.5-1 1.7 1.7 0 01.2-1.8l.2-.2a1 1 0 10-1.4-1.4l-.2.2a1.7 1.7 0 01-1.8.2 1.7 1.7 0 01-1-1.5v-.3a1 1 0 00-1 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "agent" && (
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Config drawer — only visible when toggled */}
          {showConfig && (
            <div className="px-6 py-3 border-b border-border bg-[#0d0d0d] space-y-1 shrink-0 max-h-[200px] overflow-y-auto">
              <div className="mb-2">
                <p className="text-[11px] text-dim uppercase tracking-wider mb-1">Instructions</p>
                <p className="text-xs text-muted leading-relaxed">{agent.description}</p>
              </div>
              <div className="mb-2">
                <p className="text-[11px] text-dim uppercase tracking-wider mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {agent.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 text-[11px] text-blue bg-blue/10 border border-blue/20 rounded font-mono">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-dim uppercase tracking-wider mb-1">Knowledge</p>
                <div className="flex flex-wrap gap-1">
                  {agent.knowledgeSources.map((source) => (
                    <span key={source} className="px-2 py-0.5 text-[11px] text-muted bg-background border border-border rounded font-mono">
                      {source.replace("reference/core/", "").replace(".md", "")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Terminal — takes all remaining space */}
          <div className="flex-1 min-h-0">
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
