"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { loadAllAnswers } from "@/lib/db";
import { calculateContextScore } from "@/lib/scoring";
import type { ContextScore, ReferenceFile } from "@/lib/types";

const STATUS_CONFIG: Record<ReferenceFile["status"], { color: string; label: string }> = {
  missing: { color: "#ef4444", label: "NOT STARTED" },
  skeleton: { color: "#f59e0b", label: "SKELETON" },
  draft: { color: "#f59e0b", label: "DRAFT" },
  solid: { color: "#4a9eff", label: "SOLID" },
  strong: { color: "#22c55e", label: "STRONG" },
};

interface FileConfig {
  key: string;
  storageKey: string;
  name: string;
  path: string;
  interviewPath: string;
  previewPath: string;
  description: string;
  buildContent: (a: Record<string, string>) => string;
}

const FILE_CONFIGS: FileConfig[] = [
  {
    key: "soul",
    storageKey: "codify-interview-soul",
    name: "soul.md",
    path: "reference/core/soul.md",
    interviewPath: "/interview/soul",
    previewPath: "/preview/soul",
    description: "Why you exist. Your origin, beliefs, and mission.",
    buildContent: (a) => {
      const s: string[] = ["# Soul\n"];
      if (a.origin) s.push("## Origin Story\n\n" + a.origin.trim() + "\n");
      if (a.problem) s.push("## The Problem We Solve\n\n" + a.problem.trim() + "\n");
      if (a.belief) s.push("## Core Belief\n\n" + a.belief.trim() + "\n");
      if (a.transformation) s.push("## The Transformation\n\n" + a.transformation.trim() + "\n");
      if (a.why_you) s.push("## Why Us\n\n" + a.why_you.trim() + "\n");
      if (a.values) s.push("## Non-Negotiables\n\n" + a.values.trim() + "\n");
      if (a.mission) s.push("## The Mission\n\n" + a.mission.trim() + "\n");
      return s.join("\n");
    },
  },
  {
    key: "offer",
    storageKey: "codify-interview-offer",
    name: "offer.md",
    path: "reference/core/offer.md",
    interviewPath: "/interview/offer",
    previewPath: "/preview/offer",
    description: "What you sell. Your offer, pricing, and mechanism.",
    buildContent: (a) => {
      const s: string[] = ["# Offer\n"];
      if (a.offer_name) s.push("## The Offer\n\n" + a.offer_name.trim() + "\n");
      if (a.offer_outcome) s.push("## The Outcome\n\n" + a.offer_outcome.trim() + "\n");
      if (a.offer_price) s.push("## Price & Model\n\n" + a.offer_price.trim() + "\n");
      if (a.offer_audience) s.push("## Who It's For\n\n" + a.offer_audience.trim() + "\n");
      if (a.offer_differentiator) s.push("## Why This vs Alternatives\n\n" + a.offer_differentiator.trim() + "\n");
      return s.join("\n");
    },
  },
  {
    key: "audience",
    storageKey: "codify-interview-audience",
    name: "audience.md",
    path: "reference/core/audience.md",
    interviewPath: "/interview/audience",
    previewPath: "/preview/audience",
    description: "Who you serve. Their pain, desires, and language.",
    buildContent: (a) => {
      const s: string[] = ["# Audience\n"];
      if (a.audience_who) s.push("## Who They Are\n\n" + a.audience_who.trim() + "\n");
      if (a.audience_struggle) s.push("## What They're Struggling With\n\n" + a.audience_struggle.trim() + "\n");
      if (a.audience_tried) s.push("## What They've Already Tried\n\n" + a.audience_tried.trim() + "\n");
      if (a.audience_desire) s.push("## What They Actually Want\n\n" + a.audience_desire.trim() + "\n");
      if (a.audience_objection) s.push("## Why They Hesitate\n\n" + a.audience_objection.trim() + "\n");
      return s.join("\n");
    },
  },
  {
    key: "voice",
    storageKey: "codify-interview-voice",
    name: "voice.md",
    path: "reference/core/voice.md",
    interviewPath: "/interview/voice",
    previewPath: "/preview/voice",
    description: "How you sound. Tone, phrases, and personality.",
    buildContent: (a) => {
      const s: string[] = ["# Voice\n"];
      if (a.voice_tone) s.push("## Tone\n\n" + a.voice_tone.trim() + "\n");
      if (a.voice_phrases) s.push("## Signature Phrases\n\n" + a.voice_phrases.trim() + "\n");
      if (a.voice_never) s.push("## Words We Never Use\n\n" + a.voice_never.trim() + "\n");
      if (a.voice_example) s.push("## Example (Write Like You Talk)\n\n" + a.voice_example.trim() + "\n");
      if (a.voice_personality) s.push("## Personality\n\n" + a.voice_personality.trim() + "\n");
      return s.join("\n");
    },
  },
];

