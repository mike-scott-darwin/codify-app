"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Finding {
  question: string;
  answer: string;
  date: string;
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

// Core files are always available for codification; dynamic files from the repo context will also appear
const CORE_FILE_LABELS: Record<string, string> = {
  soul: "soul.md",
  offer: "offer.md",
  audience: "audience.md",
  voice: "voice.md",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function parseDecision(raw: string): { summary: string; options: string; rationale: string; impact: string } {
  const sections = { summary: "", options: "", rationale: "", impact: "" };
  if (!raw) return sections;

  // Try to parse structured format
  const summaryMatch = raw.match(/## Decision\n\n([\s\S]*?)(?=\n## |$)/);
  const optionsMatch = raw.match(/## Options Considered\n\n([\s\S]*?)(?=\n## |$)/);
  const rationaleMatch = raw.match(/## Rationale\n\n([\s\S]*?)(?=\n## |$)/);
  const impactMatch = raw.match(/## Impact\n\n([\s\S]*?)(?=\n## |$)/);

  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim();
    sections.options = optionsMatch ? optionsMatch[1].trim() : "";
    sections.rationale = rationaleMatch ? rationaleMatch[1].trim() : "";
    sections.impact = impactMatch ? impactMatch[1].trim() : "";
  } else {
    // Legacy: entire text is the summary
    sections.summary = raw.trim();
  }
  return sections;
}

function buildDecision(fields: { summary: string; options: string; rationale: string; impact: string }): string {
  const parts: string[] = [];
  if (fields.summary.trim()) parts.push("## Decision\n\n" + fields.summary.trim());
  if (fields.options.trim()) parts.push("## Options Considered\n\n" + fields.options.trim());
  if (fields.rationale.trim()) parts.push("## Rationale\n\n" + fields.rationale.trim());
  if (fields.impact.trim()) parts.push("## Impact\n\n" + fields.impact.trim());
  return parts.join("\n\n");
}

function DecisionForm({ decision, onSave, saving }: { decision: string; onSave: (text: string) => void; saving: boolean }) {
  const parsed = parseDecision(decision);
  const [summary, setSummary] = useState(parsed.summary);
  const [options, setOptions] = useState(parsed.options);
  const [rationale, setRationale] = useState(parsed.rationale);
  const [impact, setImpact] = useState(parsed.impact);
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    const text = buildDecision({ summary, options, rationale, impact });
    onSave(text);
    setDirty(false);
  };

  const mark = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setter(e.target.value);
    setDirty(true);
  };

  const hasContent = summary.trim().length > 0;

  return (
    <div className="bg-[#111111] border border-[#1a1a1a]">
      {/* Decision header — like a commit title */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hasContent ? "#22c55e" : "#333" }} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#22c55e]">
            {hasContent ? "Decision Recorded" : "Pending Decision"}
          </span>
        </div>
      </div>

      {/* Decision summary — the one-liner */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <label className="font-mono text-[10px] text-[#6b6b6b] block mb-1.5">What did you decide?</label>
        <textarea
          value={summary}
          onChange={mark(setSummary)}
          placeholder={"One clear statement. e.g. We will position the offer as a business brain, not a knowledge tool."}
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-[#22c55e] resize-none"
          rows={2}
        />
      </div>

      {/* Options considered */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <label className="font-mono text-[10px] text-[#6b6b6b] block mb-1.5">Options considered</label>
        <textarea
          value={options}
          onChange={mark(setOptions)}
          placeholder={"Option A: ...\nOption B: ...\nOption C: ..."}
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-xs text-[#a0a0a0] focus:outline-none focus:border-[#22c55e] resize-y"
          rows={3}
        />
      </div>

      {/* Rationale */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <label className="font-mono text-[10px] text-[#6b6b6b] block mb-1.5">Why this option?</label>
        <textarea
          value={rationale}
          onChange={mark(setRationale)}
          placeholder="The reasoning behind this decision..."
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-xs text-[#a0a0a0] focus:outline-none focus:border-[#22c55e] resize-y"
          rows={2}
        />
      </div>

      {/* Impact on brain files */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <label className="font-mono text-[10px] text-[#6b6b6b] block mb-1.5">Impact on your brain files</label>
        <textarea
          value={impact}
          onChange={mark(setImpact)}
          placeholder="e.g. Updates offer.md positioning, changes voice.md tone guidelines..."
          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-xs text-[#a0a0a0] focus:outline-none focus:border-[#22c55e] resize-y"
          rows={2}
        />
      </div>

      {/* Save */}
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#6b6b6b]">
          {saving ? "Saving..." : dirty ? "Unsaved changes" : hasContent ? "Saved" : ""}
        </span>
        <button
          onClick={handleSave}
          disabled={!dirty || !summary.trim()}
          className="font-mono text-xs font-bold px-5 py-2 hover:brightness-110 transition-all disabled:opacity-30"
          style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
        >
          Save Decision
        </button>
      </div>
    </div>
  );
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
        setQuestion("");
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
      const newFinding: Finding = {
        question: "Uploaded: " + file.name,
        answer: trimmed,
        date: new Date().toISOString(),
      };
      const updatedFindings = [...(topic.findings || []), newFinding];
      setTopic((prev) => prev ? { ...prev, findings: updatedFindings } : prev);
      save({ findings: updatedFindings as Topic["findings"] });
    } catch {
      setError("Could not read file.");
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

  const hasDecision = topic.decision && topic.decision.trim().length > 0;
  const showCodify = (topic.status === "decision" || topic.status === "codified") && hasDecision;
  const hasProposals = Object.keys(proposals).length > 0;
  const allApplied = hasProposals && Object.keys(proposals).every((k) => applied[k]);
  const selectedCount = Object.values(targetFiles).filter(Boolean).length;
  const findings = topic.findings || [];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/research" className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors">
          &larr; All Research
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-mono text-xl font-bold mb-1">{topic.title}</h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{
              color: topic.status === "codified" ? "#8b5cf6" : topic.status === "decision" ? "#22c55e" : "#4a9eff"
            }}>
              {topic.status}
            </span>
            <span className="font-mono text-[10px] text-[#6b6b6b]">
              {findings.length} finding{findings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <label className="font-mono text-[10px] px-3 py-1.5 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors cursor-pointer">
            {uploading ? "Reading..." : "+ Upload"}
            <input type="file" accept=".txt,.md,.csv,.doc,.docx,.pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
          <button
            onClick={handleDelete}
            className="font-mono text-[10px] px-3 py-1.5 text-[#6b6b6b] hover:text-[#ef4444] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-[#ef4444] mb-6 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5 font-mono">
          {error}
        </div>
      )}

      {/* Step 1: Ask AI — always visible */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-3">
          Research
        </p>
        <div className="bg-[#111111] border border-[#1a1a1a] p-4">
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
              placeholder="Ask a research question..."
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff]"
            />
            <button
              onClick={askAI}
              disabled={asking || !question.trim()}
              className="font-mono text-xs font-bold px-5 py-2.5 hover:brightness-110 transition-all disabled:opacity-50"
              style={{ backgroundColor: "#4a9eff", color: "#000", borderRadius: 0 }}
            >
              {asking ? "Researching..." : "Ask"}
            </button>
          </div>

          {/* Current AI answer */}
          {asking && (
            <p className="font-mono text-sm text-[#4a9eff] animate-pulse mt-4">Researching...</p>
          )}

          {aiAnswer && !asking && (
            <div className="mt-4 bg-[#0a0a0a] border border-[#1a1a1a] p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-[#a0a0a0] leading-relaxed max-h-[40vh] overflow-y-auto">
                {aiAnswer}
              </pre>
              <button
                onClick={() => setAiAnswer("")}
                className="font-mono text-[10px] text-[#6b6b6b] hover:text-white transition-colors mt-3"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Research history — findings */}
      {findings.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b] mb-3">
            Research History
          </p>
          <div className="space-y-2">
            {[...findings].reverse().map((f, i) => (
              <details key={i} className="bg-[#111111] border border-[#1a1a1a] group">
                <summary className="px-4 py-3 cursor-pointer hover:bg-[#1a1a1a]/50 transition-colors flex items-start gap-3">
                  <span className="font-mono text-[10px] text-[#4a9eff] mt-0.5 shrink-0">Q</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-white">{f.question}</span>
                    <span className="font-mono text-[10px] text-[#6b6b6b] block mt-0.5">
                      {formatDate(f.date)}
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-4 border-t border-[#1a1a1a]">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-[#a0a0a0] leading-relaxed mt-3 max-h-60 overflow-y-auto">
                    {f.answer}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Decision — structured like a git commit */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22c55e] mb-3">
          Decision
        </p>
        <DecisionForm
          decision={topic.decision || ""}
          onSave={(text) => {
            setTopic((prev) => prev ? { ...prev, decision: text } : prev);
            const newStatus = text.trim() ? "decision" : "research";
            save({ decision: text, status: newStatus });
          }}
          saving={saving}
        />
      </div>

      {/* Step 3: Codify — update your brain */}
      {showCodify && (
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] mb-3">
            Codify into Your Brain
          </p>

          {!hasProposals && !allApplied && (
            <div className="bg-[#111111] border border-[#1a1a1a] p-4">
              <p className="font-mono text-xs text-[#a0a0a0] mb-4">
                Which files should this decision update?
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {(Object.keys(CORE_FILE_LABELS) as string[]).map((ft) => (
                  <label key={ft} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={targetFiles[ft] || false}
                      onChange={(e) => setTargetFiles((prev) => ({ ...prev, [ft]: e.target.checked }))}
                      className="sr-only"
                    />
                    <span
                      className={"w-3 h-3 border flex items-center justify-center transition-colors " +
                        (targetFiles[ft] ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-[#333] group-hover:border-[#555]")}
                    >
                      {targetFiles[ft] && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke="#fff" strokeWidth="1.5" /></svg>
                      )}
                    </span>
                    <span className="font-mono text-xs text-[#a0a0a0] group-hover:text-white transition-colors">{CORE_FILE_LABELS[ft] || ft + ".md"}</span>
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
            </div>
          )}

          {/* Proposals */}
          {hasProposals && (
            <div className="space-y-3">
              {Object.entries(proposals).map(([ft, content]) => (
                <div key={ft} className="bg-[#111111] border border-[#1a1a1a]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
                    <span className="font-mono text-xs text-white font-bold">{CORE_FILE_LABELS[ft] || ft + ".md"}</span>
                    {applied[ft] ? (
                      <span className="font-mono text-[10px] text-[#22c55e]">Applied</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => applyProposal(ft)}
                          disabled={applyingFile === ft}
                          className="font-mono text-[10px] font-bold px-3 py-1 hover:brightness-110 transition-all disabled:opacity-50"
                          style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                        >
                          {applyingFile === ft ? "Applying..." : "Apply"}
                        </button>
                        <button
                          onClick={() => {
                            setProposals((prev) => { const n = { ...prev }; delete n[ft]; return n; });
                          }}
                          className="font-mono text-[10px] text-[#6b6b6b] hover:text-[#ef4444] transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Show diff: current vs proposed */}
                  {currentContent[ft] && (
                    <div className="px-4 py-2 border-b border-[#1a1a1a]">
                      <details>
                        <summary className="font-mono text-[10px] text-[#6b6b6b] cursor-pointer hover:text-white transition-colors">
                          View current content
                        </summary>
                        <pre className="whitespace-pre-wrap font-mono text-[10px] text-[#6b6b6b] leading-relaxed mt-2 max-h-32 overflow-y-auto">
                          {currentContent[ft]}
                        </pre>
                      </details>
                    </div>
                  )}

                  <div className="px-4 py-3">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-[#a0a0a0] leading-relaxed max-h-48 overflow-y-auto">
                      {content}
                    </pre>
                  </div>
                </div>
              ))}

              {/* Apply all button */}
              {!allApplied && Object.keys(proposals).length > 1 && (
                <button
                  onClick={async () => {
                    for (const ft of Object.keys(proposals).filter((k) => !applied[k])) {
                      await applyProposal(ft);
                    }
                  }}
                  className="font-mono text-xs font-bold px-5 py-2.5 hover:brightness-110 transition-all w-full"
                  style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
                >
                  Apply All
                </button>
              )}

              {allApplied && (
                <div className="bg-white/[0.03] border border-[#22c55e] p-4 text-center">
                  <p className="font-mono text-sm text-[#22c55e] font-bold mb-1">
                    Your brain files are updated.
                  </p>
                  <p className="font-mono text-xs text-[#6b6b6b]">
                    This research is now codified. Every future output reflects what you learned.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
