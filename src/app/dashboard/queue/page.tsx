"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QueueItem {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  source_url: string | null;
  relevance_score: number;
  status: string;
  topics: string[];
  suggested_formats: string[];
  user_feedback: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const SOURCE_COLORS: Record<string, string> = {
  research_scout: "#4a9eff",
  trend_monitor: "#22c55e",
  manual: "#6b6b6b",
  research: "#8b5cf6",
};

const SOURCE_LABELS: Record<string, string> = {
  research_scout: "Scout",
  trend_monitor: "Trend",
  manual: "Manual",
  research: "Research",
};

const FORMAT_OPTIONS = [
  { value: "ad_copy", label: "Ad Copy", icon: "\u26A1" },
  { value: "social_post", label: "Social Post", icon: "\u25C6" },
  { value: "email_sequence", label: "Email Sequence", icon: "\u2709" },
  { value: "vsl_script", label: "VSL Script", icon: "\u25B6" },
  { value: "landing_page", label: "Landing Page", icon: "\u25A0" },
  { value: "newsletter", label: "Newsletter", icon: "\u25C9" },
];

const TABS = ["pending", "approved", "rejected", "generated"] as const;

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  // Feedback state
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  // Repurpose modal state
  const [repurposeItem, setRepurposeItem] = useState<QueueItem | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [genProgress, setGenProgress] = useState<string>("");

  const loadItems = async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const res = await fetch("/api/content-queue?" + params.toString());
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
      setCounts(data.counts || {});
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems(activeTab);
  }, [activeTab]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    const res = await fetch("/api/content-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        summary: newSummary || undefined,
        source_url: newUrl || undefined,
      }),
    });
    if (res.ok) {
      setNewTitle("");
      setNewSummary("");
      setNewUrl("");
      setShowAddForm(false);
      loadItems(activeTab);
    }
    setAdding(false);
  };

  const updateStatus = async (id: string, status: string, feedback?: string) => {
    await fetch("/api/content-queue/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, user_feedback: feedback || undefined }),
    });
    setFeedbackId(null);
    setFeedbackText("");
    loadItems(activeTab);
  };

  const deleteItem = async (id: string) => {
    await fetch("/api/content-queue/" + id, { method: "DELETE" });
    loadItems(activeTab);
  };

  const openRepurpose = (item: QueueItem) => {
    setRepurposeItem(item);
    const initial: Record<string, boolean> = {};
    FORMAT_OPTIONS.forEach((f) => {
      initial[f.value] = (item.suggested_formats || []).includes(f.value);
    });
    setSelectedFormats(initial);
    setGeneratedIds([]);
    setGenProgress("");
  };

  const toggleAllFormats = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    FORMAT_OPTIONS.forEach((f) => { next[f.value] = checked; });
    setSelectedFormats(next);
  };

  const handleRepurpose = async () => {
    if (!repurposeItem) return;
    const formats = Object.entries(selectedFormats)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (formats.length === 0) return;

    setGenerating(true);
    setGeneratedIds([]);
    setGenProgress("Generating " + formats.length + " format" + (formats.length !== 1 ? "s" : "") + "...");

    try {
      const res = await fetch("/api/content-queue/" + repurposeItem.id + "/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formats }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedIds(data.outputIds || []);
        setGenProgress(
          "Done! " + data.generated + " generated" +
          (data.failed > 0 ? ", " + data.failed + " failed" : "")
        );
        loadItems(activeTab);
      } else {
        setGenProgress("Error: " + (data.error || "Generation failed."));
      }
    } catch {
      setGenProgress("Error: Could not reach the server.");
    }
    setGenerating(false);
  };

  const selectedFormatCount = Object.values(selectedFormats).filter(Boolean).length;
  const allSelected = selectedFormatCount === FORMAT_OPTIONS.length;

  const scoreColor = (score: number) => {
    if (score > 70) return "#22c55e";
    if (score > 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Content Queue</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        Approve, reject, or repurpose content opportunities.
      </p>

      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        {TABS.map((t) => (
          <span key={t} className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b6b]">
            {t}: <span className="text-white">{counts[t] || 0}</span>
          </span>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-colors"
            style={{
              borderColor: activeTab === t ? "#4a9eff" : "#1a1a1a",
              color: activeTab === t ? "#4a9eff" : "#6b6b6b",
            }}
          >
            {t} ({counts[t] || 0})
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="font-mono text-sm font-bold px-4 py-1.5 hover:brightness-110 transition-all"
          style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
        >
          + Add to Queue
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-[#111111] border border-[#1a1a1a] p-4 mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-3">
            Add to Queue
          </p>
          <div className="space-y-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title *"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff]"
            />
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Summary (optional)"
              rows={2}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff] resize-y"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Source URL (optional)"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-[#4a9eff]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={adding || !newTitle.trim()}
                className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
              >
                {adding ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="font-mono text-xs px-4 py-2 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
          <p className="font-mono text-sm text-[#6b6b6b]">
            No {activeTab} items in queue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-[#111111] border border-[#1a1a1a] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + source badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-white">
                      {item.title}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border shrink-0"
                      style={{
                        color: SOURCE_COLORS[item.source] || "#6b6b6b",
                        borderColor: SOURCE_COLORS[item.source] || "#1a1a1a",
                      }}
                    >
                      {SOURCE_LABELS[item.source] || item.source}
                    </span>
                  </div>

                  {/* Summary */}
                  {item.summary && (
                    <p className="font-mono text-xs text-[#6b6b6b] mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                  )}

                  {/* Relevance score */}
                  {item.relevance_score > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[9px] text-[#6b6b6b]">Relevance</span>
                      <div className="w-24 h-1.5 bg-[#1a1a1a] overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: item.relevance_score + "%",
                            backgroundColor: scoreColor(item.relevance_score),
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-[9px]"
                        style={{ color: scoreColor(item.relevance_score) }}
                      >
                        {item.relevance_score}
                      </span>
                    </div>
                  )}

                  {/* Topics */}
                  {item.topics && item.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="font-mono text-[9px] px-1.5 py-0.5 bg-[#1a1a1a] text-[#6b6b6b]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested formats */}
                  {item.suggested_formats && item.suggested_formats.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.suggested_formats.map((fmt, i) => {
                        const opt = FORMAT_OPTIONS.find((f) => f.value === fmt);
                        return (
                          <span
                            key={i}
                            className="font-mono text-[9px] px-1.5 py-0.5 border border-[#1a1a1a] text-[#6b6b6b]"
                          >
                            {opt ? opt.icon + " " + opt.label : fmt}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, "approved")}
                        className="font-mono text-[10px] font-bold px-3 py-1.5 hover:brightness-110 transition-all"
                        style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (feedbackId === item.id) {
                            updateStatus(item.id, "rejected", feedbackText);
                          } else {
                            setFeedbackId(item.id);
                            setFeedbackText("");
                          }
                        }}
                        className="font-mono text-[10px] px-3 py-1.5 border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="font-mono text-[10px] px-3 py-1.5 text-[#6b6b6b] hover:text-[#ef4444] transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {item.status === "approved" && (
                    <button
                      onClick={() => openRepurpose(item)}
                      className="font-mono text-[10px] font-bold px-3 py-1.5 hover:brightness-110 transition-all"
                      style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
                    >
                      Repurpose
                    </button>
                  )}
                  {item.status === "generated" && (
                    <Link
                      href="/dashboard/outputs"
                      className="font-mono text-[10px] px-3 py-1.5 border border-[#4a9eff] text-[#4a9eff] hover:bg-[#4a9eff] hover:text-black transition-colors text-center"
                    >
                      View Outputs
                    </Link>
                  )}
                  <span className="font-mono text-[9px] text-[#6b6b6b] text-right">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Feedback textarea for rejection */}
              {feedbackId === item.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Reason for rejecting (optional)..."
                    className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-[#ef4444]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateStatus(item.id, "rejected", feedbackText);
                    }}
                  />
                  <button
                    onClick={() => updateStatus(item.id, "rejected", feedbackText)}
                    className="font-mono text-[10px] px-3 py-1.5 bg-[#ef4444] text-white hover:brightness-110 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setFeedbackId(null)}
                    className="font-mono text-[10px] px-3 py-1.5 text-[#6b6b6b] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* User feedback display */}
              {item.user_feedback && item.status === "rejected" && (
                <div className="mt-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#1a1a1a]">
                  <span className="font-mono text-[9px] text-[#ef4444]">Feedback: </span>
                  <span className="font-mono text-[9px] text-[#6b6b6b]">{item.user_feedback}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Repurpose Modal */}
      {repurposeItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] mb-1">
                  One-Click Repurpose
                </p>
                <p className="font-mono text-sm text-white font-bold">
                  {repurposeItem.title}
                </p>
              </div>
              <button
                onClick={() => setRepurposeItem(null)}
                className="font-mono text-sm text-[#6b6b6b] hover:text-white transition-colors"
              >
                x
              </button>
            </div>

            {/* Format selection */}
            <div className="px-6 py-4">
              {generatedIds.length === 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-[#6b6b6b]">
                      Select content formats to generate:
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleAllFormats(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={"w-3 h-3 border flex items-center justify-center transition-colors " +
                          (allSelected ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-[#333]")
                        }
                      >
                        {allSelected && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4L3 6L7 2" stroke="#fff" strokeWidth="1.5" />
                          </svg>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-[#6b6b6b]">Select All</span>
                    </label>
                  </div>

                  <div className="space-y-2 mb-6">
                    {FORMAT_OPTIONS.map((fmt) => (
                      <label
                        key={fmt.value}
                        className="flex items-center gap-3 p-3 bg-[#111111] border border-[#1a1a1a] cursor-pointer hover:border-[#333] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFormats[fmt.value] || false}
                          onChange={(e) =>
                            setSelectedFormats((prev) => ({ ...prev, [fmt.value]: e.target.checked }))
                          }
                          className="sr-only"
                        />
                        <span
                          className={"w-3 h-3 border flex items-center justify-center transition-colors " +
                            (selectedFormats[fmt.value] ? "bg-[#8b5cf6] border-[#8b5cf6]" : "border-[#333]")
                          }
                        >
                          {selectedFormats[fmt.value] && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1 4L3 6L7 2" stroke="#fff" strokeWidth="1.5" />
                            </svg>
                          )}
                        </span>
                        <span className="font-mono text-sm text-[#6b6b6b]">{fmt.icon}</span>
                        <span className="font-mono text-xs text-white">{fmt.label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleRepurpose}
                    disabled={generating || selectedFormatCount === 0}
                    className="w-full font-mono text-xs font-bold px-4 py-3 hover:brightness-110 transition-all disabled:opacity-50"
                    style={{ backgroundColor: "#8b5cf6", color: "#fff", borderRadius: 0 }}
                  >
                    {generating
                      ? genProgress
                      : "Generate All (" + selectedFormatCount + " format" + (selectedFormatCount !== 1 ? "s" : "") + ")"
                    }
                  </button>
                </>
              )}

              {/* Progress/results */}
              {generating && generatedIds.length === 0 && (
                <p className="font-mono text-xs text-[#8b5cf6] mt-3 animate-pulse">
                  {genProgress}
                </p>
              )}

              {generatedIds.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-xs text-[#22c55e] mb-4">{genProgress}</p>
                  <div className="space-y-2 mb-4">
                    {generatedIds.map((oid) => (
                      <Link
                        key={oid}
                        href={"/dashboard/outputs/" + oid}
                        className="block font-mono text-xs text-[#4a9eff] hover:text-white transition-colors p-2 bg-[#111111] border border-[#1a1a1a]"
                      >
                        View Output {oid.substring(0, 8)}...
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={() => setRepurposeItem(null)}
                    className="w-full font-mono text-xs px-4 py-2 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
