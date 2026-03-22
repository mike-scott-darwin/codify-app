"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const FILE_INTROS: Record<FileType, { title: string; subtitle: string }> = {
  soul: {
    title: "Let's capture what makes you different",
    subtitle: "Your experience, your frameworks, your principles — the knowledge that took decades to build.",
  },
  offer: {
    title: "What do you do for your clients?",
    subtitle: "How you help, who you help, and the results you deliver.",
  },
  audience: {
    title: "Who do you do your best work for?",
    subtitle: "The real people you serve — their problems, their language, their stakes.",
  },
  voice: {
    title: "How do you show up?",
    subtitle: "Your tone, your phrases, your personality — so AI sounds like you, not like everyone else.",
  },
};

const QUESTIONS: Record<FileType, InterviewQuestion[]> = {
  soul: soulQuestions,
  offer: offerQuestions,
  audience: audienceQuestions,
  voice: voiceQuestions,
};

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 justify-center">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
          style={{
            backgroundColor:
              s <= current ? "#22c55e" : "#333",
            opacity: s < current ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  );
}

function GithubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function PulsingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

function OnboardingContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(2);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [creatingStatus, setCreatingStatus] = useState("");
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
  const [saving, setSaving] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Auto-advance — always start at step 2 since GitHub OAuth handles step 1
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const messages: Record<string, string> = {
        missing_params: "Something went wrong connecting to GitHub. Please try again.",
        invalid_state: "Connection expired. Please try again.",
        token_exchange_failed: "Could not complete the connection. Please try again.",
        token_denied: "GitHub access was denied. Please try again and approve access.",
        user_fetch_failed: "Could not verify your GitHub account. Please try again.",
        save_failed: "Could not save your connection. Please try again.",
      };
      setError(messages[oauthError] || "Something went wrong. Please try again.");
    }
  }, [searchParams]);

  const transitionTo = useCallback((nextStep: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setError(null);
      setFadeIn(true);
    }, 200);
  }, []);

  // Slugify workspace name
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleWorkspaceNameChange = (value: string) => {
    setWorkspaceName(slugify(value));
  };

  // Handle file upload to enhance answer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const text = await file.text();
      // Append file content to current answer
      const existing = answers[currentFileType]?.[question?.id] || "";
      const separator = existing ? "\n\n--- Uploaded from " + file.name + " ---\n\n" : "";
      setAnswers((prev) => ({
        ...prev,
        [currentFileType]: {
          ...prev[currentFileType],
          [question.id]: existing + separator + text.slice(0, 5000),
        },
      }));
    } catch {
      setError("Could not read file. Try a text file (.txt, .md, .doc).");
    }
    setUploading(false);
    // Reset the input
    e.target.value = "";
  };

  // Step 2: Create workspace
  const handleCreateWorkspace = async () => {
    if (!workspaceName) return;
    setError(null);
    setCreating(true);

    try {
      setCreatingStatus("Setting up your business folder...");
      const createRes = await fetch("/api/github/create-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoName: workspaceName }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error || "Failed to create workspace");
        setCreating(false);
        setCreatingStatus("");
        return;
      }

      setCreatingStatus("Creating your files...");
      const initRes = await fetch("/api/github/init", { method: "POST" });
      const initData = await initRes.json();
      if (!initRes.ok) {
        setError(initData.error || "Failed to set up workspace");
        setCreating(false);
        setCreatingStatus("");
        return;
      }

      setCreatingStatus("workspace_created");
      // Show the file tree for 4 seconds before moving on
      await new Promise((r) => setTimeout(r, 4000));
      setCreating(false);
      setCreatingStatus("");
      transitionTo(3);
    } catch {
      setError("Something went wrong. Please try again.");
      setCreating(false);
      setCreatingStatus("");
    }
  };

  // Step 3: Interview
  const questions = QUESTIONS[currentFileType];
  const question = questions[currentQuestionIndex];
  const currentAnswer = answers[currentFileType]?.[question?.id] || "";
  const fileTypeIndex = FILE_TYPES.indexOf(currentFileType);

  const totalQuestions = FILE_TYPES.reduce((sum, ft) => sum + QUESTIONS[ft].length, 0);
  const completedQuestions =
    FILE_TYPES.slice(0, fileTypeIndex).reduce((sum, ft) => sum + QUESTIONS[ft].length, 0) +
    currentQuestionIndex;

  const saveFile = async (fileType: FileType) => {
    setSaving(true);
    setShowCheckmark(false);

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
        setError(data.error || "Failed to save file");
        setSaving(false);
        return;
      }

      setCommittedFiles((prev) => [...prev, fileType]);
      setShowCheckmark(true);
      await new Promise((r) => setTimeout(r, 600));
      setShowCheckmark(false);
      advanceFileType();
    } catch {
      setError("Failed to save file");
    }
    setSaving(false);
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
      saveFile(currentFileType);
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
      saveFile(currentFileType);
    }
  };

  const handleSkipFile = async () => {
    setSaving(true);
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
      }
    } catch {
      // Continue even if save fails
    }

    setSaving(false);
    advanceFileType();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PulsingDots />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className={`w-full max-w-md font-mono transition-opacity duration-200 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <StepDots current={step} />

        {/* Step 1: Welcome + Connect */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">
              Let&apos;s build your business brain
            </h1>
            <p className="text-sm text-[#a0a0a0] mb-10 leading-relaxed">
              Everything you create here lives in a secure workspace
              that gets smarter over time.
            </p>

            {error && (
              <div className="text-xs text-[#ef4444] mb-6 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5 text-left">
                {error}
              </div>
            )}

            <a
              href="/api/auth/github"
              className="inline-flex items-center justify-center gap-3 w-full bg-[#22c55e] text-black font-bold text-sm py-3.5 hover:brightness-110 transition-all"
            >
              <GithubIcon />
              Connect with GitHub
            </a>

            <p className="text-[11px] text-[#6b6b6b] mt-4 leading-relaxed">
              We&apos;ll create a private workspace to store your business files.
            </p>
          </div>
        )}

        {/* Step 2: Name Your Workspace */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-2 text-center">
              Name your business
            </h1>
            <p className="text-sm text-[#a0a0a0] mb-8 text-center">
              This becomes the name of your secure folder where all your business files are stored.
            </p>

            <div className="mb-6">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                placeholder="e.g. janes-bakery"
                autoFocus
                disabled={creating}
                className="w-full bg-[#111111] border border-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#22c55e] transition-colors disabled:opacity-50"
              />
              {workspaceName && (
                <p className="text-[11px] text-[#6b6b6b] mt-2">
                  {workspaceName}
                </p>
              )}
            </div>

            {creating && creatingStatus && creatingStatus !== "workspace_created" && (
              <div className="flex items-center gap-3 mb-6 text-sm text-[#a0a0a0]">
                <PulsingDots />
                <span>{creatingStatus}</span>
              </div>
            )}

            {creating && creatingStatus === "workspace_created" && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#22c55e] text-lg">&#10003;</span>
                  <span className="text-sm text-[#22c55e] font-bold">Workspace created</span>
                </div>
                <div className="bg-[#111111] border border-[#1a1a1a] p-4 text-xs leading-6">
                  <div className="text-[#4a9eff] mb-1">{workspaceName}/</div>
                  <div className="ml-4">
                    <div className="text-[#8b5cf6]">reference/</div>
                    <div className="ml-4">
                      <div className="text-[#6b6b6b]">core/</div>
                      <div className="ml-4 space-y-0.5">
                        <div className="flex items-center gap-2"><span className="text-[#22c55e] animate-pulse" style={{animationDelay: '0ms'}}>+</span> <span className="text-white">soul.md</span> <span className="text-[#6b6b6b] text-[10px]">why you exist</span></div>
                        <div className="flex items-center gap-2"><span className="text-[#22c55e] animate-pulse" style={{animationDelay: '200ms'}}>+</span> <span className="text-white">offer.md</span> <span className="text-[#6b6b6b] text-[10px]">what you sell</span></div>
                        <div className="flex items-center gap-2"><span className="text-[#22c55e] animate-pulse" style={{animationDelay: '400ms'}}>+</span> <span className="text-white">audience.md</span> <span className="text-[#6b6b6b] text-[10px]">who you serve</span></div>
                        <div className="flex items-center gap-2"><span className="text-[#22c55e] animate-pulse" style={{animationDelay: '600ms'}}>+</span> <span className="text-white">voice.md</span> <span className="text-[#6b6b6b] text-[10px]">how you sound</span></div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-[#6b6b6b]">research/</div>
                      <div className="text-[#6b6b6b]">decisions/</div>
                      <div className="text-[#6b6b6b]">outputs/</div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[#6b6b6b] mt-3 text-center">These files get smarter as you use Codify</p>
              </div>
            )}

            {error && (
              <div className="text-xs text-[#ef4444] mb-4 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5">
                {error}
              </div>
            )}

            {!creating && (
              <button
                onClick={handleCreateWorkspace}
                disabled={!workspaceName}
                className="w-full bg-[#22c55e] text-black font-bold text-sm py-3 hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Create Workspace
              </button>
            )}
          </div>
        )}

        {/* Step 3: Interview */}
        {step === 3 && question && (
          <div>
            {/* File type intro */}
            {currentQuestionIndex === 0 && !saving && (
              <div className="mb-6">
                <h1 className="text-xl font-bold mb-1">
                  {FILE_INTROS[currentFileType].title}
                </h1>
                <p className="text-sm text-[#a0a0a0]">
                  {FILE_INTROS[currentFileType].subtitle}
                </p>
              </div>
            )}

            {/* Progress bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#6b6b6b] uppercase" style={{ letterSpacing: "0.15em" }}>
                Question {currentQuestionIndex + 1} of {questions.length} &middot; {currentFileType}
              </span>
            </div>
            <div className="w-full h-0.5 bg-[#1a1a1a] mb-8">
              <div
                className="h-full bg-[#22c55e] transition-all duration-300"
                style={{
                  width: `${((completedQuestions + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>

            {/* Saving overlay */}
            {saving && (
              <div className="flex items-center justify-center gap-3 py-16">
                {showCheckmark ? (
                  <span className="text-[#22c55e] text-2xl">&#10003;</span>
                ) : (
                  <PulsingDots />
                )}
                <span className="text-sm text-[#a0a0a0]">
                  {showCheckmark ? "Saved!" : "Saving..."}
                </span>
              </div>
            )}

            {!saving && (
              <>
                {/* Question */}
                <h2 className="text-lg font-bold mb-2">{question.question}</h2>
                <p className="text-xs text-[#6b6b6b] mb-6">
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
                  className="w-full resize-none text-sm leading-relaxed text-white placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#22c55e]"
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #1a1a1a",
                    padding: "16px",
                    minHeight: "140px",
                  }}
                />

                {/* Word count */}
                <div className="flex items-center justify-end mt-2 mb-6">
                  {currentAnswer.length > 0 && (
                    <span className="text-[10px] text-[#6b6b6b]">
                      {currentAnswer.split(/\s+/).filter(Boolean).length} words
                    </span>
                  )}
                </div>

                {/* Upload support */}
                <div className="flex items-center gap-3 mb-6">
                  <label className="flex items-center gap-2 text-xs text-[#6b6b6b] hover:text-[#4a9eff] cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    {uploading ? "Reading..." : "Upload a file to help answer this"}
                    <input
                      type="file"
                      accept=".txt,.md,.doc,.docx,.pdf,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <span className="text-[10px] text-[#333]">.txt, .md, .doc, .csv</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleSkipQuestion}
                      className="text-xs text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleSkipFile}
                      className="text-xs text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                    >
                      Skip section
                    </button>
                  </div>

                  <button
                    onClick={handleNext}
                    className="bg-[#22c55e] text-black font-bold text-sm px-6 py-2.5 hover:brightness-110 transition-all"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Next \u2192"
                      : "Next \u2192"}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="text-xs text-[#ef4444] mt-4 p-3 border border-[#ef4444]/30 bg-[#ef4444]/5">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 4: You're Ready */}
        {step === 4 && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">
              You're all set
            </h1>
            <p className="text-sm text-[#a0a0a0] mb-8">
              Your business files are saved. The more you use Codify, the better AI understands your business.
            </p>

            {/* File cards grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FILE_TYPES.map((ft) => {
                const isCommitted = committedFiles.includes(ft);
                const isSkipped = skippedFiles.includes(ft);
                return (
                  <div
                    key={ft}
                    className="bg-[#111111] border border-[#1a1a1a] p-4 text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{ft}.md</span>
                      {isCommitted && (
                        <span className="text-[#22c55e] text-sm">&#10003;</span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6b6b6b]">
                      {isCommitted
                        ? "Ready"
                        : isSkipped
                          ? "Add later"
                          : "Add later"}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#6b6b6b] mb-8">
              You can update these files anytime as your business evolves.
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-[#22c55e] text-black font-bold text-sm py-3.5 hover:brightness-110 transition-all"
            >
              Start Building &#8594;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <OnboardingContent />
    </Suspense>
  );
}
