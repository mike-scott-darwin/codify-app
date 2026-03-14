"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { soulQuestions } from "@/lib/interview-data";

function generateSoulFile(answers: Record<string, string>): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("type: reference");
  lines.push("status: draft");
  lines.push(`date: ${new Date().toISOString().split("T")[0]}`);
  lines.push("---");
  lines.push("");
  lines.push("# Soul");
  lines.push("");

  if (answers.origin) {
    lines.push("## Origin Story");
    lines.push("");
    lines.push(answers.origin.trim());
    lines.push("");
  }

  if (answers.problem) {
    lines.push("## The Problem We Solve");
    lines.push("");
    lines.push(answers.problem.trim());
    lines.push("");
  }

  if (answers.belief) {
    lines.push("## Core Belief");
    lines.push("");
    lines.push(answers.belief.trim());
    lines.push("");
  }

  if (answers.transformation) {
    lines.push("## The Transformation");
    lines.push("");
    lines.push(answers.transformation.trim());
    lines.push("");
  }

  if (answers.why_you) {
    lines.push("## Why Us");
    lines.push("");
    lines.push(answers.why_you.trim());
    lines.push("");
  }

  if (answers.values) {
    lines.push("## Non-Negotiables");
    lines.push("");
    lines.push(answers.values.trim());
    lines.push("");
  }

  if (answers.mission) {
    lines.push("## The Mission");
    lines.push("");
    lines.push(answers.mission.trim());
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

export default function SoulPreviewPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"split" | "answers" | "file">("split");

  useEffect(() => {
    const stored = sessionStorage.getItem("codify-interview-soul");
    if (stored) {
      setAnswers(JSON.parse(stored));
    }
  }, []);

  const soulFile = generateSoulFile(answers);
  const wordCount = soulFile.split(/\s+/).filter(Boolean).length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.trim().length > 0
  ).length;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(soulFile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([soulFile], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "soul.md";
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
            href="/interview/soul"
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
              Download soul.md
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
                {soulQuestions.map((q) => {
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
              <TerminalHeader title="soul.md" color="#22c55e" />
              <div className="p-6">
                <pre
                  className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                  style={{ color: "#a0a0a0" }}
                >
                  {soulFile}
                </pre>
              </div>
            </div>
          </div>
        ) : view === "answers" ? (
          <div style={{ border: "1px solid #1a1a1a", backgroundColor: "#111111" }}>
            <TerminalHeader title="Your Answers" color="#4a9eff" />
            <div className="p-6 space-y-6">
              {soulQuestions.map((q) => {
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
            <TerminalHeader title="soul.md" color="#22c55e" />
            <div className="p-6">
              <pre
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white"
              >
                {soulFile}
              </pre>
            </div>
          </div>
        )}
        {/* Next file */}
        <div className="mt-8 text-center">
          <Link href="/interview/offer">
            <button
              className="font-mono text-sm font-bold px-8 py-3 hover:brightness-110 transition-all"
              style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
            >
              Next: Build offer.md →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
