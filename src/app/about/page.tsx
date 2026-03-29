import { siteConfig } from "../../site-config";

export default function AboutPage() {
  const { about } = siteConfig;

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
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-4">
            {about.eyebrow}
          </p>
          <h1
            className="font-bold text-white leading-[1.1] mb-6 text-[clamp(1.75rem,5vw,2.5rem)]"
          >
            {about.headline}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center text-blue font-bold text-sm">
              {about.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">{about.name}</p>
              <p className="text-muted text-xs">{about.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[680px] mx-auto px-6 md:px-12">
          <p className="text-muted text-lg leading-relaxed">{about.intro}</p>
        </div>
      </section>

      {/* Story sections */}
      {about.sections.map(
        (
          section: { heading: string; paragraphs: string[] },
          i: number
        ) => (
          <section key={i} className="pb-12 md:pb-16">
            <div className="max-w-[680px] mx-auto px-6 md:px-12">
              <h2 className="font-bold text-white text-xl mb-4">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((p: string, j: number) => (
                  <p
                    key={j}
                    className="text-muted text-base md:text-sm leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <h2
            className="font-bold text-white mb-4"
            style={{ fontSize: "var(--text-2xl)" }}
          >
            Ready to Stop Starting Over?
          </h2>
          <p className="text-muted text-sm mb-8">
            5 extractions + 3 content outputs free. No credit card.
          </p>
          <a
            href="/get-started"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue text-black px-8 py-4 rounded-lg hover:brightness-110 transition-all w-full sm:w-auto"
          >
            Start Free Trial
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
