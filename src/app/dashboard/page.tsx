"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, ArrowRight, AlertCircle, CheckCircle2, 
  Clock, Sparkles, BarChart3, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { calculateContextScore } from "@/lib/scoring";
import type { ContextScore, ReferenceFile } from "@/lib/types";

// Demo data — replace with GitHub API later
const DEMO_FILES = [
  {
    name: "soul.md",
    path: "reference/core/soul.md",
    content: `# Soul\n\n## Origin\nI started coaching because I saw too many talented people stuck in jobs that drained them.\n\n## Core Belief\nEveryone has a zone of genius. Most people just need permission and a framework to find it.`,
    lastModified: "2026-03-10",
  },
  {
    name: "offer.md",
    path: "reference/core/offer.md",
    content: `# Offer\n\n## What I Sell\n12-week coaching program for mid-career professionals who want to transition to coaching.\n\n## Price\n$2,500 one-time\n\n## Delivery\nWeekly 1:1 calls + Skool community access`,
    lastModified: "2026-03-12",
  },
  {
    name: "audience.md",
    path: "reference/core/audience.md",
  },
  {
    name: "voice.md",
    path: "reference/core/voice.md",
  },
];

export default function DashboardPage() {
  const [score, setScore] = useState<ContextScore | null>(null);

  useEffect(() => {
    const result = calculateContextScore(DEMO_FILES);
    setScore(result);
  }, []);

  if (!score) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <span className="text-xl font-bold tracking-tight">Codify</span>
          <div className="w-16" />
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Context Power Score */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Context Power Score
          </p>
          <div className="mb-3 text-7xl font-bold tracking-tight">
            {score.percentage}
            <span className="text-3xl text-muted-foreground">%</span>
          </div>
          <Badge variant={score.percentage >= 60 ? "default" : "secondary"} className="text-sm">
            Grade {score.grade}
          </Badge>
          <div className="mx-auto mt-4 max-w-md">
            <Progress value={score.percentage} className="h-3" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {score.total} / {score.maxTotal} points across {score.files.length} core files
          </p>
        </div>

        <Separator className="mb-10" />

        {/* File Cards */}
        <h2 className="mb-6 text-lg font-semibold flex items-center gap-2">
          <FileText className="size-5" />
          Reference Files
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {score.files.map((file) => (
            <FileCard key={file.name} file={file} />
          ))}
        </div>

        <Separator className="my-10" />

        {/* Recommendations */}
        {score.recommendations.length > 0 && (
          <div>
            <h2 className="mb-6 text-lg font-semibold flex items-center gap-2">
              <Sparkles className="size-5" />
              Recommended Next Steps
            </h2>
            <div className="space-y-3">
              {score.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-4">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm">{rec}</p>
                  </div>
                  <Link href={`/interview/soul`}>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      Start
                      <ArrowRight className="ml-1 size-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: ReferenceFile }) {
  const statusConfig = {
    missing: { color: "text-red-400", bg: "bg-red-500/10", icon: AlertCircle, label: "Missing" },
    skeleton: { color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock, label: "Skeleton" },
    draft: { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: FileText, label: "Draft" },
    solid: { color: "text-blue-400", bg: "bg-blue-500/10", icon: BarChart3, label: "Solid" },
    strong: { color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle2, label: "Strong" },
  };

  const config = statusConfig[file.status];
  const Icon = config.icon;
  const percentage = Math.round((file.score / file.maxScore) * 100);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{file.name}</CardTitle>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
            <Icon className="size-3" />
            {config.label}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{file.wordCount} words</span>
          <span className="font-medium">{file.score}/{file.maxScore} pts</span>
        </div>
        <Progress value={percentage} className="h-2" />
        {file.lastModified && (
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated: {file.lastModified}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
