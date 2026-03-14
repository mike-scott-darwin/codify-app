"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { soulQuestions } from "@/lib/interview-data";
import { useRouter } from "next/navigation";

export default function SoulInterviewPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const question = soulQuestions[currentIndex];
  const progress = ((currentIndex + 1) / soulQuestions.length) * 100;
  const isLast = currentIndex === soulQuestions.length - 1;
  const currentAnswer = answers[question.id] || "";
  const canProceed = !question.required || currentAnswer.trim().length > 10;

  const goNext = useCallback(() => {
    if (!canProceed) return;
    setIsTransitioning(true);
    setTimeout(() => {
      if (isLast) {
        // Store answers in sessionStorage and go to preview
        sessionStorage.setItem("codify-interview-soul", JSON.stringify(answers));
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {currentIndex + 1} / {soulQuestions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ${
            isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {question.section}
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {question.question}
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">{question.helpText}</p>

          <Textarea
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
            }
            placeholder={question.placeholder}
            className="min-h-[180px] resize-none text-base leading-relaxed"
            autoFocus
          />

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {currentAnswer.length > 0 && (
                <span>{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
              )}
            </div>
            <Button
              onClick={goNext}
              disabled={!canProceed}
              size="lg"
              className="gap-2"
            >
              {isLast ? (
                <>
                  See Your Soul File
                  <Check className="size-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
