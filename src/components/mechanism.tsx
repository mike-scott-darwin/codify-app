"use client";

import { useState, useEffect, useRef } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Mechanism() {
  const { ref, inView } = useInView(0.1);
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const { mechanism } = siteConfig;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle through steps like a video
  useEffect(() => {
    if (!inView || !autoPlay) return;
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % mechanism.steps.length);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [inView, autoPlay, mechanism.steps.length]);

  const handleClick = (i: number) => {
    setActiveStep(i);
    setAutoPlay(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <section id="mechanism" ref={ref} className="py-16 md:py-20 border-t border-border">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {mechanism.eyebrow}
          </p>
        </div>

        {/* Horizontal step bar */}
        <div
          className={`flex items-center justify-center gap-2 md:gap-0 mb-8 transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {mechanism.steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <button
                onClick={() => handleClick(i)}
                className={`font-mono font-bold text-lg md:text-2xl px-3 md:px-4 py-2 transition-all relative ${
                  activeStep === i
                    ? "text-white"
                    : "text-dim hover:text-muted"
                }`}
              >
                {step.label}
                {activeStep === i && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-blue" />
                )}
              </button>
              {i < mechanism.steps.length - 1 && (
                <span className="font-mono text-dim text-lg md:text-2xl mx-1 md:mx-2">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Terminal explainer */}
        <div
          className={`bg-surface border border-border overflow-hidden transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="font-mono text-xs text-dim ml-2">
                ~/business
              </span>
            </div>
            {autoPlay && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                <span className="font-mono text-[10px] text-dim">auto</span>
              </div>
            )}
          </div>
          <div className="p-8 min-h-[180px]">
            <div className="font-mono text-sm mb-6">
              <span className="text-green">❯</span>{" "}
              <span className="text-white">
                {mechanism.steps[activeStep].command}
              </span>
              <span className="inline-block w-[8px] h-[16px] bg-blue animate-blink ml-1 align-middle" />
            </div>
            <p className="text-muted leading-relaxed max-w-[600px] transition-opacity duration-300">
              {mechanism.steps[activeStep].description}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex h-[2px] bg-[#1a1a1a]">
            {mechanism.steps.map((_, i) => (
              <div
                key={i}
                className="flex-1 relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 transition-all ${
                    i < activeStep
                      ? "bg-blue"
                      : i === activeStep
                      ? "bg-blue"
                      : "bg-transparent"
                  }`}
                  style={
                    i === activeStep && autoPlay
                      ? {
                          animation: "progressFill 3.5s linear forwards",
                        }
                      : i === activeStep
                      ? { width: "100%" }
                      : {}
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
