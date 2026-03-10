"use client";

import { useState } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Mechanism() {
  const { ref, inView } = useInView(0.1);
  const [activeStep, setActiveStep] = useState(0);
  const { mechanism } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          {mechanism.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-16"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          {mechanism.headline}
        </h2>

        <div
          className={`grid md:grid-cols-[280px_1fr] gap-8 transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Step list */}
          <div className="flex md:flex-col gap-2">
            {mechanism.steps.map((step, i) => (
              <button
                key={step.label}
                onClick={() => setActiveStep(i)}
                className={`text-left px-4 py-3 font-mono text-sm transition-all border ${
                  activeStep === i
                    ? "border-blue bg-[#4a9eff10] text-white"
                    : "border-transparent text-dim hover:text-muted"
                }`}
              >
                <span className="text-blue mr-2">{i + 1}.</span>
                {step.label}
              </button>
            ))}
          </div>

          {/* Terminal display */}
          <div className="bg-surface border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-border">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="font-mono text-xs text-dim ml-2">
                ~/business
              </span>
            </div>
            <div className="p-8 min-h-[200px]">
              <div className="font-mono text-sm mb-6">
                <span className="text-green">❯</span>{" "}
                <span className="text-white">
                  {mechanism.steps[activeStep].command}
                </span>
                <span className="inline-block w-[8px] h-[16px] bg-blue animate-blink ml-1 align-middle" />
              </div>
              <p className="text-muted leading-relaxed max-w-[500px]">
                {mechanism.steps[activeStep].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
