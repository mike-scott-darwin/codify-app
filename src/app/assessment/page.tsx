"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { calculateContextScore } from "@/lib/scoring";
import type { ContextScore, ReferenceFile } from "@/lib/types";

function terminalBar(percentage: number, length: number = 20): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}

const STATUS_CONFIG: Record<
  ReferenceFile["status"],
  { color: string; label: string }
> = {
  missing: { color: "text-[#ef4444]", label: "MISSING" },
  skeleton: { color: "text-[#f59e0b]", label: "SKELETON" },
  draft: { color: "text-[#f59e0b]", label: "DRAFT" },
  solid: { color: "text-[#4a9eff]", label: "SOLID" },
  strong: { color: "text-[#22c55e]", label: "STRONG" },
};

interface FileConfig {
  storageKey: string;
  name: string;
  path: string;
  interviewPath: string;
  previewPath: string;
  buildContent: (answers: Record<string, string>) => string;
}

const FILE_CONFIGS: FileConfig[] = [
  {
    storageKey: "codify-interview-soul",
    name: "soul.md",
    path: "reference/core/soul.md",
    interviewPath: "/interview/soul",
    previewPath: "/preview/soul",
    buildContent: (a) => {
      const s: string[] = ["# Soul\n"];
      if (a.origin) s.push(`## Origin Story\n\n${a.origin.trim()}\n`);
      if (a.problem) s.push(`## The Problem We Solve\n\n${a.problem.trim()}\n`);
      if (a.belief) s.push(`## Core Belief\n\n${a.belief.trim()}\n`);
      if (a.transformation) s.push(`## The Transformation\n\n${a.transformation.trim()}\n`);
      if (a.why_you) s.push(`## Why Us\n\n${a.why_you.trim()}\n`);
      if (a.values) s.push(`## Non-Negotiables\n\n${a.values.trim()}\n`);
      if (a.mission) s.push(`## The Mission\n\n${a.mission.trim()}\n`);
      return s.join("\n");
    },
  },
  {
    storageKey: "codify-interview-offer",
    name: "offer.md",
    path: "reference/core/offer.md",
    interviewPath: "/interview/offer",
    previewPath: "/preview/offer",
    buildContent: (a) => {
      const s: string[] = ["# Offer\n"];
      if (a.offer_name) s.push(`## The Offer\n\n${a.offer_name.trim()}\n`);
      if (a.offer_outcome) s.push(`## The Outcome\n\n${a.offer_outcome.trim()}\n`);
      if (a.offer_price) s.push(`## Price & Model\n\n${a.offer_price.trim()}\n`);
      if (a.offer_audience) s.push(`## Who It's For\n\n${a.offer_audience.trim()}\n`);
      if (a.offer_differentiator) s.push(`## Why This vs Alternatives\n\n${a.offer_differentiator.trim()}\n`);
      return s.join("\n");
    },
  },
  {
    storageKey: "codify-interview-audience",
    name: "audience.md",
    path: "reference/core/audience.md",
    interviewPath: "/interview/audience",
    previewPath: "/preview/audience",
    buildContent: (a) => {
      const s: string[] = ["# Audience\n"];
      if (a.audience_who) s.push(`## Who They Are\n\n${a.audience_who.trim()}\n`);
      if (a.audience_struggle) s.push(`## What They're Struggling With\n\n${a.audience_struggle.trim()}\n`);
      if (a.audience_tried) s.push(`## What They've Already Tried\n\n${a.audience_tried.trim()}\n`);
      if (a.audience_desire) s.push(`## What They Actually Want\n\n${a.audience_desire.trim()}\n`);
      if (a.audience_objection) s.push(`## Why They Hesitate\n\n${a.audience_objection.trim()}\n`);
      return s.join("\n");
    },
  },
  {
    storageKey: "codify-interview-voice",
    name: "voice.md",
    path: "reference/core/voice.md",
    interviewPath: "/interview/voice",
    previewPath: "/preview/voice",
    buildContent: (a) => {
      const s: string[] = ["# Voice\n"];
      if (a.voice_tone) s.push(`## Tone\n\n${a.voice_tone.trim()}\n`);
      if (a.voice_phrases) s.push(`## Signature Phrases\n\n${a.voice_phrases.trim()}\n`);
      if (a.voice_never) s.push(`## Words We Never Use\n\n${a.voice_never.trim()}\n`);
      if (a.voice_example) s.push(`## Example (Write Like You Talk)\n\n${a.voice_example.trim()}\n`);
      if (a.voice_personality) s.push(`## Personality\n\n${a.voice_personality.trim()}\n`);
      return s.join("\n");
    },
  },
];

