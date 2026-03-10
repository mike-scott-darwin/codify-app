"use client";

import { useState } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Product() {
  const { ref, inView } = useInView(0.1);
  const [annual, setAnnual] = useState(false);
  const { product } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          {product.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-4"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          {product.headline}
        </h2>
        <p className="text-muted text-lg max-w-[640px] mb-10 leading-relaxed">
          {product.description}
        </p>

        {/* Billing toggle */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => setAnnual(false)}
            className={`font-mono text-sm px-4 py-2 transition-all ${
              !annual
                ? "text-white border border-blue bg-[#4a9eff10]"
                : "text-dim border border-transparent hover:text-muted"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`font-mono text-sm px-4 py-2 transition-all flex items-center gap-2 ${
              annual
                ? "text-white border border-green bg-[#22c55e10]"
                : "text-dim border border-transparent hover:text-muted"
            }`}
          >
            Annual
            <span className="text-[10px] text-green uppercase tracking-wider">
              save 40%+
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {product.tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`bg-surface border ${
                tier.highlight ? "border-blue" : "border-border"
              } flex flex-col transition-all duration-600 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Terminal header */}
              <div className="px-6 py-4 border-b border-border bg-[#1a1a1a]">
                <div className="font-mono text-xs text-dim">
                  <span className="text-green">❯</span> {tier.command}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-mono font-bold text-white text-xl">
                    {tier.name}
                  </h3>
                  {tier.highlight && (
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-blue border border-blue px-2 py-0.5">
                      Popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-3xl font-bold text-white">
                    {annual ? tier.annualPrice : tier.price}
                  </span>
                  {!annual && (
                    <span className="font-mono text-sm text-dim">
                      {tier.period}
                    </span>
                  )}
                </div>
                {annual && (
                  <div className="font-mono text-xs text-green mb-4">
                    {tier.annualSavings}
                  </div>
                )}
                {!annual && <div className="mb-4" />}

                <p className="text-sm text-muted mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Skills */}
                <div className="mb-6">
                  <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-dim mb-3">
                    Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.skills.map((skill) => (
                      <span
                        key={skill}
                        className="font-mono text-xs px-2 py-1 bg-[#1a1a1a] border border-border text-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="font-mono text-green shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.ctaUrl}
                  className={`block text-center font-mono font-bold text-sm py-3 px-6 transition-all ${
                    tier.highlight
                      ? "bg-green text-black hover:brightness-110"
                      : "border border-border text-white hover:border-muted"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
