"use client";

function ClaudeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 3.5C14.5 2 11 2 8.5 4C6 6 5.5 9.5 7 12C8.5 14.5 7 15.5 5.5 16.5C4 17.5 3 19.5 4.5 21C6 22.5 8.5 21.5 10 20C11.5 18.5 13 18.5 14.5 19.5C16 20.5 18.5 20.5 20 18.5C21.5 16.5 20 14 18 13C16 12 16 10.5 16.5 9C17 7.5 18.5 5 16.5 3.5Z" fill="#D97706" />
    </svg>
  );
}

function OpenAIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.2 10.4C22.6 8.8 22.2 7 21.2 5.6C19.6 3.2 16.6 2.2 14 3L13.6 3.2C12.8 2.4 11.8 1.8 10.6 1.6C8 1 5.2 2.4 4 4.8C3.2 4.8 2.4 5 1.8 5.4C0 6.6 -0.6 9 0.4 10.8L0.6 11.2C0 12 -0.2 13 0 14C0.4 16.8 2.8 18.8 5.6 18.8H6C6.6 19.8 7.6 20.4 8.8 20.8C11.4 21.4 14 20.2 15.2 17.8C16 17.8 16.8 17.6 17.4 17.2C19.2 16 19.8 13.6 18.8 11.8L22.2 10.4Z" fill="#10A37F" />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 17 7 22 12C17 17 12 22 12 22C12 22 7 17 2 12C7 7 12 2 12 2Z" fill="#4285F4" />
    </svg>
  );
}

function MistralIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="6" height="6" fill="#F7D046" />
      <rect x="9" y="2" width="6" height="6" fill="#F7D046" />
      <rect x="16" y="2" width="6" height="6" fill="#F7D046" />
      <rect x="2" y="9" width="6" height="6" fill="#F2A73B" />
      <rect x="9" y="9" width="6" height="6" fill="#EF8030" />
      <rect x="16" y="9" width="6" height="6" fill="#F2A73B" />
      <rect x="2" y="16" width="6" height="6" fill="#EE6B2D" />
      <rect x="9" y="16" width="6" height="6" fill="#EE6B2D" />
      <rect x="16" y="16" width="6" height="6" fill="#EE6B2D" />
    </svg>
  );
}

function LlamaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L8 6V10L4 14V20H8V16L12 12L16 16V20H20V14L16 10V6L12 2Z" fill="#764ABC" />
    </svg>
  );
}

export function Compatibility() {
  const models = [
    { name: "Claude", icon: <ClaudeIcon /> },
    { name: "GPT", icon: <OpenAIIcon /> },
    { name: "Gemini", icon: <GeminiIcon /> },
    { name: "Mistral", icon: <MistralIcon /> },
    { name: "Llama", icon: <LlamaIcon /> },
  ];

  return (
    <section className="py-8 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10">
          <p className="font-mono text-[10px] text-dim uppercase tracking-[0.25em] shrink-0">
            Works with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10">
            {models.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-2.5 font-mono text-sm text-muted hover:text-white transition-colors group"
              >
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {m.icon}
                </div>
                {m.name}
              </div>
            ))}
            <div className="hidden md:block w-px h-5 bg-border" />
            <div className="flex items-center gap-2.5 font-mono text-sm text-muted">
              <span className="font-mono text-green text-xs font-bold">.md</span>
              Markdown
            </div>
            <div className="flex items-center gap-2.5 font-mono text-sm text-muted">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="#22c55e" strokeWidth="2" fill="none" />
                <path d="M9 12L11 14L15 10" stroke="#22c55e" strokeWidth="2" fill="none" />
              </svg>
              Git versioned
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
