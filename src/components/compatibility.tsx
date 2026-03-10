"use client";

export function Compatibility() {
  const models = [
    { name: "Claude", icon: "◈" },
    { name: "GPT", icon: "◉" },
    { name: "Gemini", icon: "◆" },
    { name: "Mistral", icon: "◇" },
    { name: "Llama", icon: "◎" },
  ];

  const formats = [
    { name: "Markdown", icon: ".md" },
    { name: "Git", icon: "⎇" },
    { name: "Any LLM", icon: "→" },
  ];

  return (
    <section className="py-10 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <p className="font-mono text-xs text-dim uppercase tracking-wider shrink-0">
            Works with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {models.map((m) => (
              <div key={m.name} className="flex items-center gap-2 font-mono text-sm text-muted hover:text-white transition-colors">
                <span className="text-blue">{m.icon}</span>
                {m.name}
              </div>
            ))}
            <div className="hidden md:block w-px h-4 bg-border" />
            {formats.map((f) => (
              <div key={f.name} className="flex items-center gap-2 font-mono text-sm text-muted hover:text-white transition-colors">
                <span className="text-green">{f.icon}</span>
                {f.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
