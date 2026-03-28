const prereqs = [
  {
    name: "Claude Desktop",
    description:
      "Download the Claude app. Claude Code is built in — no terminal or coding experience needed.",
    price: "Free download",
    url: "https://claude.ai/download",
    linkLabel: "Download Claude",
  },
  {
    name: "Claude Pro",
    description:
      "Subscribe to Claude Pro to unlock Claude Code inside the desktop app.",
    price: "$20/mo",
    url: "https://claude.ai/settings/billing",
    linkLabel: "Get Claude Pro",
  },
  {
    name: "Obsidian",
    description:
      "Your private knowledge base. Runs locally — your data never leaves your device.",
    price: "Free",
    url: "https://obsidian.md/download",
    linkLabel: "Download Obsidian",
  },
];

function ClaudeDesktopGraphic() {
  return (
    <div className="mt-5 rounded-lg border border-border overflow-hidden bg-[#1a1a1a]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-dim ml-2">Claude Desktop</span>
      </div>
      <div className="flex border-b border-border">
        <div className="px-5 py-2.5 text-xs text-dim border-b-2 border-transparent">
          Chat
        </div>
        <div className="px-5 py-2.5 text-xs text-dim border-b-2 border-transparent">
          Cowork
        </div>
        <div className="px-5 py-2.5 text-xs font-semibold text-blue border-b-2 border-blue">
          Code &larr; Click here
        </div>
      </div>
      <div className="px-4 py-4 font-mono text-xs leading-relaxed">
        <p className="text-dim">
          <span className="text-green">$</span>{" "}
          <span className="text-white">cd ~/codify-trial-vault</span>
        </p>
        <p className="text-dim mt-1">
          <span className="text-green">$</span>{" "}
          <span className="text-white">/start</span>
          <span className="inline-block w-1.5 h-3.5 bg-blue ml-0.5 animate-pulse" />
        </p>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "01",
    title: "Install Obsidian",
    description:
      "Download and install Obsidian — your private knowledge base where your vault lives.",
    details: [
      "Available on Mac, Windows, Linux, iOS, and Android",
      "Free for personal use",
      "Your data stays on your machine",
    ],
  },
  {
    number: "02",
    title: "Download & Open the Codify Vault",
    description:
      "Download the vault ZIP below, unzip it, then open the folder in Obsidian. Click \"Open folder as vault\" — do NOT create a new vault.",
    details: [
      "Includes sample context files so you can see what a completed vault looks like",
      "Plugins pre-installed: Git sync, Templater, Dataview — click \"Trust author and enable plugins\" when prompted",
      "Your samples will be replaced with your own business context when you run /start",
    ],
  },
  {
    number: "03",
    title: "Run /start in Claude Code",
    description:
      "Keep Obsidian open — that's where your files live. Now open Claude Desktop alongside it. This is a separate app where you'll talk to the AI.",
    details: [
      "Open Claude Desktop and sign in with your Claude Pro account",
      "Click the \"Code\" tab at the top of the window (not Chat or Cowork)",
      "You'll see a terminal. Type: cd path/to/codify-trial-vault (use the folder where you unzipped the vault)",
      "Press Enter, then type: /start",
      "The AI will ask you questions about your business and fill in your vault — guided, step by step, about 30 minutes",
    ],
  },
];

export default function Setup() {
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
          <a
            href="/"
            className="text-sm text-muted hover:text-white transition-colors"
          >
            Back to site
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-8 md:pt-36 md:pb-12">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-3">
            YOU&apos;RE IN
          </p>
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            Here&apos;s What to Do
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Download the vault and follow the 3 steps below.
          </p>
        </div>
      </section>

      {/* Vault download */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-[520px] mx-auto px-6 md:px-12">
          <div className="bg-surface border border-green/30 rounded-xl p-6 md:p-8 text-center">
            <div className="text-3xl mb-3">&#x2713;</div>
            <h2 className="font-bold text-white text-lg mb-2">
              Download the Vault
            </h2>
            <p className="text-muted text-sm mb-6">
              Unzip it, then open the folder in Obsidian. The sample files
              inside show you what a completed vault looks like — they&apos;ll
              be replaced with yours when you run /start.
            </p>
            <a
              href="/codify-vault.zip"
              download
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-blue text-black font-semibold text-sm px-8 py-3.5 rounded-lg hover:brightness-110 transition-all"
            >
              Download Vault ZIP
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v9M4 8l4 4 4-4M2 14h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <p className="text-xs text-muted mt-4">
              Then open Obsidian &rarr; &quot;Open folder as vault&quot; &rarr;
              select the unzipped folder
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="pb-8 md:pb-12">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <h2 className="font-bold text-white text-lg mb-4">What You Need</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {prereqs.map((req) => (
              <div
                key={req.name}
                className="bg-surface border border-border rounded-xl p-5"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">
                    {req.name}
                  </h3>
                  <span className="text-xs text-blue font-semibold">
                    {req.price}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  {req.description}
                </p>
                <a
                  href={req.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue hover:underline"
                >
                  {req.linkLabel} &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-10 md:pb-16">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <h2 className="font-bold text-white text-lg mb-4">
            Setup in 3 Steps
          </h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-surface border border-border rounded-xl p-6 md:p-8"
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="text-3xl md:text-4xl font-bold text-white/10 shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-green shrink-0 mt-0.5">
                            &#x2713;
                          </span>
                          <span className="text-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                    {step.number === "03" && <ClaudeDesktopGraphic />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help */}
      <section className="pb-10 md:pb-16">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
            <h3 className="font-bold text-white text-lg mb-2">Need Help?</h3>
            <p className="text-muted text-sm mb-4">
              Stuck on setup or have questions?
            </p>
            <a
              href="https://codify.build/#faq"
              className="text-blue text-sm hover:underline"
            >
              Check the FAQ
            </a>
            <span className="text-dim text-sm mx-3">or</span>
            <a
              href="mailto:hello@codify.build"
              className="text-blue text-sm hover:underline"
            >
              hello@codify.build
            </a>
          </div>
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
