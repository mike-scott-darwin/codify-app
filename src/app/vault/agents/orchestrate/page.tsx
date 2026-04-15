"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface AgentStep {
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentGradient: string;
  task: string;
  reason: string;
  status: "waiting" | "running" | "complete";
  output: string;
}

type Phase = "idle" | "planning" | "running" | "summarising" | "complete" | "error";

export default function OrchestratePage() {
  const searchParams = useSearchParams();
  const initialGoal = searchParams.get("goal") ?? "";

  const [goal, setGoal] = useState(initialGoal);
  const [phase, setPhase] = useState<Phase>("idle");
  const [planSummary, setPlanSummary] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const hasRun = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [phase, steps, summary]);

  useEffect(() => {
    if (initialGoal && !hasRun.current) {
      hasRun.current = true;
      runOrchestration(initialGoal);
    }
  }, [initialGoal]);

  async function runOrchestration(goalText: string) {
    if (!goalText.trim()) return;
    setPhase("planning");
    setPlanSummary("");
    setSteps([]);
    setSummary("");
    setError("");
    setExpandedStep(null);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalText }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Connection failed" }));
        setError(err.error);
        setPhase("error");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let currentSteps: AgentStep[] = [];

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
            const { event } = parsed;

            switch (event) {
              case "plan_start":
                setPhase("planning");
                break;

              case "plan_ready":
                setPlanSummary(parsed.summary);
                currentSteps = parsed.steps.map((s: AgentStep) => ({ ...s, output: "" }));
                setSteps([...currentSteps]);
                setPhase("running");
                break;

              case "agent_start": {
                const idx = parsed.index;
                if (currentSteps[idx]) {
                  currentSteps[idx].status = "running";
                  setSteps([...currentSteps]);
                  setExpandedStep(idx);
                }
                break;
              }

              case "agent_delta": {
                const idx = parsed.index;
                if (currentSteps[idx]) {
                  currentSteps[idx].output += parsed.delta;
                  setSteps([...currentSteps]);
                }
                break;
              }

              case "agent_complete": {
                const idx = parsed.index;
                if (currentSteps[idx]) {
                  currentSteps[idx].status = "complete";
                  setSteps([...currentSteps]);
                }
                break;
              }

              case "summary_start":
                setPhase("summarising");
                break;

              case "summary_delta":
                setSummary(prev => prev + parsed.delta);
                break;

              case "complete":
                setPhase("complete");
                break;

              case "error":
                setError(parsed.message);
                setPhase("error");
                break;
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setError("Connection error");
      setPhase("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runOrchestration(goal);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <svg className="w-7 h-7 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        <div>
          <h1 className="text-xl font-sans font-bold text-foreground">Orchestrate</h1>
          <p className="text-xs text-muted">Multiple agents working together on your goal</p>
        </div>
      </div>

      {/* Goal input */}
      {phase === "idle" && (
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="border border-border rounded-2xl bg-surface focus-within:border-purple/40 transition-colors overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(59,130,246,0.05))" }}
          >
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe what you want your team to accomplish..."
              rows={3}
              className="w-full bg-transparent text-foreground text-sm placeholder:text-dim resize-none focus:outline-none px-5 pt-4 pb-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-[11px] text-dim">Strategy will assign agents automatically</span>
              <button
                type="submit"
                disabled={!goal.trim()}
                className="px-5 py-2 text-xs font-medium text-white bg-purple rounded-lg disabled:opacity-30 hover:bg-purple/80 transition-colors"
              >
                Orchestrate
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Active orchestration */}
      {phase !== "idle" && (
        <div className="mt-6 space-y-4">
          {/* Goal display */}
          <div className="bg-surface border border-purple/20 rounded-xl p-4">
            <p className="text-xs text-dim uppercase tracking-wider mb-1">Goal</p>
            <p className="text-sm text-foreground">{goal}</p>
          </div>

          {/* Planning phase */}
          {phase === "planning" && (
            <div className="flex items-center gap-3 px-4 py-6">
              <div className="w-5 h-5 border-2 border-purple border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted">Strategy agent analysing goal and assembling team...</span>
            </div>
          )}

          {/* Plan summary */}
          {planSummary && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-dim uppercase tracking-wider mb-1">Plan</p>
              <p className="text-sm text-foreground">{planSummary}</p>
            </div>
          )}

          {/* Agent pipeline */}
          {steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-dim uppercase tracking-wider px-1">Agent Pipeline</p>
              {steps.map((step, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
                  {/* Step header */}
                  <button
                    onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background/50 transition-colors"
                  >
                    {/* Status indicator */}
                    <div className="shrink-0">
                      {step.status === "waiting" && (
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                          <span className="text-xs text-dim">{i + 1}</span>
                        </div>
                      )}
                      {step.status === "running" && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.agentGradient} flex items-center justify-center animate-pulse`}>
                          <span className="text-sm">{step.agentEmoji}</span>
                        </div>
                      )}
                      {step.status === "complete" && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.agentGradient} flex items-center justify-center`}>
                          <span className="text-sm">{step.agentEmoji}</span>
                        </div>
                      )}
                    </div>

                    {/* Agent info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-sans font-bold text-foreground">{step.agentName}</span>
                        {step.status === "running" && (
                          <span className="text-[10px] text-purple animate-pulse">running</span>
                        )}
                        {step.status === "complete" && (
                          <span className="text-[10px] text-green">done</span>
                        )}
                      </div>
                      <p className="text-xs text-muted truncate">{step.task}</p>
                    </div>

                    {/* Expand indicator */}
                    <svg
                      className={`w-4 h-4 text-dim transition-transform ${expandedStep === i ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {/* Expanded output */}
                  {expandedStep === i && (
                    <div className="border-t border-border px-4 py-3 bg-[#0a0a0a]">
                      {step.output ? (
                        <div className="text-sm text-foreground whitespace-pre-wrap font-mono text-[13px] leading-relaxed max-h-[400px] overflow-y-auto">
                          {step.output}
                        </div>
                      ) : (
                        <p className="text-xs text-dim">
                          {step.status === "waiting" ? "Waiting for previous agents to complete..." : "Processing..."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Connection line to next step */}
                  {i < steps.length - 1 && (
                    <div className="flex justify-center -mb-2">
                      <div className="w-px h-4 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary phase */}
          {(phase === "summarising" || (phase === "complete" && summary)) && (
            <div className="bg-surface border border-green/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🧭</span>
                <p className="text-xs text-dim uppercase tracking-wider">Strategy Summary</p>
                {phase === "summarising" && (
                  <div className="w-3 h-3 border-2 border-green border-t-transparent rounded-full animate-spin ml-2" />
                )}
              </div>
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="bg-surface border border-red/20 rounded-xl p-4">
              <p className="text-sm text-red">{error}</p>
            </div>
          )}

          {/* Complete actions */}
          {phase === "complete" && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPhase("idle");
                  setGoal("");
                  setSteps([]);
                  setSummary("");
                  setPlanSummary("");
                }}
                className="px-4 py-2 text-xs text-muted bg-surface border border-border rounded-lg hover:text-foreground transition-colors"
              >
                New orchestration
              </button>
              <Link
                href="/vault/agents"
                className="px-4 py-2 text-xs text-purple bg-purple/10 border border-purple/20 rounded-lg hover:bg-purple/20 transition-colors"
              >
                Back to Agents
              </Link>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
