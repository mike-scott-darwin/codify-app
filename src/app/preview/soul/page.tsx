"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, Check, Download, BarChart3 } from "lucide-react";
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

export default function SoulPreviewPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"split" | "raw" | "file">("split");

  useEffect(() => {
    const stored = sessionStorage.getItem("codify-interview-soul");
    if (stored) {
      setAnswers(JSON.parse(stored));
    }
  }, []);

  const soulFile = generateSoulFile(answers);
  const wordCount = soulFile.split(/\s+/).filter(Boolean).length;
  const answeredCount = Object.values(answers).filter((a) => a.trim().length > 0).length;

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

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/interview/soul"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Interview
          </Link>
          <span className="text-xl font-bold tracking-tight">Codify</span>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart3 className="size-3.5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Soul File</h1>
            <p className="text-sm text-muted-foreground">
              {answeredCount} questions answered &middot; {wordCount} words generated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border/60">
              <button
                onClick={() => setView("split")}
                className={`px-3 py-1.5 text-xs font-medium ${view === "split" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"} rounded-l-lg`}
              >
                Split
              </button>
              <button
                onClick={() => setView("raw")}
                className={`px-3 py-1.5 text-xs font-medium ${view === "raw" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Answers
              </button>
              <button
                onClick={() => setView("file")}
                className={`px-3 py-1.5 text-xs font-medium ${view === "file" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"} rounded-r-lg`}
              >
                File
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1.5">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" onClick={downloadFile} className="gap-1.5">
              <Download className="size-3.5" />
              Download soul.md
            </Button>
          </div>
        </div>

        {/* Content */}
        {view === "split" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Raw answers */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="secondary">Your Answers</Badge>
              </div>
              <Card className="border-border/60 p-6">
                <div className="space-y-6">
                  {soulQuestions.map((q) => {
                    const answer = answers[q.id];
                    if (!answer) return null;
                    return (
                      <div key={q.id}>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {q.section}
                        </p>
                        <p className="text-sm leading-relaxed">{answer}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Generated file */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge>soul.md</Badge>
              </div>
              <Card className="border-border/60 p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-muted-foreground">
                  {soulFile}
                </pre>
              </Card>
            </div>
          </div>
        ) : view === "raw" ? (
          <Card className="border-border/60 p-6">
            <div className="space-y-6">
              {soulQuestions.map((q) => {
                const answer = answers[q.id];
                if (!answer) return null;
                return (
                  <div key={q.id}>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {q.section}
                    </p>
                    <p className="text-sm font-medium mb-1">{q.question}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card className="border-border/60 p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {soulFile}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
