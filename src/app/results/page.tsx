"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../../site-config";
import { useInView } from "../../components/use-in-view";

function AnimatedNumber({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [active, value]);

  return <>{display}</>;
}

export default function ResultsPage() {
  const { ref: statsRef, inView: statsVisible } = useInView(0.1);
  const { ref: testimonialsRef, inView: testimonialsVisible } = useInView(0.05);
  const { proof, testimonials } = siteConfig;

  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              codify
            </span>
          </a>
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="/get-started"
              className="text-sm font-semibold bg-blue text-black px-4 py-2 rounded-lg hover:brightness-110 transition-all"
            >
              Find My Missing Revenue
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {proof.eyebrow}
          </p>
          <h1
            className="font-bold text-white leading-[1.1] mb-4"
            style={{ fontSize: "var(--text-4xl)" }}
          >
            {proof.headline}
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-[640px] mx-auto">
            {proof.description}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="pb-16 md:pb-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {proof.stats.map(
              (
                stat: { value: string; label: string; suffix: string },
                i: number
              ) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-600 ${
                    statsVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <AnimatedNumber
                      value={parseInt(stat.value)}
                      active={statsVisible}
                    />
                    <span className="text-blue">{stat.suffix}</span>
                  </div>
                  <div className="text-sm text-muted">{stat.label}</div>
                </div>
              )
            )}
          </div>

          {/* Before / After */}
          <div
            className={`grid md:grid-cols-2 gap-6 transition-all duration-600 ${
              statsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="bg-surface border border-border rounded-xl p-8">
              <h3 className="text-sm font-semibold text-red uppercase tracking-wider mb-6">
                Before Codify
              </h3>
              <ul className="space-y-4">
                {proof.before.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-red shrink-0 mt-0.5">&#x2717;</span>
                    <span className="text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface border border-green/20 rounded-xl p-8">
              <h3 className="text-sm font-semibold text-green uppercase tracking-wider mb-6">
                After Codify
              </h3>
              <ul className="space-y-4">
                {proof.after.map((item: string) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-green shrink-0 mt-0.5">&#x2713;</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        className="py-16 md:py-20 border-t border-border"
      >
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
              {testimonials.eyebrow}
            </p>
            <h2
              className="font-bold text-white mb-4"
              style={{ fontSize: "var(--text-3xl)" }}
            >
              {testimonials.headline}
            </h2>
            <p className="text-muted text-lg max-w-[640px] mx-auto leading-relaxed">
              {testimonials.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.items.map(
              (
                t: {
                  name: string;
                  context: string;
                  quote: string;
                  result: string;
                },
                i: number
              ) => (
                <div
                  key={t.name}
                  className={`bg-surface border border-border rounded-xl p-6 transition-all duration-600 ${
                    testimonialsVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center text-blue font-bold text-xs">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted">{t.context}</p>
                    </div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-green shrink-0">&#x2713;</span>
                    <span className="text-green text-xs font-semibold">
                      {t.result}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "var(--text-2xl)" }}
          >
            See It For Yourself
          </h2>
          <p className="text-muted text-sm mb-8">
            Free opportunity scan — results in 15 minutes.
          </p>
          <a
            href="/get-started"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue text-black px-8 py-4 rounded-lg hover:brightness-110 transition-all w-full sm:w-auto"
          >
            Find My Missing Revenue
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <span className="text-xs text-dim">
            &copy; {new Date().getFullYear()} Codify &middot; Context &gt;
            Prompts.
          </span>
        </div>
      </footer>
    </main>
  );
}
