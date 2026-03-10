"use client";

import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Product() {
  const { ref, inView } = useInView(0.1);
  const { product } = siteConfig;

  return (
    <section ref={ref} className="py-24 md:py-32 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-blue mb-4">
          {product.eyebrow}
        </p>
        <h2
          className="font-mono font-bold text-white mb-16"
          style={{ fontSize: "var(--text-3xl)" }}
        >
          {product.headline}
        </h2>

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
                <div className="font-mono text-xs text-dim mb-1">
                  <span className="text-green">❯</span> {tier.command}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-mono font-bold text-white text-xl mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-3xl font-bold text-white">
                    {tier.price}
                  </span>
                  <span className="font-mono text-sm text-dim">
                    {tier.period}
                  </span>
                </div>
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  {tier.description}
                </p>

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
