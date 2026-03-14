"use client";

import { useState, useCallback } from "react";
import { offerQuestions } from "@/lib/interview-data";
import { useRouter } from "next/navigation";

// Client Ready demo answers — pre-populated so you can see the full output
const DEMO_ANSWERS: Record<string, string> = {
  offer_name: "Client Ready — Validate your $5K+ offer before you build anything — in one afternoon. It's a system that extracts your zone of genius, validates it with real money, and builds a funnel that converts without you explaining it on every call.",
  offer_outcome: "You go from confused — a different answer every time someone asks what you do — to clear: one sentence, no hesitation. Then from clear to converting: your offer sells itself, clients find you and understand what you do without a conversation. The mechanism: extract your zone of genius, validate it works, build the funnel, automate so it runs without constant hustle.",
  offer_price: "Front-end is $47 for the core system — PDF guide plus 5 AI prompts that extract your zone of genius, ideal client, pain points, story, and assemble your complete offer. Order bumps: $37 DM Scripts, $67 Templates, $97 First $5K Client Playbook. Then $197 done-for-you offer build, $37/month newsletter, $97/month community. Backend accelerator is $5,000 done-with-you.",
  offer_audience: "Coaches, consultants, and agency owners with validated businesses doing $100K+. They already have an audience or know how to reach one. They don't need 'how to find customers' — they need 'how to package what I do so it sells without me explaining it on every call.'",
  offer_differentiator: "I built this system for my own business first — 54 research files, 39 decisions, 42 reference files actually producing outputs. I'm not selling prompts or guru fluff. I'm selling the architecture that makes prompts irrelevant. The act of codifying your offer IS the strategic work, not a cost center. And you keep the system forever — you're not locked into my platform.",
};

export default function OfferInterviewPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(DEMO_ANSWERS);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const question = offerQuestions[currentIndex];
  const isLast = currentIndex === offerQuestions.length - 1;
  const currentAnswer = answers[question.id] || "";
  const canProceed = !question.required || currentAnswer.trim().length > 10;
  const wordCount = currentAnswer.split(/\s+/).filter(Boolean).length;

  // Build terminal progress bar
  const filled = currentIndex + 1;
  const total = offerQuestions.length;
  const barFilled = "\u2588".repeat(filled);
  const barEmpty = "\u2591".repeat(total - filled);
  const progressBar = `[${barFilled}${barEmpty}] ${filled}/${total}`;

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (isLast) {
        sessionStorage.setItem("codify-interview-offer", JSON.stringify(answers));
        router.push("/preview/offer");
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
                {isLast ? "See Your Offer File →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
