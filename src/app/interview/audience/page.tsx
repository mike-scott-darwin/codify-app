"use client";

import { useState, useCallback } from "react";
import { audienceQuestions } from "@/lib/interview-data";
import { useRouter } from "next/navigation";
import { saveAnswers } from "@/lib/db";

// Client Ready demo answers — pre-populated so you can see the full output
const DEMO_ANSWERS: Record<string, string> = {
  audience_who: "Mature senior executives with 30+ years of institutional knowledge. Business owners doing $500K to $10M+ who know their expertise is their competitive advantage. They've watched AI commoditize their industry and want their knowledge to work FOR them, not against them. Not looking for AI toys — looking for a system that preserves and scales what they know.",
  audience_struggle: "Their institutional knowledge is trapped in their head. When key people leave, decades of expertise disappear. AI gives them generic outputs because it doesn't know their business. They've hired $5K-$20K AI consultants and got PowerPoint decks that sit in a drawer. Nothing compounds. Nothing preserves what makes them different.",
  audience_tried: "AI consultants ($5K-$20K, got a report), ChatGPT and Claude (impressed by tech, frustrated by generic outputs), watched junior team members use AI to produce work that sounds nothing like them. Some have tried knowledge management tools but they just store information — they don't operationalize it.",
  audience_desire: "\"I want 30 years of expertise structured so AI actually knows my business. I want outputs that sound like me on the first draft. And I want my institutional knowledge preserved — not lost when I step back or when key people leave.\"",
  audience_objection: "They think 'AI implementation' requires developers, massive budgets, and technical expertise. They don't realize that structured files — extracted through strategic conversation — solve 80% of what they need. The gap feels technical and expensive. It's actually just methodology and the right architect.",
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
