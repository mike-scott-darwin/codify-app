"use client";

export function Compatibility() {
  const models = [
    { name: "Claude", color: "#D97706" },
    { name: "ChatGPT", color: "#10A37F" },
    { name: "Gemini", color: "#4285F4" },
    { name: "Mistral", color: "#F97316" },
    { name: "Llama", color: "#764ABC" },
  ];

  return (
    <section className="py-8 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10">
          <p className="font-mono text-[10px] text-dim uppercase tracking-[0.25em] shrink-0">
            Platform agnostic
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {models.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2 font-mono text-sm text-muted hover:text-white transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                {m.name}
              </div>
            ))}
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="flex items-center gap-5">
              <span className="font-mono text-xs text-dim">
                <span className="text-green">.md</span> files
              </span>
              <span className="font-mono text-xs text-dim">
                <span className="text-green">git</span> versioned
              </span>
              <span className="font-mono text-xs text-dim">
                <span className="text-green">you</span> own it
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
