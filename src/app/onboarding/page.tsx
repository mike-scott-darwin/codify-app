"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  soulQuestions,
  offerQuestions,
  audienceQuestions,
  voiceQuestions,
} from "@/lib/interview-data";
import { buildContent } from "@/lib/file-builders";
import type { InterviewQuestion } from "@/lib/types";

const FILE_TYPES = ["soul", "offer", "audience", "voice"] as const;
type FileType = (typeof FILE_TYPES)[number];

const FILE_LABELS: Record<FileType, string> = {
  soul: "Let's define your soul",
  offer: "What do you offer?",
  audience: "Who do you serve?",
  voice: "How do you sound?",
};

const QUESTIONS: Record<FileType, InterviewQuestion[]> = {
  soul: soulQuestions,
  offer: offerQuestions,
  audience: audienceQuestions,
  voice: voiceQuestions,
};

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
          style={{
            backgroundColor:
              s === current ? "#22c55e" : s < current ? "#22c55e" : "#333",
            opacity: s < current ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [githubPat, setGithubPat] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [isNewRepo, setIsNewRepo] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scaffolding, setScaffolding] = useState(false);
  const [scaffoldItems, setScaffoldItems] = useState<string[]>([]);
  const [currentFileType, setCurrentFileType] = useState<FileType>("soul");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({
    soul: {},
    offer: {},
    audience: {},
    voice: {},
  });
  const [committedFiles, setCommittedFiles] = useState<string[]>([]);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const [committing, setCommitting] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Step 2: auto-scaffold on mount
  useEffect(() => {
    if (step !== 2) return;
    setScaffolding(true);
    setScaffoldItems([]);

    const dirs = ["reference/core/", "research/", "decisions/", "outputs/"];

    const runScaffold = async () => {
      try {
        const res = await fetch("/api/github/init", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to scaffold repository");
          setScaffolding(false);
          return;
        }
      } catch {
        setError("Failed to reach scaffold API");
        setScaffolding(false);
        return;
      }

      // Stagger the visual checklist
      for (let i = 0; i < dirs.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
        setScaffoldItems((prev) => [...prev, dirs[i]]);
      }

      // Auto-advance after a pause
      await new Promise((r) => setTimeout(r, 1500));
      setScaffolding(false);
      transitionTo(3);
    };

    runScaffold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const transitionTo = useCallback((nextStep: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setError(null);
      setFadeIn(true);
    }, 200);
  }, []);

  // Step 1: Connect
  const handleConnect = async () => {
    setError(null);
    setConnecting(true);

    try {
      if (isNewRepo) {
        // Create new repo first
        const createRes = await fetch("/api/github/create-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pat: githubPat, repoName }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) {
          setError(createData.error || "Failed to create repository");
          setConnecting(false);
          return;
        }
        setRepoOwner(createData.owner);
      } else {
        // Save config for existing repo
        const configRes = await fetch("/api/github/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: githubPat,
            owner: repoOwner,
            repo: repoName,
          }),
        });
        const configData = await configRes.json();
        if (!configRes.ok) {
          setError(configData.error || "Failed to connect");
          setConnecting(false);
          return;
        }
      }

      setConnecting(false);
      transitionTo(2);
    } catch {
      setError("Network error. Please try again.");
      setConnecting(false);
    }
  };

  // Step 3: Interview
  const questions = QUESTIONS[currentFileType];
  const question = questions[currentQuestionIndex];
  const currentAnswer = answers[currentFileType]?.[question?.id] || "";
  const fileTypeIndex = FILE_TYPES.indexOf(currentFileType);

  const commitFile = async (fileType: FileType) => {
    setCommitting(true);
    setCommitMessage(null);

    const fileAnswers = answers[fileType];
    const content = buildContent(fileType, fileAnswers);

    try {
      const res = await fetch("/api/github/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType,
          content,
          message: `[codify] Initialize ${fileType}.md via onboarding`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to commit file");
        setCommitting(false);
        return;
      }

      setCommitMessage(`Committed ${fileType}.md`);
      setCommittedFiles((prev) => [...prev, fileType]);

      await new Promise((r) => setTimeout(r, 800));
      setCommitMessage(null);
      advanceFileType();
    } catch {
      setError("Failed to commit file");
    }
    setCommitting(false);
  };

  const advanceFileType = () => {
    const nextIndex = FILE_TYPES.indexOf(currentFileType) + 1;
    if (nextIndex >= FILE_TYPES.length) {
      transitionTo(4);
    } else {
      setCurrentFileType(FILE_TYPES[nextIndex]);
      setCurrentQuestionIndex(0);
      setFadeIn(false);
      setTimeout(() => setFadeIn(true), 100);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestionIndex((i) => i + 1);
        setFadeIn(true);
      }, 150);
    } else {
      // Last question — commit
      commitFile(currentFileType);
    }
  };

  const handleSkipQuestion = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentFileType]: { ...prev[currentFileType], [question.id]: "" },
    }));
    if (currentQuestionIndex < questions.length - 1) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestionIndex((i) => i + 1);
        setFadeIn(true);
      }, 150);
    } else {
      commitFile(currentFileType);
    }
  };

  const handleSkipFile = async () => {
    // Commit minimal content
    setCommitting(true);
    const minimalContent = `# ${currentFileType.charAt(0).toUpperCase() + currentFileType.slice(1)}\n\n_To be completed._\n`;

    try {
      const res = await fetch("/api/github/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType: currentFileType,
          content: minimalContent,
          message: `[codify] Scaffold ${currentFileType}.md (skipped)`,
        }),
      });

      if (res.ok) {
        setSkippedFiles((prev) => [...prev, currentFileType]);
        setCommitMessage(`Scaffolded ${currentFileType}.md`);
        await new Promise((r) => setTimeout(r, 800));
        setCommitMessage(null);
      }
    } catch {
      // Continue even if commit fails
    }

    setCommitting(false);
    advanceFileType();
  };

  if (authLoading) {
    return (
      <span className="font-mono text-sm text-[#6b6b6b] animate-pulse">
        Loading...
      </span>
    );
  }

  if (!user) return null;

  return (
    <div
      className={`w-full max-w-lg font-mono transition-opacity duration-200 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <StepDots current={step} />

      {/* Step 1: Connect GitHub */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Connect your repo</h1>
          <p className="text-sm text-[#a0a0a0] mb-8">
            Your business lives in GitHub. Everything you build here writes
            directly to your repo.
          </p>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-[#1a1a1a]">
            <button
              onClick={() => setIsNewRepo(false)}
              className={`px-4 py-2 text-sm transition-colors ${
                !isNewRepo
                  ? "text-[#22c55e] border-b-2 border-[#22c55e]"
                  : "text-[#6b6b6b] hover:text-[#a0a0a0]"
              }`}
            >
              Existing repo
            </button>
            <button
              onClick={() => setIsNewRepo(true)}
              className={`px-4 py-2 text-sm transition-colors ${
                isNewRepo
                  ? "text-[#22c55e] border-b-2 border-[#22c55e]"
                  : "text-[#6b6b6b] hover:text-[#a0a0a0]"
              }`}
            >
              New repo
            </button>
          </div>

          {/* PAT input */}
          <div className="mb-4">
            <label className="block text-xs text-[#6b6b6b] mb-1.5">
              Personal Access Token
            </label>
            <input
              type="password"
              value={githubPat}
              onChange={(e) => setGithubPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#111111] border border-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#4a9eff] transition-colors"
            />
            <p className="text-[10px] text-[#6b6b6b] mt-1.5">
              Needs <span className="text-[#a0a0a0]">repo</span> scope.{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Codify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a9eff] hover:underline"
              >
                Create a token
              </a>
            </p>
          </div>

          {isNewRepo ? (
            <div className="mb-6">
              <label className="block text-xs text-[#6b6b6b] mb-1.5">
                Repository name
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-business"
                className="w-full bg-[#111111] border border-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#4a9eff] transition-colors"
              />
              <p className="text-[10px] text-[#6b6b6b] mt-1.5">
                Will be created as a private repo under your account
              </p>
            </div>
          ) : (
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <label className="block text-xs text-[#6b6b6b] mb-1.5">
                  Owner
                </label>
                <input
                  type="text"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value)}
                  placeholder="username"
                  className="w-full bg-[#111111] border border-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#4a9eff] transition-colors"
                />
              </div>
              <div className="flex items-end pb-2.5 text-[#6b6b6b]">/</div>
              <div className="flex-1">
                <label className="block text-xs text-[#6b6b6b] mb-1.5">
                  Repo
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-business"
                  className="w-full bg-[#111111] border border-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#4a9eff] transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-[#ef4444] mb-4 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={
              connecting ||
              !githubPat ||
              !repoName ||
              (!isNewRepo && !repoOwner)
            }
            className="w-full bg-[#22c55e] text-black font-bold text-sm py-3 hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {connecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      )}

      {/* Step 2: Scaffold */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Building your workspace</h1>
          <p className="text-sm text-[#a0a0a0] mb-8">
            Setting up your repository structure...
          </p>

          <div className="space-y-3">
            {["reference/core/", "research/", "decisions/", "outputs/"].map(
              (dir) => {
                const visible = scaffoldItems.includes(dir);
                return (
                  <div
                    key={dir}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <span className="text-[#22c55e]">&#10003;</span>
                    <span className="text-sm text-[#a0a0a0]">{dir}</span>
                  </div>
                );
              }
            )}
          </div>

          {error && (
            <div className="text-xs text-[#ef4444] mt-6 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Interview */}
      {step === 3 && question && (
        <div className="max-w-md mx-auto">
          {/* File progress */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">
              {FILE_LABELS[currentFileType]}
            </h1>
            <span className="text-xs text-[#6b6b6b]">
              File {fileTypeIndex + 1} of {FILE_TYPES.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-[#1a1a1a] mb-8">
            <div
              className="h-full bg-[#22c55e] transition-all duration-300"
              style={{
                width: `${
                  ((fileTypeIndex * questions.length + currentQuestionIndex + 1) /
                    (FILE_TYPES.length * questions.length)) *
                  100
                }%`,
              }}
            />
          </div>

          {/* Commit message overlay */}
          {commitMessage && (
            <div className="flex items-center gap-2 mb-4 text-sm text-[#22c55e] animate-pulse">
              <span>&#10003;</span>
              <span>{commitMessage}</span>
            </div>
          )}

          {!committing && !commitMessage && (
            <>
              {/* Section label */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#22c55e]">&#10095;</span>
                <span
                  className="text-xs font-medium uppercase text-[#4a9eff]"
                  style={{ letterSpacing: "0.2em" }}
                >
                  {question.section}
                </span>
              </div>

              {/* Question */}
              <h2 className="text-lg font-bold mb-2">{question.question}</h2>
              <p className="text-xs text-[#a0a0a0] mb-6">
                {question.helpText}
              </p>

              {/* Answer */}
              <textarea
                value={currentAnswer}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentFileType]: {
                      ...prev[currentFileType],
                      [question.id]: e.target.value,
                    },
                  }))
                }
                placeholder={question.placeholder}
                autoFocus
                className="w-full resize-none text-sm leading-relaxed text-white placeholder:text-[#6b6b6b] focus:outline-none focus:ring-1 focus:ring-[#4a9eff]"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #1a1a1a",
                  padding: "16px",
                  minHeight: "140px",
                }}
              />

              {/* Question counter */}
              <div className="flex items-center justify-between mt-2 mb-6">
                <span className="text-[10px] text-[#6b6b6b]">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                {currentAnswer.length > 0 && (
                  <span className="text-[10px] text-[#6b6b6b]">
                    {currentAnswer.split(/\s+/).filter(Boolean).length} words
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkipQuestion}
                  className="text-xs text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                >
                  Skip
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkipFile}
                    className="text-xs px-3 py-1.5 border border-[#333] text-[#a0a0a0] hover:text-white transition-colors"
                  >
                    Skip this file
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-[#22c55e] text-black font-bold text-sm px-5 py-2.5 hover:brightness-110 transition-all"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Commit File"
                      : "Next"}
                  </button>
                </div>
              </div>
            </>
          )}

          {committing && !commitMessage && (
            <div className="flex items-center gap-2 text-sm text-[#a0a0a0] animate-pulse">
              <span>Writing to repo...</span>
            </div>
          )}

          {error && (
            <div className="text-xs text-[#ef4444] mt-4 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Your workspace is ready
          </h1>
          <p className="text-sm text-[#a0a0a0] mb-8">
            Your reference files are committed to GitHub.
          </p>

          {/* Repo tree */}
          <div className="bg-[#111111] border border-[#1a1a1a] p-6 mb-8 text-sm">
            <div className="text-[#a0a0a0]">
              <div className="text-white mb-2">
                {repoOwner}/{repoName}/
              </div>
              <div className="ml-4 space-y-1">
                <div>
                  <span className="text-[#6b6b6b]">&#9500;&#9472;&#9472;</span>{" "}
                  reference/core/
                </div>
                {FILE_TYPES.map((ft, i) => {
                  const isCommitted = committedFiles.includes(ft);
                  const isSkipped = skippedFiles.includes(ft);
                  const isLast = i === FILE_TYPES.length - 1;
                  return (
                    <div key={ft} className="ml-8">
                      <span className="text-[#6b6b6b]">
                        {isLast ? "&#9492;&#9472;&#9472;" : "&#9500;&#9472;&#9472;"}
                      </span>{" "}
                      {ft}.md{" "}
                      {isCommitted && (
                        <span className="text-[#22c55e]">&#10003;</span>
                      )}
                      {isSkipped && (
                        <span className="text-[#f59e0b]">&#9675;</span>
                      )}
                    </div>
                  );
                })}
                <div>
                  <span className="text-[#6b6b6b]">&#9500;&#9472;&#9472;</span>{" "}
                  research/
                </div>
                <div>
                  <span className="text-[#6b6b6b]">&#9500;&#9472;&#9472;</span>{" "}
                  decisions/
                </div>
                <div>
                  <span className="text-[#6b6b6b]">&#9492;&#9472;&#9472;</span>{" "}
                  outputs/
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-xs text-[#6b6b6b] mb-8">
            <div className="flex items-center gap-1.5">
              <span className="text-[#22c55e]">&#10003;</span> Committed
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#f59e0b]">&#9675;</span> Skipped
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-[#22c55e] text-black font-bold text-sm py-3 hover:brightness-110 transition-all"
          >
            Enter Dashboard &#8594;
          </button>
        </div>
      )}
    </div>
  );
}
