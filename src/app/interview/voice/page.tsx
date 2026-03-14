"use client";

import { useState, useCallback } from "react";
import { voiceQuestions } from "@/lib/interview-data";
import { useRouter } from "next/navigation";

// Client Ready demo answers — pre-populated so you can see the full output
const DEMO_ANSWERS: Record<string, string> = {
  voice_tone: "Direct, practical, no-BS. Confident without hype. I sound like a smart friend who figured something out and is explaining it clearly — not selling you on anything.",
  voice_phrases: "I use 'Wrong' as a complete sentence. 'Let's go.' 'Period, full stop.' 'You can't grow into pain.' 'Test, validate, build.' 'Show what you teach and teach what you show.' I open with 'Here's the truth:' or 'Here's what most coaches get wrong:' — words I lean on: validate, test, extract, install, system, funnel, leverage, practical, clear, simple, working, proven, actually, specifically, today.",
  voice_never: "I'd never say 'revolutionary,' 'incredible,' 'amazing,' 'life-changing,' 'secrets,' 'hack,' 'crushing it,' 'believe and manifest,' or 'game-changer.' No guru energy. No 'I cracked the code' vibe. No toxic positivity pretending everything's fine when it isn't. No hype words. No empty superlatives.",
  voice_example: "Here's the truth: Your offer doesn't need to be complicated. It needs to be clear. Most coaches get this backwards — they spend weeks polishing the perception while the actual offer is a confusing mess. Stop making it pretty. Test it with real money first. If someone will pay for it, it works. If they won't, no amount of branding fixes that.",
  voice_personality: "Practically optimistic. I don't pretend everything's fine, and I don't complain about circumstances. I just move. I'm calm and controlled — the loudest person in the room rarely drives lasting change. I refuse to let conditions dictate the next move. I reframe constantly: 'You didn't fail at content — the content treadmill was designed to fail you.'",
};

export default function VoiceInterviewPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(DEMO_ANSWERS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const question = voiceQuestions[currentIndex];
  const isLast = currentIndex === voiceQuestions.length - 1;
  const currentAnswer = answers[question.id] || "";
  const canProceed = !question.required || currentAnswer.trim().length > 10;
  const wordCount = currentAnswer.split(/\s+/).filter(Boolean).length;

  // Build terminal progress bar
  const filled = currentIndex + 1;
  const total = voiceQuestions.length;
  const barFilled = "\u2588".repeat(filled);
  const barEmpty = "\u2591".repeat(total - filled);
  const progressBar = `[${barFilled}${barEmpty}] ${filled}/${total}`;

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (isLast) {
        sessionStorage.setItem("codify-interview-voice", JSON.stringify(answers));
        router.push("/preview/voice");
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
                {isLast ? "See Your Voice File →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
