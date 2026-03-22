"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Finding {
  question: string;
  answer: string;
  date: string;
}

interface Connection {
  related: Array<{ id: string; title: string; reason: string }>;
  gaps: string[];
  strengthens: Array<{ file: string; reason: string }>;
  connection_count: number;
}

interface Topic {
  id: string;
  title: string;
  status: string;
  content: string;
  findings: Finding[];
  decision: string | null;
  codify_proposals: Record<string, string> | null;
}

const STATUSES = ["research", "decision", "codified"];

const FILE_LABELS: Record<string, string> = {
  soul: "soul.md",
  offer: "offer.md",
  audience: "audience.md",
  voice: "voice.md",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${month} ${day} at ${time}`;
}

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Codify state
  const [targetFiles, setTargetFiles] = useState<Record<string, boolean>>({
    soul: false, offer: false, audience: false, voice: false,
  });
  const [generating, setGenerating] = useState(false);
  const [proposals, setProposals] = useState<Record<string, string>>({});
  const [currentContent, setCurrentContent] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [applyingFile, setApplyingFile] = useState<string | null>(null);

  // Add-to-reference state (from AI answer)
  const [showRefPrompt, setShowRefPrompt] = useState(false);
  const [refTargetFiles, setRefTargetFiles] = useState<Record<string, boolean>>({
    soul: false, offer: false, audience: false, voice: false,
  });
  const [refGenerating, setRefGenerating] = useState(false);
  const [refProposals, setRefProposals] = useState<Record<string, string>>({});
  const [refApplied, setRefApplied] = useState<Record<string, boolean>>({});
  const [refApplyingFile, setRefApplyingFile] = useState<string | null>(null);

  // Connections state
  const [connections, setConnections] = useState<Connection | null>(null);
  const [loadingConnections, setLoadingConnections] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/research/" + id);
      if (res.ok) {
        const data = await res.json();
        const t = data.topic;
        if (t.status === "deciding" || t.status === "decided") t.status = "decision";
        if (!Array.isArray(t.findings)) t.findings = [];
        setTopic(t);
        if (t.codify_proposals) setProposals(t.codify_proposals);

        setLoadingConnections(true);
        fetch("/api/research/" + id + "/connections", { method: "POST" })
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setConnections(d); })
          .catch(() => {})
          .finally(() => setLoadingConnections(false));
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!topic?.decision) return;
    const d = topic.decision.toLowerCase();
    const suggestions: Record<string, boolean> = {
      soul: /why|purpose|mission|belief|value|vision|identity/.test(d),
      offer: /offer|price|product|service|deliver|promise|result|transform/.test(d),
      audience: /audience|customer|client|people|who|segment|avatar|market/.test(d),
      voice: /voice|tone|brand|style|language|personality|writing/.test(d),
    };
    const anySelected = Object.values(targetFiles).some(Boolean);
    if (!anySelected) {
      const hasSuggestion = Object.values(suggestions).some(Boolean);
      setTargetFiles(hasSuggestion ? suggestions : { soul: false, offer: true, audience: false, voice: false });
    }
  }, [topic?.decision]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(async (updates: Partial<Topic>) => {
    setSaving(true);
    const dbUpdates = { ...updates };
    if (dbUpdates.status === "decision") dbUpdates.status = "decided";
    await fetch("/api/research/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbUpdates),
    });
    setTopic((prev) => prev ? { ...prev, ...updates } : prev);
    setSaving(false);
  }, [id]);

  if (!topic) return <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>;

  const askAI = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAiAnswer("");
    setError(null);
    try {
      const res = await fetch("/api/research/" + id + "/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiAnswer(data.answer);
        const newFinding: Finding = { question, answer: data.answer, date: new Date().toISOString() };
        const updatedFindings = [...(topic.findings || []), newFinding];
        setTopic((prev) => prev ? { ...prev, findings: updatedFindings } : prev);
        save({ findings: updatedFindings as Topic["findings"] });
      } else {
        setError(data.error || "AI research failed.");
      }
    } catch {
      setError("Could not reach the server.");
    }
    setAsking(false);
  };

  const handleDelete = async () => {
    await fetch("/api/research/" + id, { method: "DELETE" });
    router.push("/dashboard/research");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const text = await file.text();
      const trimmed = text.slice(0, 10000);
      const separator = topic.content ? "\n\n---\n\n" : "";
      const label = "**Uploaded: " + file.name + "**\n\n";
      const updated = topic.content + separator + label + trimmed;
      setTopic((prev) => prev ? { ...prev, content: updated } : prev);
      save({ content: updated });
    } catch {
      setError("Could not read file. Try a text file (.txt, .md, .csv, .pdf).");
    }
    setUploading(false);
    e.target.value = "";
  };

  const generateProposals = async () => {
    const selected = Object.entries(targetFiles).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) return;
    setGenerating(true);
    setProposals({});
    setCurrentContent({});
    setApplied({});
    try {
      const res = await fetch("/api/research/" + id + "/codify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetFiles: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setProposals(data.proposals || {});
        setCurrentContent(data.currentContent || {});
      } else {
        setError(data.error || "Failed to generate proposals.");
      }
    } catch {
      setError("Could not reach the server.");
    }
    setGenerating(false);
  };

  const applyProposal = async (fileType: string) => {
    const proposed = proposals[fileType];
    if (!proposed) return;
    setApplyingFile(fileType);
    try {
      await fetch("/api/research/" + id + "/codify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetFiles: [fileType], applyContent: { [fileType]: proposed } }),
      });
      const saveRes = await fetch("/api/reference/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType, content: proposed }),
      });
      if (saveRes.ok) {
        setApplied((prev) => ({ ...prev, [fileType]: true }));
        const newApplied = { ...applied, [fileType]: true };
        if (Object.keys(proposals).every((k) => newApplied[k])) {
          await save({ status: "codified" });
        }
      }
    } catch (err) {
      console.error("Apply error:", err);
    }
    setApplyingFile(null);
  };

  const discardProposal = (fileType: string) => {
    setProposals((prev) => { const n = { ...prev }; delete n[fileType]; return n; });
    setCurrentContent((prev) => { const n = { ...prev }; delete n[fileType]; return n; });
  };

  const applyAll = async () => {
    for (const ft of Object.keys(proposals).filter((k) => !applied[k])) {
      await applyProposal(ft);
    }
  };

  const generateRefFromAnswer = async () => {
    const selected = Object.entries(refTargetFiles).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) return;
    setRefGenerating(true);
    setRefProposals({});
    setRefApplied({});
    try {
      const res = await fetch("/api/research/" + id + "/codify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetFiles: selected }),
      });
      if (res.ok) {
        const data = await res.json();
        setRefProposals(data.proposals || {});
      }
    } catch (err) {
      console.error("Reference generation error:", err);
    }
    setRefGenerating(false);
  };

  const applyRefProposal = async (fileType: string) => {
    const proposed = refProposals[fileType];
    if (!proposed) return;
    setRefApplyingFile(fileType);
    try {
      const saveRes = await fetch("/api/reference/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType, content: proposed }),
      });
      if (saveRes.ok) setRefApplied((prev) => ({ ...prev, [fileType]: true }));
    } catch (err) {
      console.error("Apply ref error:", err);
    }
    setRefApplyingFile(null);
  };

  const hasDecision = topic.decision && topic.decision.trim().length > 0;
  const showCodify = (topic.status === "decision" || topic.status === "codified") && hasDecision;
  const hasProposals = Object.keys(proposals).length > 0;
  const allApplied = hasProposals && Object.keys(proposals).every((k) => applied[k]);
  const selectedCount = Object.values(targetFiles).filter(Boolean).length;
  const findings = topic.findings || [];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/research" className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors">
          &larr; Back
        </Link>
        <span className="text-[#1a1a1a]">/</span>
        <span className="font-mono text-xs text-[#4a9eff]">{topic.title}</span>
        {topic.status === "codified" && (
          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30">
            CODIFIED
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="font-mono text-xl font-bold">{topic.title}</h1>
        <div className="flex gap-2 items-center">
          <select
            value={topic.status}
            onChange={(e) => save({ status: e.target.value })}
            className="bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-white focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Link
            href={"/dashboard/agents?launch=deep_research&topic=" + encodeURIComponent(topic.title)}
            className="font-mono text-xs px-3 py-1.5 border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black transition-colors"
          >
            Deep Research
          </Link>
          <label className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#6b6b6b] hover:text-[#4a9eff] hover:border-[#4a9eff] transition-colors cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1.5" style={{marginTop: -2}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            {uploading ? "Reading..." : "Upload"}
            <input type="file" accept=".txt,.md,.csv,.doc,.docx,.pdf,.json" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
          <button
            onClick={handleDelete}
            className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Process guide — white cards */}
      <div className="flex items-stretch gap-2 mb-6">
        {[
          { step: 1, label: "Research", desc: "Ask AI questions or upload your own research", status: "research", color: "#4a9eff" },
          { step: 2, label: "Decide", desc: "Write what you decided based on your research", status: "decision", color: "#22c55e" },
          { step: 3, label: "Codify", desc: "AI updates your reference files with your decision", status: "codified", color: "#8b5cf6" },
        ].map((s, i) => {
          const isActive =
            (s.status === "research" && topic.status === "research") ||
            (s.status === "decision" && topic.status === "decision") ||
            (s.status === "codified" && topic.status === "codified");
          const isPast =
            (s.status === "research" && (topic.status === "decision" || topic.status === "codified")) ||
            (s.status === "decision" && topic.status === "codified");

          return (
            <div key={s.step} className="flex items-stretch flex-1 gap-2">
              <div
                className="flex-1 px-4 py-3 transition-all"
                style={{
                  backgroundColor: isActive ? "#ffffff" : isPast ? "#1a1a1a" : "#111111",
                  border: isActive ? "1px solid " + s.color : "1px solid #1a1a1a",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-5 h-5 flex items-center justify-center font-mono text-[10px] font-bold rounded-full shrink-0"
                    style={{
                      backgroundColor: isActive ? s.color : isPast ? "#22c55e" : "#333",
                      color: isActive || isPast ? "#fff" : "#6b6b6b",
                    }}
                  >
                    {isPast ? "\u2713" : s.step}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: isActive ? "#0a0a0a" : isPast ? "#a0a0a0" : "#6b6b6b" }}>
                    {s.label}
                  </span>
                </div>
                <p className="font-mono text-[10px] leading-relaxed" style={{ color: isActive ? "#555" : "#6b6b6b" }}>
                  {s.desc}
                </p>
              </div>
              {i < 2 && (
                <span className="flex items-center font-mono text-[#333] text-xs">&rarr;</span>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="text-xs text-[#ef4444] mb-4 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5 font-mono">
          {error}
        </div>
      )}

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Connected research + Strengthens + Gaps */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff]">
              Similar Research
            </p>
            {connections && connections.connection_count > 0 && (
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                {connections.connection_count} connection{connections.connection_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loadingConnections && (
            <div className="bg-[#111111] border border-[#1a1a1a] p-6 text-center">
              <p className="font-mono text-xs text-[#6b6b6b] animate-pulse">Finding connections across your research...</p>
            </div>
          )}

          {connections && !loadingConnections && (
            <div className="space-y-3">
              {/* Related topics */}
              {connections.related.length > 0 && (
                <div className="bg-[#111111] border border-[#1a1a1a]">
                  <div className="px-3 py-2 border-b border-[#1a1a1a]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#4a9eff]">Related Topics</span>
                  </div>
                  <div className="divide-y divide-[#0a0a0a]">
                    {connections.related.map((r) => (
                      <Link
                        key={r.id}
                        href={"/dashboard/research/" + r.id}
                        className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4a9eff] mt-1.5 shrink-0" />
                        <div>
                          <span className="font-mono text-xs text-white">{r.title}</span>
                          <p className="font-mono text-[10px] text-[#6b6b6b] mt-0.5">{r.reason}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengthens reference files */}
              {connections.strengthens.length > 0 && (
                <div className="bg-[#111111] border border-[#1a1a1a]">
                  <div className="px-3 py-2 border-b border-[#1a1a1a]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#22c55e]">This Research Strengthens</span>
                  </div>
                  <div className="divide-y divide-[#0a0a0a]">
                    {connections.strengthens.map((s) => (
                      <div key={s.file} className="flex items-start gap-3 px-3 py-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1.5 shrink-0" />
                        <div>
                          <span className="font-mono text-xs text-white">{s.file}.md</span>
                          <p className="font-mono text-[10px] text-[#6b6b6b] mt-0.5">{s.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps to explore */}
              {connections.gaps.length > 0 && (
                <div className="bg-[#111111] border border-[#1a1a1a]">
                  <div className="px-3 py-2 border-b border-[#1a1a1a]">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#f59e0b]">Worth Exploring</span>
                  </div>
                  <div className="divide-y divide-[#0a0a0a]">
                    {connections.gaps.map((gap, gi) => (
                      <button
                        key={gi}
                        onClick={() => setQuestion(gap)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left"
                      >
                        <span className="font-mono text-[10px] text-[#f59e0b] mt-0.5 shrink-0">?</span>
                        <span className="font-mono text-xs text-[#a0a0a0]">{gap}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {connections.related.length === 0 && connections.gaps.length === 0 && connections.strengthens.length === 0 && (
                <div className="bg-[#111111] border border-[#1a1a1a] p-6 text-center">
                  <p className="font-mono text-xs text-[#6b6b6b]">
                    No connections yet. Ask your first question to start building them.
                  </p>
                </div>
              )}
            </div>
          )}

          {!connections && !loadingConnections && (
            <div className="bg-[#111111] border border-[#1a1a1a] p-6 text-center">
              <p className="font-mono text-xs text-[#6b6b6b]">
                Connections appear as you research. Start by asking a question.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: AI Research Assistant */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] mb-3">
            AI Research Assistant
          </p>
          <div className="bg-[#111111] border border-[#1a1a1a] p-4">
            <div className="flex gap-2 mb-4">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAI()}
                placeholder="Ask a research question..."
                className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
              />
              <button
                onClick={askAI}
                disabled={asking || !question.trim()}
                className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
              >
                {asking ? "..." : "Ask"}
              </button>
            </div>

            {asking && (
              <p className="font-mono text-sm text-[#8b5cf6] animate-pulse">Researching...</p>
            )}

            {aiAnswer && (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 max-h-[50vh] overflow-y-auto mb-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-[#a0a0a0] leading-relaxed">
                  {aiAnswer}
                </pre>
                <div className="flex gap-3 mt-3 pt-3 border-t border-[#1a1a1a]">
                  <button
                    onClick={() => {
                      const decisionText = "AI Research Answer:\n\nQ: " + question + "\n\n" + aiAnswer;
                      setTopic((prev) => prev ? { ...prev, decision: decisionText } : prev);
                      save({ decision: decisionText, status: "decision" });
                      setShowRefPrompt(!showRefPrompt);
                    }}
                    className="font-mono text-[10px] text-[#22c55e] hover:text-white transition-colors"
                  >
                    + Add to reference files
                  </button>
                  <button
                    onClick={() => { setAiAnswer(""); setQuestion(""); }}
                    className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>

                {showRefPrompt && (
                  <div className="mt-4 border border-[#22c55e]/30 bg-[#0a0a0a] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] mb-3">
                      Update reference files with this answer
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(Object.keys(FILE_LABELS) as string[]).map((ft) => (
                        <label key={ft} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={refTargetFiles[ft] || false}
                            onChange={(e) => setRefTargetFiles((prev) => ({ ...prev, [ft]: e.target.checked }))}
                            className="sr-only"
                          />
                          <span
                            className={"w-3 h-3 border flex items-center justify-center transition-colors " +
                              (refTargetFiles[ft] ? "bg-[#22c55e] border-[#22c55e]" : "border-[#333] group-hover:border-[#555]")}
                          >
                            {refTargetFiles[ft] && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="#000" strokeWidth="1.5" /></svg>
                            )}
                          </span>
                          <span className="font-mono text-xs text-[#a0a0a0] group-hover:text-white transition-colors">{FILE_LABELS[ft]}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={generateRefFromAnswer}
                      disabled={refGenerating || Object.values(refTargetFiles).filter(Boolean).length === 0}
                      className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                      style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                    >
                      {refGenerating ? "Generating..." : "Generate Update"}
                    </button>

                    {Object.keys(refProposals).length > 0 && (
                      <div className="mt-4 space-y-4">
                        {Object.entries(refProposals).map(([fileType, proposed]) => (
                          <div key={fileType} className="border border-[#1a1a1a]">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a] bg-[#111111]">
                              <span className="font-mono text-xs font-bold text-white">{FILE_LABELS[fileType]}</span>
                              {refApplied[fileType] ? (
                                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#22c55e]/20 text-[#22c55e]">APPLIED</span>
                              ) : (
                                <button
                                  onClick={() => applyRefProposal(fileType)}
                                  disabled={refApplyingFile === fileType}
                                  className="font-mono text-[10px] font-bold px-3 py-1 hover:brightness-110 transition-all disabled:opacity-50"
                                  style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                                >
                                  {refApplyingFile === fileType ? "Applying..." : "Apply"}
                                </button>
                              )}
                            </div>
                            <div className="p-3 max-h-[200px] overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-mono text-xs text-[#a0a0a0] leading-relaxed">{proposed}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Research History — GitHub commit style */}
          {findings.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b] mb-3">
                Research History
              </p>
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#1a1a1a]" />
                <div className="space-y-0">
                  {[...findings].reverse().map((f, i) => (
                    <div key={i} className="relative pl-7 pb-4">
                      <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-center">
                        <div className="w-[5px] h-[5px] rounded-full bg-[#4a9eff]" />
                      </div>
                      <div className="bg-[#111111] border border-[#1a1a1a] overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                          <span className="font-mono text-xs text-white font-bold truncate flex-1 mr-2">{f.question}</span>
                          <span className="font-mono text-[10px] text-[#6b6b6b] whitespace-nowrap">{formatDate(f.date)}</span>
                        </div>
                        <div className="p-3 max-h-[200px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-xs text-[#6b6b6b] leading-relaxed">{f.answer}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decision — full width below */}
      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] mb-2">
          Decision
        </p>
        <textarea
          value={topic.decision || ""}
          onChange={(e) => setTopic((prev) => prev ? { ...prev, decision: e.target.value } : prev)}
          onBlur={() => {
            save({ decision: topic.decision });
            if (topic.decision && topic.decision.trim().length > 0 && topic.status === "research") {
              save({ status: "decision" });
            }
          }}
          className="w-full min-h-[100px] bg-[#111111] border border-[#22c55e] p-4 font-mono text-sm text-[#a0a0a0] resize-y focus:outline-none"
          placeholder="What did you decide? Writing a decision lets you codify it into your reference files."
        />
        {saving && <p className="font-mono text-[10px] text-[#22c55e] mt-1">Saving...</p>}
      </div>

      {/* Codify Section — full width */}
      {showCodify && (
        <div className="mt-6 border border-[#8b5cf6]/30 bg-[#111111]">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6]">
                Codify into Reference
              </p>
            </div>
            {topic.status === "codified" && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#8b5cf6]">Applied to:</span>
                {Object.keys(topic.codify_proposals || proposals).map((ft) => (
                  <Link
                    key={ft}
                    href={"/dashboard/files/" + ft + "/edit"}
                    className="font-mono text-[10px] px-2 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6]/20 border border-[#8b5cf6]/20 transition-colors"
                  >
                    {FILE_LABELS[ft]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            {!hasProposals && topic.status !== "codified" && (
              <>
                <p className="font-mono text-xs text-[#6b6b6b] mb-4">
                  Which reference files should this decision update?
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  {(Object.keys(FILE_LABELS) as string[]).map((ft) => (
                    <label key={ft} className="flex items-center gap-2 cursor-pointer group">
                      <span
                        className={"w-3 h-3 border flex items-center justify-center transition-colors " +
                          (targetFiles[ft] ? "bg-[#22c55e] border-[#22c55e]" : "border-[#333] group-hover:border-[#555]")}
                      >
                        {targetFiles[ft] && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="#000" strokeWidth="1.5" /></svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={targetFiles[ft] || false}
                        onChange={(e) => setTargetFiles((prev) => ({ ...prev, [ft]: e.target.checked }))}
                        className="sr-only"
                      />
                      <span className="font-mono text-xs text-[#a0a0a0] group-hover:text-white transition-colors">{FILE_LABELS[ft]}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={generateProposals}
                  disabled={generating || selectedCount === 0}
                  className="font-mono text-xs font-bold px-5 py-2.5 hover:brightness-110 transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
                >
                  {generating ? "Generating updates..." : "Generate Updates (" + selectedCount + " file" + (selectedCount !== 1 ? "s" : "") + ")"}
                </button>
                {generating && (
                  <p className="font-mono text-xs text-[#8b5cf6] mt-3 animate-pulse">
                    AI is weaving your decision into the reference files...
                  </p>
                )}
              </>
            )}

            {hasProposals && (
              <div className="space-y-6">
                {!allApplied && Object.keys(proposals).filter((k) => !applied[k]).length > 1 && (
                  <div className="flex justify-end">
                    <button
                      onClick={applyAll}
                      disabled={!!applyingFile}
                      className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                      style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                    >
                      Apply All ({Object.keys(proposals).filter((k) => !applied[k]).length})
                    </button>
                  </div>
                )}

                {Object.entries(proposals).map(([fileType, proposed]) => (
                  <div key={fileType} className="border border-[#1a1a1a]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                        <span className="font-mono text-xs font-bold text-white">{FILE_LABELS[fileType]}</span>
                        {applied[fileType] && (
                          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30">APPLIED</span>
                        )}
                      </div>
                      {!applied[fileType] && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyProposal(fileType)}
                            disabled={applyingFile === fileType}
                            className="font-mono text-[10px] font-bold px-3 py-1 hover:brightness-110 transition-all disabled:opacity-50"
                            style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                          >
                            {applyingFile === fileType ? "Applying..." : "Apply"}
                          </button>
                          <button
                            onClick={() => discardProposal(fileType)}
                            className="font-mono text-[10px] px-3 py-1 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white hover:border-[#333] transition-colors"
                          >
                            Discard
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="border-r border-[#1a1a1a]">
                        <div className="px-3 py-2 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b6b]">Current</span>
                        </div>
                        <div className="p-4 max-h-[300px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-xs text-[#6b6b6b] leading-relaxed">{currentContent[fileType] || "(empty)"}</pre>
                        </div>
                      </div>
                      <div className="border-l border-[#22c55e]/20">
                        <div className="px-3 py-2 border-b border-[#22c55e]/20 bg-[#22c55e]/5">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#22c55e]">Proposed</span>
                        </div>
                        <div className={"p-4 max-h-[300px] overflow-y-auto " + (applied[fileType] ? "" : "border-l-2 border-[#22c55e]/30")}>
                          <pre className="whitespace-pre-wrap font-mono text-xs text-[#a0a0a0] leading-relaxed">{proposed}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
