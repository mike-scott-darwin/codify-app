"use client";

import { useState, useEffect } from "react";
import { useEnrichment } from "@/lib/use-enrichment";
import Link from "next/link";
import { voiceQuestions } from "@/lib/interview-data";

function generateVoiceFile(answers: Record<string, string>): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("type: reference");
  lines.push("status: draft");
  lines.push(`date: ${new Date().toISOString().split("T")[0]}`);
  lines.push("---");
  lines.push("");
  lines.push("# Voice");
  lines.push("");

  if (answers.voice_tone) {
    lines.push("## Tone");
    lines.push("");
    lines.push(answers.voice_tone.trim());
    lines.push("");
  }

  if (answers.voice_phrases) {
    lines.push("## Signature Phrases");
    lines.push("");
    lines.push(answers.voice_phrases.trim());
    lines.push("");
  }

  if (answers.voice_never) {
    lines.push("## Words We Never Use");
    lines.push("");
    lines.push(answers.voice_never.trim());
    lines.push("");
  }

  if (answers.voice_example) {
    lines.push("## Example (Write Like You Talk)");
    lines.push("");
    lines.push(answers.voice_example.trim());
    lines.push("");
  }

  if (answers.voice_personality) {
    lines.push("## Personality");
    lines.push("");
    lines.push(answers.voice_personality.trim());
    lines.push("");
  }

  return lines.join("\n");
}

function TerminalHeader({ title, color }: { title: string; color: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5"
      style={{ borderBottom: "1px solid #1a1a1a" }}
    >
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
      </div>
      <span
        className="font-mono text-xs font-medium uppercase"
        style={{ letterSpacing: "0.2em", color }}
      >
        {title}
      </span>
    </div>
  );
}

export default function VoicePreviewPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"split" | "answers" | "file">("split");

  useEffect(() => {
    const stored = sessionStorage.getItem("codify-interview-voice");
    if (stored) {
      setAnswers(JSON.parse(stored));
    }
  }, []);

  const voiceFile = generateVoiceFile(answers);
  const { enrichedContent, isLoading, error: enrichError, enrich, reset: resetEnrichment, isEnriched } = useEnrichment("voice", answers);
  const displayContent = enrichedContent || voiceFile;
  const wordCount = voiceFile.split(/\s+/).filter(Boolean).length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.trim().length > 0
  ).length;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([displayContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voice.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewOptions = ["split", "answers", "file"] as const;
  const viewLabels = { split: "Split", answers: "Answers", file: "File" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Top bar */}
      <nav className="px-6 py-4" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/interview/voice"
            className="font-mono text-sm transition-colors hover:text-white"
            style={{ color: "#a0a0a0" }}
          >
            ← Back to Interview
          </Link>

          <span className="font-mono text-sm text-white">
            <span style={{ color: "#22c55e" }}>❯</span> codify
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={isEnriched ? resetEnrichment : enrich}
              disabled={isLoading}
              className="font-mono text-sm px-4 py-2 transition-colors"
              style={{
                border: "1px solid #1a1a1a",
                borderRadius: 0,
                color: isLoading ? "#6b6b6b" : isEnriched ? "#f59e0b" : "#8b5cf6",
                backgroundColor: "transparent",
              }}
            >
              {isLoading ? "Enriching..." : isEnriched ? "Reset" : "Enrich with AI"}
            </button>
            <button
              onClick={copyToClipboard}
              className="font-mono text-sm px-4 py-2 transition-colors"
              style={{
                border: "1px solid #1a1a1a",
                borderRadius: 0,
                color: copied ? "#22c55e" : "#a0a0a0",
                backgroundColor: "transparent",
              }}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <button
              onClick={downloadFile}
              className="font-mono text-sm font-bold px-4 py-2"
              style={{
                backgroundColor: "#22c55e",
                color: "#000000",
                borderRadius: 0,
              }}
            >
              Download voice.md
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* View toggle + stats */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex" style={{ border: "1px solid #1a1a1a" }}>
            {viewOptions.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="font-mono text-xs font-medium px-4 py-2 transition-colors"
                style={{
                  backgroundColor: view === v ? "#111111" : "transparent",
                  color: view === v ? "#ffffff" : "#6b6b6b",
                  borderRadius: 0,
                }}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>

          <span className="font-mono text-xs" style={{ color: "#6b6b6b" }}>
            {answeredCount} questions answered · {wordCount} words generated
          </span>
        </div>

        {/* Content */}
        {view === "split" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Answers */}
            <div style={{ border: "1px solid #1a1a1a", backgroundColor: "#111111" }}>
              <TerminalHeader title="Your Answers" color="#4a9eff" />
              <div className="p-6 space-y-6">
                {voiceQuestions.map((q) => {
                  const answer = answers[q.id];
                  if (!answer) return null;
                  return (
                    <div key={q.id}>
                      <p
                        className="font-mono text-xs font-medium uppercase mb-1.5"
                        style={{ letterSpacing: "0.2em", color: "#6b6b6b" }}
                      >
                        {q.section}
                      </p>
                      <p className="font-mono text-sm leading-relaxed text-white">
                        {answer}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Generated file */}
            <div style={{ border: "1px solid #1a1a1a", backgroundColor: "#111111" }}>
              <TerminalHeader title="voice.md" color="#22c55e" />
              <div className="p-6">
                {isLoading && (
                    <div className="mb-4 p-4 border border-[#8b5cf6]" style={{ backgroundColor: "#111111" }}>
                      <p className="font-mono text-sm animate-pulse" style={{ color: "#8b5cf6" }}>
                        Enriching with AI...
                      </p>
                    </div>
                  )}
                  {enrichError && (
                    <div className="mb-4 p-4 border border-[#ef4444]" style={{ backgroundColor: "#111111" }}>
                      <p className="font-mono text-xs" style={{ color: "#ef4444" }}>
                        Error: {enrichError}
                      </p>
                    </div>
                  )}
                  {isEnriched && (
                    <p className="font-mono text-xs mb-4" style={{ color: "#8b5cf6" }}>
                      Enriched with AI
                    </p>
                  )}
                  <pre
                  className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                  style={{ color: "#a0a0a0" }}
                >
                  {displayContent}
                </pre>
              </div>
            </div>
          </div>
        ) : view === "answers" ? (
          <div style={{ border: "1px solid #1a1a1a", backgroundColor: "#111111" }}>
            <TerminalHeader title="Your Answers" color="#4a9eff" />
            <div className="p-6 space-y-6">
              {voiceQuestions.map((q) => {
                const answer = answers[q.id];
                if (!answer) return null;
                return (
                  <div key={q.id}>
                    <p
                      className="font-mono text-xs font-medium uppercase mb-1"
                      style={{ letterSpacing: "0.2em", color: "#6b6b6b" }}
                    >
                      {q.section}
                    </p>
                    <p className="font-mono text-sm font-medium text-white mb-1">
                      {q.question}
                    </p>
                    <p
                      className="font-mono text-sm leading-relaxed"
                      style={{ color: "#a0a0a0" }}
                    >
                      {answer}
                    </p>
                    <div
                      className="mt-4"
                      style={{ borderBottom: "1px solid #1a1a1a" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ border: "1px solid #1a1a1a", backgroundColor: "#111111" }}>
            <TerminalHeader title="voice.md" color="#22c55e" />
            <div className="p-6">
              <pre
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white"
              >
                {displayContent}
              </pre>
            </div>
          </div>
        )}
        {/* Go to assessment */}
        <div className="mt-8 text-center">
          <Link href="/assessment">
            <button
              className="font-mono text-sm font-bold px-8 py-3 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
            >
              See Your Assessment →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
