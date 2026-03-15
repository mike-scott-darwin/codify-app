"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import type { AgentType } from "@/lib/agents/types";
import type { Platform, IntegrationConnection } from "@/lib/integrations/types";
import { PLATFORM_CONFIGS, ALL_PLATFORMS } from "@/lib/integrations/types";

interface Job {
  id: string;
  agent_type: AgentType;
  status: "pending" | "running" | "complete" | "failed";
  progress: { step: number; totalSteps: number; currentAction: string };
  result: { title: string; content: string } | null;
  error: string | null;
  created_at: string;
}

// Map agent types to output types for integration matching
const AGENT_TO_OUTPUT_TYPE: Record<string, string> = {
  ad_campaign: "ad_copy",
  congruence_audit: "ad_copy",
  content_repurpose: "social_post",
  email_sequence: "email_sequence",
  social_media: "social_post",
};

export default function AgentJobPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [publishing, setPublishing] = useState<Platform | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<Record<string, { type: "success" | "error"; msg: string } | null>>({});

  useEffect(() => {
    const poll = async () => {
      const res = await fetch("/api/agent/status/" + id);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);

        if (data.job.status === "complete" || data.job.status === "failed") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);

    fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        if (data.integrations) setIntegrations(data.integrations);
      })
      .catch(() => {});

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  if (!job) {
    return <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>;
  }

  const config = AGENT_CONFIGS[job.agent_type];
  const progress = job.progress || { step: 0, totalSteps: 1, currentAction: "" };
  const pct = Math.round((progress.step / progress.totalSteps) * 100);

  const handleCopy = async () => {
    if (!job.result?.content) return;
    const el = document.getElementById("agent-result");
    if (el) {
      const html = el.innerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([job.result.content], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": textBlob,
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(job.result.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    if (!job.result?.content) return;
    const blob = new Blob([job.result.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = job.agent_type + "-" + new Date(job.created_at).toISOString().split("T")[0] + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const outputType = AGENT_TO_OUTPUT_TYPE[job.agent_type] || "ad_copy";

  const applicablePlatforms = ALL_PLATFORMS.filter((p) => {
    const pConfig = PLATFORM_CONFIGS[p];
    const connected = integrations.some((i) => i.platform === p && i.enabled);
    return connected && pConfig.supportedOutputTypes.includes(outputType);
  });

  async function handlePublish(platform: Platform) {
    if (!job?.result?.content) return;
    setPublishing(platform);
    setPublishFeedback((prev) => ({ ...prev, [platform]: null }));
    try {
      const res = await fetch("/api/integrations/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          content: job.result.content,
          outputType,
          metadata: { title: job.result.title },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishFeedback((prev) => ({ ...prev, [platform]: { type: "success", msg: data.message } }));
      } else {
        setPublishFeedback((prev) => ({
          ...prev,
          [platform]: { type: "error", msg: data.message || data.error || "Failed" },
        }));
      }
    } catch {
      setPublishFeedback((prev) => ({ ...prev, [platform]: { type: "error", msg: "Network error" } }));
    }
    setPublishing(null);
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/agents" className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors">
          {String.fromCharCode(8592)} Agents
        </Link>
        <span className="text-[#1a1a1a]">/</span>
        <span className="font-mono text-xs text-[#4a9eff]">{config?.label || job.agent_type}</span>
      </div>

      <h1 className="font-mono text-xl font-bold mb-6">
        {config?.icon} {config?.label || job.agent_type}
      </h1>

      {/* Progress */}
      {(job.status === "pending" || job.status === "running") && (
        <div className="bg-[#111111] border border-[#4a9eff] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
              Running
            </span>
            <span className="font-mono text-xs text-[#6b6b6b]">
              Step {progress.step} of {progress.totalSteps}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#1a1a1a] mb-3">
            <div
              className="h-full bg-[#4a9eff] transition-all duration-500"
              style={{ width: pct + "%" }}
            />
          </div>

          <p className="font-mono text-sm text-[#a0a0a0] animate-pulse">
            {progress.currentAction || "Starting..."}
          </p>
        </div>
      )}

      {/* Failed */}
      {job.status === "failed" && (
        <div className="bg-[#111111] border border-[#ef4444] p-6 mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ef4444] mb-2">
            Failed
          </p>
          <p className="font-mono text-sm text-[#a0a0a0]">{job.error || "Unknown error"}</p>
        </div>
      )}

      {/* Result */}
      {job.status === "complete" && job.result && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e]">
              Complete
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          <div id="agent-result" className="bg-white rounded shadow-lg p-8 max-w-3xl mx-auto" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "16px", marginTop: "24px", borderBottom: "2px solid #e5e5e5", paddingBottom: "8px" }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "12px", marginTop: "20px" }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#555", marginBottom: "8px", marginTop: "16px" }}>{children}</h3>,
                p: ({ children }) => <p style={{ fontSize: "14px", color: "#333", lineHeight: "1.7", marginBottom: "12px" }}>{children}</p>,
                ul: ({ children }) => <ul style={{ marginLeft: "24px", marginBottom: "16px", listStyleType: "disc" }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ marginLeft: "24px", marginBottom: "16px", listStyleType: "decimal" }}>{children}</ol>,
                li: ({ children }) => <li style={{ fontSize: "14px", color: "#333", lineHeight: "1.7", marginBottom: "4px" }}>{children}</li>,
                strong: ({ children }) => <strong style={{ fontWeight: "bold", color: "#1a1a1a" }}>{children}</strong>,
                em: ({ children }) => <em style={{ fontStyle: "italic", color: "#555" }}>{children}</em>,
                hr: () => <hr style={{ border: "none", borderTop: "1px solid #e5e5e5", margin: "24px 0" }} />,
                table: ({ children }) => <div style={{ overflowX: "auto", marginBottom: "16px" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>{children}</table></div>,
                thead: ({ children }) => <thead style={{ backgroundColor: "#f5f5f5" }}>{children}</thead>,
                th: ({ children }) => <th style={{ textAlign: "left", fontWeight: "bold", color: "#333", padding: "8px 12px", borderBottom: "2px solid #ddd" }}>{children}</th>,
                td: ({ children }) => <td style={{ color: "#444", padding: "8px 12px", borderBottom: "1px solid #eee" }}>{children}</td>,
                code: ({ children }) => <code style={{ backgroundColor: "#f5f5f5", color: "#c7254e", padding: "2px 4px", fontSize: "13px", borderRadius: "3px" }}>{children}</code>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid #ddd", paddingLeft: "16px", margin: "16px 0", color: "#666" }}>{children}</blockquote>,
              }}
            >
              {job.result.content}
            </ReactMarkdown>
          </div>

          {/* Publish Section */}
          {applicablePlatforms.length > 0 && (
            <div className="bg-[#111111] border border-[#1a1a1a] p-6 mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
                Publish
              </p>
              <div className="space-y-3">
                {applicablePlatforms.map((platform) => {
                  const pConfig = PLATFORM_CONFIGS[platform];
                  const fb = publishFeedback[platform];

                  return (
                    <div
                      key={platform}
                      className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{pConfig.icon}</span>
                        <span className="font-mono text-sm text-white">{pConfig.label}</span>
                        {fb && (
                          <span
                            className={
                              "font-mono text-[10px] " +
                              (fb.type === "success" ? "text-[#22c55e]" : "text-red-400")
                            }
                          >
                            {fb.msg}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handlePublish(platform)}
                        disabled={publishing === platform}
                        className="bg-[#4a9eff] text-white font-mono text-xs font-bold px-4 py-1.5 hover:bg-[#4a9eff]/80 disabled:opacity-50 transition-colors"
                      >
                        {publishing === platform ? "Publishing..." : "Publish"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
