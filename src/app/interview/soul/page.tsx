"use client";

import { useState, useCallback } from "react";
import { soulQuestions } from "@/lib/interview-data";
import { useRouter } from "next/navigation";
import { saveAnswers } from "@/lib/db";

// Client Ready demo answers — pre-populated so you can see the full output
const DEMO_ANSWERS: Record<string, string> = {
  origin: "Seven years. Since 2018. I've tried affiliate marketing, followed gurus who promised A to Z, watched the 'straight line' turn into circles. I've got the character to see things through — and I'm still here. That search taught me something: most people are building the wrong thing. Not because the tactics are wrong, but because the foundation is wrong. They're growing into pain. I'm trying to help people skip the seven years.",
  problem: "Most coaches leave their 9-to-5 to escape the grind, then build a coaching business that's the same trap with worse benefits. They spend 12 months posting for likes and comments. Nobody takes the next step. That's not a business — it's a hamster wheel. They can't charge what they're worth because they've never validated their offer. They're selling time instead of transformation.",
  belief: "You can't grow into pain. If the offer isn't aligned — if it hurts to show up — you'll eventually burn it down. I've watched people build big businesses and destroy them because they couldn't sustain something that wasn't them. The goal isn't just a business that makes money. It's a business you won't abandon. Alignment first, scale second.",
  transformation: "A business built around your life — not a life built around your business. That means: an offer aligned with what you actually do well, a system that runs without you white-knuckling every day, paid traffic that works while you sleep, and freedom that doesn't require 70-hour weeks. They go from confused about their offer to clear in one sentence. From posting daily with no clients to running ads that convert while they sleep.",
  why_you: "I'm still here. I've navigated the real maze of building a real business, not just selling the map. I've personally burned through the guru playbook, the content grind, the shiny object cycle — and came out the other side with something that actually works. I'm a few steps ahead on the same path, not a guru selling a shortcut that doesn't exist.",
  values: "I will never tell you to push through pain — that's how people burn down businesses they spent years building. I will never sell scale for scale's sake. I will never outsource my thinking to templates or gurus. I will never pitch from stage or use high-pressure sales tactics. And I will never serve clients who drain me just for revenue.",
  mission: "Help people build businesses they won't burn down. Not the biggest business. Not the fastest scale. The right business — for them. If this succeeds, people stay connected to their work instead of dissociated from it. They feel the value they create, not just execute it. The business doesn't become the thing they escaped from.",
};

export default function SoulInterviewPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const EMPTY_ANSWERS: Record<string, string> = Object.fromEntries(Object.keys(DEMO_ANSWERS).map(k => [k, ""]));  const [answers, setAnswers] = useState<Record<string, string>>(EMPTY_ANSWERS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const question = soulQuestions[currentIndex];
  const isLast = currentIndex === soulQuestions.length - 1;
  const currentAnswer = answers[question.id] || "";
  const canProceed = !question.required || currentAnswer.trim().length > 10;
  const wordCount = currentAnswer.split(/\s+/).filter(Boolean).length;

  // Build terminal progress bar
  const filled = currentIndex + 1;
  const total = soulQuestions.length;
  const barFilled = "\u2588".repeat(filled);
  const barEmpty = "\u2591".repeat(total - filled);
  const progressBar = `[${barFilled}${barEmpty}] ${filled}/${total}`;

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (isLast) {
        sessionStorage.setItem("codify-interview-soul", JSON.stringify(answers));
        saveAnswers("soul", answers);
        router.push("/preview/soul");
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
                {isLast ? "See Your Soul File →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