export default function AssessmentPage() {
  const [score, setScore] = useState<ContextScore | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [missingFiles, setMissingFiles] = useState<FileConfig[]>([]);

  useEffect(() => {
    const contents: Record<string, string> = {};
    const completed: string[] = [];
    const missing: FileConfig[] = [];

    const files = FILE_CONFIGS.map((config) => {
      const raw = sessionStorage.getItem(config.storageKey);
      const answers = raw ? JSON.parse(raw) : null;

      let content = "";
      if (answers) {
        content = config.buildContent(answers);
        contents[config.name] = content;
        completed.push(config.name);
      } else {
        missing.push(config);
      }

      return {
        name: config.name,
        path: config.path,
        ...(content
          ? { content, lastModified: new Date().toISOString().split("T")[0] }
          : {}),
      };
    });

    setFileContents(contents);
    setCompletedFiles(completed);
    setMissingFiles(missing);
    setScore(calculateContextScore(files));
  }, []);

  if (!score) return null;

  const completedCount = score.files.filter((f) => f.status !== "missing").length;
  const allComplete = missingFiles.length === 0;

  const downloadSingleFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    Object.entries(fileContents).forEach(([name, content]) => {
      downloadSingleFile(name, content);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">❯</span> codify
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#4a9eff]">
            Assessment
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12 flex-1">
        {/* Context Power Score */}
        <div className="bg-[#111111] border border-[#1a1a1a] p-8 mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-5">
            Context Power Score
          </p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-6xl font-bold tabular-nums">
              {score.percentage}
            </span>
            <span className="font-mono text-xl text-[#6b6b6b]">/ 100</span>
          </div>

          <div className="font-mono text-sm text-[#4a9eff] tracking-wider mb-3">
            {terminalBar(score.percentage, 40)}
          </div>

          <p className="text-sm text-[#a0a0a0]">
            {completedCount} of {score.files.length} core files built
          </p>
        </div>

        {/* File breakdown */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Reference Files
        </p>

        <div className="space-y-3 mb-10">
          {score.files.map((file) => {
            const config = STATUS_CONFIG[file.status];
            const percentage = Math.round((file.score / file.maxScore) * 100);
            const fileConfig = FILE_CONFIGS.find((fc) => fc.name === file.name);
            return (
              <div
                key={file.name}
                className="bg-[#111111] border border-[#1a1a1a] px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#22c55e] text-sm">{file.name}</span>
                    {file.status !== "missing" && fileConfig && (
                      <Link
                        href={fileConfig.previewPath}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#4a9eff] hover:text-white transition-colors"
                      >
                        view
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-[#a0a0a0]">
                      {file.score}/{file.maxScore} pts
                    </span>
                    <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-xs text-[#4a9eff] tracking-wider">
                  {terminalBar(percentage, 30)}
                </div>
                {file.wordCount > 0 && (
                  <p className="font-mono text-[10px] text-[#6b6b6b] mt-1">
                    {file.wordCount} words
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Build Next File / Congratulations */}
        {allComplete ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22c55e] mb-4">
              All Files Complete
            </p>
            <div className="bg-[#111111] border border-[#1a1a1a] p-8 mb-10">
              <p className="font-mono text-sm text-white mb-2">
                Your context foundation is built.
              </p>
              <p className="text-sm text-[#a0a0a0] mb-6">
                All 4 core reference files are ready. Every AI tool you use from here
                will produce better output because it knows your soul, offer, audience,
                and voice.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(fileContents).map(([name, content]) => (
                  <button
                    key={name}
                    onClick={() => downloadSingleFile(name, content)}
                    className="font-mono text-xs px-4 py-2 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>

              <button
                onClick={downloadAllFiles}
                className="font-mono text-sm font-bold px-6 py-3 hover:brightness-110 transition-all"
                style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
              >
                Download All Files
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
              Build Next File
            </p>
            <div className="space-y-3 mb-10">
              {missingFiles.map((config) => (
                <div
                  key={config.name}
                  className="bg-[#111111] border border-[#1a1a1a] px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-sm text-[#ef4444]">{config.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b6b6b] ml-3">
                      not started
                    </span>
                  </div>
                  <Link href={config.interviewPath}>
                    <button className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all"
                      style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
                    >
                      Start Interview
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Next steps */}
        {score.recommendations.length > 0 && (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
              Next Steps
            </p>
            <div className="bg-[#111111] border border-[#1a1a1a] p-5 space-y-3 mb-10">
              {score.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[#22c55e] text-sm shrink-0">❯</span>
                  <p className="text-sm text-[#a0a0a0]">{rec}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {completedFiles.map((name) => {
            const config = FILE_CONFIGS.find((fc) => fc.name === name);
            if (!config) return null;
            return (
              <Link key={name} href={config.previewPath}>
                <button className="font-mono text-sm px-6 py-3 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors w-full sm:w-auto">
                  View {name}
                </button>
              </Link>
            );
          })}
          {!allComplete && (
            <Link href={missingFiles[0]?.interviewPath || "/"}>
              <button className="font-mono text-sm font-bold bg-[#22c55e] text-black px-6 py-3 hover:brightness-110 transition-all w-full sm:w-auto">
                Build next file →
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <span className="font-mono text-xs text-[#6b6b6b]">
            context &gt; prompts
          </span>
          <span className="font-mono text-xs text-[#6b6b6b]">
            codify.build
          </span>
        </div>
      </footer>
    </div>
  );
}
