"use client";

import { useState, useCallback } from "react";
import { audienceQuestions } from "@/lib/interview-data";
import { useRouter } from "next/navigation";
import { saveAnswers } from "@/lib/db";

// Client Ready demo answers — pre-populated so you can see the full output
const DEMO_ANSWERS: Record<string, string> = {
  audience_who: "AI-literate business owners already using Claude or ChatGPT daily but getting generic results because nothing's structured or compounding. Consultants, agency owners, coaches with real revenue — $100K to $500K+. Not dreamers. They've tried Custom GPTs, Jasper, the whole stack. Their business knowledge is trapped in their head and every AI session starts from zero.",
  audience_struggle: "Every AI session starts from scratch. No memory, no context. They're paying for 5 different AI tools that each know nothing about their business. Their team uses AI differently than they do. Nothing connects, nothing compounds. They know they need help but $8-15K/month AI consultants feel like overkill for what should be a simpler problem.",
  audience_tried: "ChatGPT Plus with Projects, Claude Pro, building Custom GPTs, Jasper, Copy.ai, Notion AI, 'AI prompt' courses, hiring a VA to use AI, even considering AI consulting firms. Every single one left them in the same trap — good outputs occasionally but starting from scratch every single time. No compounding. No memory.",
  audience_desire: "\"I want AI that knows my business and remembers it forever. One system my whole team can use. Every piece of content I create should build on what came before, not restart from nothing. And I don't want to hire a $10K consultant to make it happen.\"",
  audience_objection: "They don't know what structured AI knowledge management even looks like. They think 'AI implementation' means APIs, developer tools, and a massive budget. They don't realize that structured markdown files solve 80% of what they need. The gap between where they are and where they want to be feels technical and expensive — but it's actually just methodology.",
};

export default function AudienceInterviewPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(Object.keys(DEMO_ANSWERS).map(k => [k, ""]))
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const question = audienceQuestions[currentIndex];
  const isLast = currentIndex === audienceQuestions.length - 1;
  const currentAnswer = answers[question.id] || "";
  const canProceed = !question.required || currentAnswer.trim().length > 10;
  const wordCount = currentAnswer.split(/\s+/).filter(Boolean).length;

  // Build terminal progress bar
  const filled = currentIndex + 1;
  const total = audienceQuestions.length;
  const barFilled = "█".repeat(filled);
  const barEmpty = "░".repeat(total - filled);
  const progressBar = `[${barFilled}${barEmpty}] ${filled}/${total}`;

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (isLast) {
        sessionStorage.setItem("codify-interview-audience", JSON.stringify(answers));
        saveAnswers("audience", answers);
        router.push("/preview/audience");
      } else {
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
      }
    }, 300);
  }, [canProceed, isLast, answers, router]);

  const goBack = useCallback(() => {
    if (currentIndex === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Top bar */}
      <div
        className="px-6 py-4"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="font-mono text-sm text-white">
            <span style={{ color: "#22c55e" }}>❯</span> codify
          </span>
          <button
            onClick={() => setAnswers(DEMO_ANSWERS)}
            className="font-mono text-xs text-[#6b6b6b] hover:text-[#a0a0a0] underline transition-colors"
          >
            Load example
          </button>
          <span className="font-mono text-sm" style={{ color: "#6b6b6b" }}>
            {progressBar}
          </span>
        </div>
      </div>

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ${
            isTransitioning
              ? "translate-y-4 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          {/* Section eyebrow */}
          <div className="mb-3 flex items-center gap-2">
            <span className="font-mono" style={{ color: "#22c55e" }}>
              ❯
            </span>
            <span
              className="font-mono text-xs font-medium uppercase"
              style={{ letterSpacing: "0.2em", color: "#4a9eff" }}
            >
              {question.section}
            </span>
          </div>

          {/* Question */}
          <h2 className="mb-3 font-mono text-2xl font-bold text-white sm:text-3xl">
            {question.question}
          </h2>

          {/* Help text */}
          <p className="mb-8 font-mono text-sm" style={{ color: "#a0a0a0" }}>
            {question.helpText}
          </p>

          {/* Textarea */}
          <textarea
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [question.id]: e.target.value,
              }))
            }
            placeholder={question.placeholder}
            autoFocus
            className="w-full resize-none font-mono text-base leading-relaxed text-white placeholder:text-[#6b6b6b] focus:outline-none focus:ring-1 focus:ring-[#4a9eff]"
            style={{
              backgroundColor: "#111111",
              border: "1px solid #1a1a1a",
              borderRadius: 0,
              padding: "16px",
              minHeight: "180px",
            }}
          />

          {/* Footer: word count + nav */}
          <div className="mt-6 flex items-center justify-between">
            <div className="font-mono text-xs" style={{ color: "#6b6b6b" }}>
              {currentAnswer.length > 0 && <span>{wordCount} words</span>}
            </div>

            <div className="flex items-center gap-3">
              {currentIndex > 0 && (
                <button
                  onClick={goBack}
                  className="font-mono text-sm transition-colors hover:text-white"
                  style={{ color: "#a0a0a0" }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={goNext}
                disabled={!canProceed}
                className="font-mono font-bold text-sm px-5 py-2.5 transition-opacity disabled:opacity-30"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#000000",
                  borderRadius: 0,
                }}
              >
                {isLast ? "See Your Audience File →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
