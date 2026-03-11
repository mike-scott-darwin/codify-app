"use client";

export function Compatibility() {
  return (
    <section className="py-8 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <p className="font-mono text-[10px] text-dim uppercase tracking-[0.25em] shrink-0">
            Platform agnostic
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* Claude / Anthropic */}
            <div className="flex items-center gap-2 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:scale-110">
                <path d="M17.308 3.147L12.276 18.14a.553.553 0 01-.525.393.554.554 0 01-.525-.738l5.032-14.994a.553.553 0 011.05.346z" fill="#D97706"/>
                <path d="M6.692 3.147L11.724 18.14a.553.553 0 00.525.393.554.554 0 00.525-.738L7.742 2.8a.553.553 0 00-1.05.346z" fill="#D97706"/>
              </svg>
              <span className="font-mono text-sm text-muted group-hover:text-white transition-colors">
                Claude
              </span>
            </div>

            {/* ChatGPT / OpenAI */}
            <div className="flex items-center gap-2 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:scale-110">
                <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0011.702.413a6.044 6.044 0 00-5.764 4.218 5.998 5.998 0 00-3.997 2.9 6.045 6.045 0 00.749 7.19 5.985 5.985 0 00.516 4.91 6.046 6.046 0 006.51 2.9A6.065 6.065 0 0013.3 23.587a6.04 6.04 0 005.764-4.218 5.998 5.998 0 003.997-2.9 6.045 6.045 0 00-.779-6.648zM13.3 21.795a4.494 4.494 0 01-2.886-1.05l.143-.08 4.794-2.77a.778.778 0 00.395-.675v-6.76l2.027 1.17a.072.072 0 01.039.052v5.6a4.508 4.508 0 01-4.512 4.513zM3.515 17.81a4.49 4.49 0 01-.538-3.018l.143.086 4.794 2.768a.78.78 0 00.788 0l5.855-3.381v2.34a.072.072 0 01-.029.062l-4.848 2.8a4.508 4.508 0 01-6.165-1.657zM2.36 7.91A4.487 4.487 0 014.72 5.93l-.002.164v5.538a.778.778 0 00.395.676l5.855 3.38-2.027 1.17a.072.072 0 01-.068.006L4.025 14.07A4.508 4.508 0 012.36 7.91zm17.534 4.082l-5.855-3.381 2.027-1.17a.072.072 0 01.068-.005l4.848 2.799a4.504 4.504 0 01-.696 8.122v-5.69a.778.778 0 00-.392-.675zm2.017-3.03l-.143-.085-4.794-2.77a.78.78 0 00-.788 0l-5.855 3.382V7.147a.072.072 0 01.029-.062l4.848-2.8a4.507 4.507 0 016.703 4.667zm-12.69 4.168l-2.028-1.17a.072.072 0 01-.039-.053V7.31a4.507 4.507 0 017.398-3.463l-.143.08-4.794 2.77a.778.778 0 00-.395.676zm1.101-2.37l2.607-1.506 2.607 1.506v3.01l-2.607 1.507-2.607-1.506z" fill="#10A37F"/>
              </svg>
              <span className="font-mono text-sm text-muted group-hover:text-white transition-colors">
                ChatGPT
              </span>
            </div>

            {/* Gemini */}
            <div className="flex items-center gap-2 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:scale-110">
                <path d="M12 24C12 18.833 10.333 14.667 7 11.5 3.667 8.333 0 6.667 0 6.667v10.666C0 22 2 24 6.667 24H12zM12 24c0-5.167 1.667-9.333 5-12.5C20.333 8.333 24 6.667 24 6.667v10.666C24 22 22 24 17.333 24H12zM12 0C12 5.167 10.333 9.333 7 12.5 3.667 15.667 0 17.333 0 17.333V6.667C0 2 2 0 6.667 0H12zM12 0c0 5.167 1.667 9.333 5 12.5 3.333 3.167 7 4.833 7 4.833V6.667C24 2 22 0 17.333 0H12z" fill="#4285F4"/>
              </svg>
              <span className="font-mono text-sm text-muted group-hover:text-white transition-colors">
                Gemini
              </span>
            </div>

            {/* Mistral */}
            <div className="flex items-center gap-2 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:scale-110">
                <rect x="0" y="0" width="5" height="5" fill="#F7D046"/>
                <rect x="9" y="0" width="5" height="5" fill="#F7D046"/>
                <rect x="18" y="0" width="5" height="5" fill="#F7D046"/>
                <rect x="0" y="9" width="5" height="5" fill="#F97316"/>
                <rect x="4.5" y="9" width="5" height="5" fill="#F97316"/>
                <rect x="9" y="9" width="5" height="5" fill="#F97316"/>
                <rect x="14" y="9" width="5" height="5" fill="#F97316"/>
                <rect x="18" y="9" width="5" height="5" fill="#F97316"/>
                <rect x="0" y="18" width="5" height="5" fill="#F97316"/>
                <rect x="18" y="18" width="5" height="5" fill="#F97316"/>
              </svg>
              <span className="font-mono text-sm text-muted group-hover:text-white transition-colors">
                Mistral
              </span>
            </div>

            {/* Llama / Meta */}
            <div className="flex items-center gap-2 group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:scale-110">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-3.5 14.5c-1.933 0-3.5-2.239-3.5-5s1.567-5 3.5-5c.818 0 1.563.404 2.143 1.063L12 9.5l.857-.937C13.437 7.904 14.182 7.5 15 7.5c1.933 0 3.5 2.239 3.5 5s-1.567 5-3.5 5c-.818 0-1.563-.404-2.143-1.063L12 15.5l-.857.937c-.58.659-1.325 1.063-2.143 1.063z" fill="#764ABC"/>
              </svg>
              <span className="font-mono text-sm text-muted group-hover:text-white transition-colors">
                Llama
              </span>
            </div>
          </div>
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
    </section>
  );
}
