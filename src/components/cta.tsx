"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function CTA() {
  const { ref, inView } = useInView(0.1);
  const { cta } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
        <div
          className={`transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="font-mono font-bold text-white mb-6 whitespace-pre-line"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            {cta.headline}
          </h2>
          <p className="text-muted text-lg max-w-[540px] mx-auto mb-8 leading-relaxed">
            {cta.subhead}
          </p>

          {/* Starter kit file preview */}
          {"files" in cta && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {(cta as { files: string[] }).files.map((file) => (
                <span
                  key={file}
                  className="font-mono text-xs bg-surface border border-border px-3 py-1.5 text-green"
                >
                  {file}
                </span>
              ))}
            </div>
          )}

          <a
            href={cta.ctaUrl}
            className="inline-flex items-center gap-2 bg-green text-black font-mono font-bold text-sm px-10 py-4 hover:brightness-110 transition-all"
          >
            <span>❯</span>
            {cta.ctaText}
          </a>
          <p className="font-mono text-xs text-dim mt-4">{cta.microcopy}</p>
        </div>
      </div>
    </section>
  );
}
