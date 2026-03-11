"use client";

import { useInView } from "./use-in-view";
import { useState, useEffect, useRef } from "react";

const terminalLines = [
  { type: "command", text: "codify extract", delay: 0 },
  { type: "output", text: "Scanning business knowledge...", delay: 600 },
  { type: "success", text: "✓ Offer positioning extracted", delay: 1200 },
  { type: "success", text: "✓ Audience segments identified", delay: 1600 },
  { type: "success", text: "✓ Voice patterns captured", delay: 2000 },
  { type: "success", text: "✓ Proof and testimonials mapped", delay: 2400 },
  { type: "blank", text: "", delay: 2800 },
  { type: "command", text: "codify structure", delay: 3000 },
  { type: "blank", text: "", delay: 3400 },
  { type: "file", text: "  creating soul.md .............. done", delay: 3600 },
  { type: "detail", text: "    → Why you exist. Your origin, mission, and what drives every decision.", delay: 4000 },
  { type: "blank", text: "", delay: 4400 },
  { type: "file", text: "  creating offer.md ............. done", delay: 4600 },
  { type: "detail", text: "    → What you sell. The transformation, the mechanism, the proof it works.", delay: 5000 },
  { type: "blank", text: "", delay: 5400 },
  { type: "file", text: "  creating audience.md .......... done", delay: 5600 },
  { type: "detail", text: "    → Who buys. Real people, real pain, real language they use.", delay: 6000 },
  { type: "blank", text: "", delay: 6400 },
  { type: "file", text: "  creating voice.md ............. done", delay: 6600 },
  { type: "detail", text: "    → How you sound. Tone, phrases, personality. Every output matches you.", delay: 7000 },
  { type: "blank", text: "", delay: 7400 },
  { type: "info", text: "  4 files. AI reads all of them before generating anything.", delay: 7600 },
  { type: "info", text: "  No prompting. No re-explaining. It already knows you.", delay: 8000 },
  { type: "blank", text: "", delay: 8400 },
  { type: "command", text: "codify generate --ads", delay: 8600 },
  { type: "output", text: "Reading 4 reference files...", delay: 9100 },
  { type: "result", text: "✓ 47 ad variations written", delay: 9600 },
  { type: "result", text: "✓ 12 hook variants generated", delay: 10000 },
  { type: "result", text: "✓ 5 image prompts created", delay: 10400 },
  { type: "blank", text: "", delay: 10800 },
  { type: "command", text: "codify generate --vsl", delay: 11000 },
  { type: "output", text: "Building from offer.md + proof...", delay: 11500 },
  { type: "result", text: "✓ 18-section VSL script → outputs/vsl/", delay: 12100 },
  { type: "blank", text: "", delay: 12500 },
  { type: "command", text: "codify compound", delay: 12700 },
  { type: "status", text: "  Reference files:  4 core + 3 domain", delay: 13200 },
  { type: "status", text: "  Total context:    322+ commits", delay: 13600 },
  { type: "status", text: "  Outputs:          ads, vsl, content, email", delay: 14000 },
  { type: "highlight", text: "  Context depth:    compounding ▲", delay: 14400 },
];

export function Demo() {
  const { ref, inView } = useInView(0.05);
  const [visibleCount, setVisibleCount] = useState(0);
  const hasStarted = useRef(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;
    terminalLines.forEach((line, i) => {
      const timer = setTimeout(() => setVisibleCount(i + 1), line.delay);
      timersRef.current.push(timer);
    });
    return () => timersRef.current.forEach(clearTimeout);
  }, [inView]);

  const colorClass = (type: string) => {
    switch (type) {
      case "command": return "text-green font-bold";
      case "success": return "text-green";
      case "file": return "text-blue";
      case "detail": return "text-[#999] italic";
      case "info": return "text-white font-bold";
      case "output": return "text-[#888]";
      case "result": return "text-amber font-bold";
      case "status": return "text-[#888]";
      case "highlight": return "text-green font-bold";
      default: return "text-[#888]";
    }
  };

  return (
    <div ref={ref} className="pt-8 pb-20 md:pb-28">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <div
          className={`bg-[#1a1a1a] rounded-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#333] transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* macOS title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#2a2a2a] border-b border-[#333]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <div className="flex-1 text-center">
              <span className="font-mono text-[11px] text-[#888]">your-business — zsh — 80×24</span>
            </div>
          </div>

          {/* Terminal body */}
          <div className="px-6 md:px-8 py-6 md:py-8 font-mono text-[12px] md:text-[13px] h-[580px] md:h-[620px] bg-[#1a1a1a]" style={{ lineHeight: "1.85" }}>
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className={`${line.type === "blank" ? "" : colorClass(line.type)} transition-opacity duration-200 ${
                  i < visibleCount ? "opacity-100" : "opacity-0"
                }`}
                style={{ height: line.type === "blank" ? "8px" : undefined }}
              >
                {line.type === "blank" ? null : line.type === "command" ? (
                  <><span className="text-[#888]">❯ </span>{line.text}</>
                ) : line.text}
              </div>
            ))}
            {visibleCount >= terminalLines.length && (
              <span className="animate-blink text-green text-lg">█</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
