"use client";

import { useState } from "react";
import { siteConfig } from "../site-config";
import { useInView } from "./use-in-view";

export function Product() {
  const { ref, inView } = useInView(0.1);
  const { product } = siteConfig;
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(tierName: string) {
    const key = tierName.toLowerCase();
    setLoading(key);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: key, billing: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <section
      id="engagement"
      ref={ref}
      className="py-10 md:py-20 border-t border-border"
    >
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {product.eyebrow}
          </p>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {product.headline}
          </h2>
          <p className="text-muted text-lg max-w-[640px] mx-auto leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-[800px] mx-auto">
          {product.tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`bg-surface border rounded-xl flex flex-col transition-all duration-600 ${
                tier.highlight
                  ? "border-2 border-blue relative"
                  : "border-border"
              } ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.15em] uppercase bg-blue text-black font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-white text-xl">{tier.name}</h3>
                  {"badge" in tier && tier.badge && (
                    <span className="text-[10px] tracking-[0.1em] uppercase text-green border border-green/30 bg-green/10 px-2 py-0.5 rounded">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">
                    {tier.price}
                  </span>
                  <span className="text-sm text-dim">{tier.period}</span>
                </div>
                <div className="text-xs text-dim mb-4">
                  or {tier.annual} — save 40%+
                </div>

                <p className="text-sm text-muted leading-relaxed mb-6">
                  {tier.description}
                </p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="text-green shrink-0 mt-0.5">
                        &#x2713;
                      </span>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(tier.name)}
                  disabled={loading === tier.name.toLowerCase()}
                  className={`block w-full text-center font-semibold text-sm py-3.5 px-6 rounded-lg transition-all cursor-pointer disabled:opacity-60 ${
                    tier.highlight
                      ? "bg-blue text-black hover:brightness-110"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {loading === tier.name.toLowerCase() ? "Redirecting..." : tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div
          className={`mt-8 bg-green/5 border border-green/20 rounded-xl p-6 text-center transition-all duration-600 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <p className="text-sm text-muted leading-relaxed max-w-[640px] mx-auto">
            {product.guarantee}
          </p>
        </div>
      </div>
    </section>
  );
}