function terminalBar(percentage: number, length: number = 30): string {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

export default function FilesPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<ContextScore | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  const [ghSyncStatus, setGhSyncStatus] = useState<{ synced: boolean; repoUrl?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      if (user) await loadAllAnswers();

      let ghFiles: Record<string, string> | null = null;
      let ghRepoUrl: string | undefined;

      // Try to load from GitHub first
      try {
        const configRes = await fetch("/api/github/config");
        const configData = await configRes.json();
        if (configData.config && configData.config.connected) {
          ghRepoUrl = "https://github.com/" + configData.config.owner + "/" + configData.config.repo;
          const filesRes = await fetch("/api/github/files");
          const filesData = await filesRes.json();
          if (filesData.files && Object.keys(filesData.files).length > 0) {
            ghFiles = filesData.files;
          }
        }
      } catch {
        // GitHub load failed, fall back to sessionStorage
      }

      const contents: Record<string, string> = {};
      const files = FILE_CONFIGS.map((config) => {
        // GitHub is source of truth, then sessionStorage
        let fileContent: string | undefined;
        if (ghFiles && ghFiles[config.key]) {
          fileContent = ghFiles[config.key];
        } else {
          const raw = sessionStorage.getItem(config.storageKey);
          const enriched = sessionStorage.getItem("codify-enriched-" + config.key);
          const answers = raw ? JSON.parse(raw) : null;
          fileContent = enriched || (answers ? config.buildContent(answers) : undefined);
        }

        if (fileContent) contents[config.key] = fileContent;

        return {
          name: config.name,
          path: config.path,
          ...(fileContent ? { content: fileContent, lastModified: new Date().toISOString().split("T")[0] } : {}),
        };
      });

      // Cache GitHub files in sessionStorage for other pages
      if (ghFiles) {
        for (const [key, val] of Object.entries(ghFiles)) {
          sessionStorage.setItem("codify-enriched-" + key, val);
        }
        setGhSyncStatus({ synced: true, repoUrl: ghRepoUrl });
      } else if (ghRepoUrl) {
        setGhSyncStatus({ synced: false, repoUrl: ghRepoUrl });
      } else {
        setGhSyncStatus(null);
      }

      setFileContents(contents);
      setScore(calculateContextScore(files));
    };
    init();
  }, [user]);

  if (!score) return null;

  const downloadFile = (key: string) => {
    const content = fileContents[key];
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = key + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    Object.keys(fileContents).forEach(downloadFile);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono text-xl font-bold mb-1">Reference Files</h1>
          <p className="text-sm text-[#6b6b6b]">
            Your business context. Each file makes every AI output better.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/agents?launch=congruence_audit"
            className="font-mono text-xs px-4 py-2 border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black transition-colors"
          >
            Audit My Files
          </Link>
          {Object.keys(fileContents).length > 0 && (
            <button
              onClick={downloadAll}
              className="font-mono text-xs px-4 py-2 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors"
            >
              Download All
            </button>
          )}
        </div>
      </div>

      {/* Context Power Score */}
      <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-mono text-4xl font-bold tabular-nums">{score.percentage}</span>
          <span className="font-mono text-sm text-[#6b6b6b]">/ 100</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] ml-4">
            Context Power Score
          </span>
        </div>
        <div className="font-mono text-xs text-[#4a9eff] tracking-wider">
          {terminalBar(score.percentage)}
        </div>
      </div>

      {/* Sync Status */}
      {ghSyncStatus !== null && (
        <div className={"font-mono text-xs px-4 py-2 mb-4 border " + (ghSyncStatus.synced ? "border-[#22c55e]/30 text-[#22c55e]" : "border-[#f59e0b]/30 text-[#f59e0b]")}>
          {ghSyncStatus.synced ? (
            <>Synced with <a href={ghSyncStatus.repoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">{ghSyncStatus.repoUrl?.replace("https://github.com/", "")}</a></>
          ) : (
            "Local only — no files found in connected repo"
          )}
        </div>
      )}

      {/* File Cards */}
      <div className="space-y-4">
        {FILE_CONFIGS.map((config) => {
          const fileScore = score.files.find((f) => f.name === config.name);
          if (!fileScore) return null;
          const cfg = STATUS_CONFIG[fileScore.status];
          const percentage = Math.round((fileScore.score / fileScore.maxScore) * 100);
          const hasContent = !!fileContents[config.key];

          return (
            <div key={config.key} className="bg-[#111111] border border-[#1a1a1a] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-white font-bold">
                      {config.name}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.15em]"
                      style={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b6b6b]">{config.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-[#a0a0a0]">
                    {fileScore.score}/{fileScore.maxScore}
                  </span>
                  {fileScore.wordCount > 0 && (
                    <p className="font-mono text-[10px] text-[#6b6b6b]">
                      {fileScore.wordCount} words
                    </p>
                  )}
                </div>
              </div>

              <div className="font-mono text-xs text-[#4a9eff] tracking-wider mb-4">
                {terminalBar(percentage, 40)}
              </div>

              <div className="flex gap-2">
                {hasContent ? (
                  <>
                    <Link
                      href={config.previewPath}
                      className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={"/dashboard/files/" + config.key + "/edit"}
                      className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white hover:border-[#333] transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={config.interviewPath}
                      className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                    >
                      Re-interview
                    </Link>
                    <button
                      onClick={() => downloadFile(config.key)}
                      className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                    >
                      Download
                    </button>
                  </>
                ) : (
                  <Link
                    href={config.interviewPath}
                    className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all"
                    style={{ backgroundColor: "#22c55e", color: "#000", borderRadius: 0 }}
                  >
                    Start Interview →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compounding nudge */}
      {Object.keys(fileContents).length >= 2 && (
        <div className="bg-[#111111] border border-[#8b5cf6] border-dashed p-4 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6] mb-1">
                Next in the loop
              </p>
              <p className="font-mono text-sm text-[#a0a0a0]">
                Research a topic to sharpen these files further
              </p>
            </div>
            <Link
              href="/dashboard/research"
              className="font-mono text-xs px-4 py-2 border border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-colors"
            >
              Start Research →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
