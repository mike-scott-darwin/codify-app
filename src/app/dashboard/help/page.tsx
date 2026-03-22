"use client";

import { useState } from "react";
import Link from "next/link";

interface HelpSection {
  title: string;
  icon: string;
  items: Array<{ q: string; a: string }>;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    title: "Getting Started",
    icon: "1",
    items: [
      {
        q: "What is Codify?",
        a: "Codify captures your business knowledge — what you know, who you serve, how you talk — and structures it so AI can use it. Instead of starting from scratch every time, AI reads your files first and produces work that sounds like you.",
      },
      {
        q: "What are reference files?",
        a: "Four core files that teach AI about your business. Soul (why you exist and what makes you different), Offer (what you do for clients), Audience (who you serve), and Voice (how you communicate). The more detail in these files, the better every output.",
      },
      {
        q: "How do I start?",
        a: "Go to Extract and complete the guided interview for each file. We ask questions about your business, and your answers become structured reference files. Start with Soul — it's the foundation everything else builds on.",
      },
    ],
  },
  {
    title: "The 5-Phase Architecture",
    icon: "5",
    items: [
      {
        q: "What are the 5 phases?",
        a: "Phase 1: Extraction (capture your expertise through guided interviews). Phase 2: Architecture (your knowledge structured into reference files you own). Phase 3: Scouting (AI finds opportunities by cross-referencing your expertise against market shifts). Phase 4: Scale (generate outputs — ads, proposals, content — informed by your files). Phase 5: Continuity (monthly Brain Sync keeps your files current as your business evolves).",
      },
      {
        q: "How does the compounding work?",
        a: "Every research session, every decision, every file update makes all future outputs better. Your reference files get richer over time. An ad generated today is good. The same ad generated after 3 months of compounding is exceptional — because AI has deeper context about your business.",
      },
      {
        q: "What is the Opportunity Scout?",
        a: "The Opportunity Scout cross-references your unique expertise against weekly market shifts. It surfaces revenue gaps that only someone with your specific knowledge could fill. These aren't generic opportunities — they're matches between what you know and what the market needs.",
      },
    ],
  },
  {
    title: "Extract (Reference Files)",
    icon: "1",
    items: [
      {
        q: "How do I build a reference file?",
        a: "Click Extract in the sidebar, then Start Interview on any file. Answer the guided questions about your business. When done, preview your file and save it. Each file captures a different aspect of your expertise.",
      },
      {
        q: "Can I edit files directly?",
        a: "Yes. Click Edit on any file to open the editor. Changes save to your secure workspace. You can always refine your files as your business evolves.",
      },
      {
        q: "What is the Context Power Score?",
        a: "A score from 0-100 measuring how complete your reference files are. Higher scores mean AI has more context to work with, which means better outputs. It checks depth, specificity, and completeness across all four files.",
      },
    ],
  },
  {
    title: "Research",
    icon: "2",
    items: [
      {
        q: "How does research work?",
        a: "Create a topic, explore it with the AI Research Assistant, and make decisions. When you decide something, you can Codify it — AI proposes updates to your reference files based on what you learned. This is how your files compound over time.",
      },
      {
        q: "What is Deep Research?",
        a: "A multi-step research process that explores a question from multiple angles, synthesizes findings, and gives you actionable recommendations. It's like having a research team that already knows your business.",
      },
    ],
  },
  {
    title: "Create (Generate)",
    icon: "3",
    items: [
      {
        q: "What can I generate?",
        a: "Social posts, ad copy, email sequences, VSL scripts, and landing pages. Each output uses your reference files, so the result sounds like you — not like generic AI content.",
      },
      {
        q: "Why do outputs sound like me?",
        a: "Because AI reads your soul, offer, audience, and voice files before generating anything. It knows your expertise, your audience's language, and your communication style. That's the difference between prompting and codifying.",
      },
    ],
  },
  {
    title: "Tiers & Engagement",
    icon: "$",
    items: [
      {
        q: "What can I do for free?",
        a: "Extract your knowledge (build all 4 reference files), research topics, and make decisions. The free tier demonstrates the compounding effect — your files get better every time you use the system.",
      },
      {
        q: "What is the Focus Engagement?",
        a: "A $1,497 engagement where we extract your expertise through a high-fidelity strategic interview and build your complete reference stack for you. You get Phases 1-4: extraction, architecture, opportunity scouting, and your first batch of outputs. It's the difference between building it yourself and having a Context Architect do it with you.",
      },
      {
        q: "What is Brain Sync?",
        a: "A $497/month ongoing engagement that keeps your reference files aligned as your business evolves. Monthly audits, opportunity scouting, and automated outputs. This is Phase 5 — the system that compounds without you getting busier.",
      },
    ],
  },
  {
    title: "Settings & Security",
    icon: "\u2699",
    items: [
      {
        q: "Where are my files stored?",
        a: "In a private GitHub repository that you own. Think of it as a secure folder with a complete history of every change. You keep everything — even if you stop using Codify.",
      },
      {
        q: "Can I use my own AI model?",
        a: "Yes. In Settings, choose OpenAI, Anthropic, or Ollama (local). Bring your own API key and every feature uses your chosen model. Your files work with any AI tool — that's platform independence.",
      },
      {
        q: "Is my data private?",
        a: "Yes. Your reference files live in your own private repository. We don't store your business knowledge on our servers. You own your data, your context, and your outputs.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <>
      <h1 className="font-mono text-xl font-bold mb-2">Help</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">
        How Codify works — from extraction to compounding.
      </p>

      <div className="space-y-3">
        {HELP_SECTIONS.map((section, si) => (
          <div key={section.title} className="bg-[#111111] border border-[#1a1a1a]">
            <button
              onClick={() => setOpenSection(openSection === si ? null : si)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 flex items-center justify-center border border-[#333] font-mono text-xs text-[#4a9eff]"
                >
                  {section.icon}
                </span>
                <span className="font-mono text-sm text-white font-bold">{section.title}</span>
              </div>
              <span className="font-mono text-xs text-[#6b6b6b]">
                {openSection === si ? "\u2212" : "+"}
              </span>
            </button>

            {openSection === si && (
              <div className="border-t border-[#1a1a1a] px-4 pb-4">
                {section.items.map((item) => {
                  const key = si + "-" + item.q;
                  const isOpen = openItem === key;
                  return (
                    <div key={key} className="border-b border-[#0a0a0a] last:border-0">
                      <button
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full flex items-center justify-between py-3 text-left"
                      >
                        <span className="font-mono text-sm text-[#a0a0a0]">{item.q}</span>
                        <span className="font-mono text-xs text-[#333] ml-4">{isOpen ? "\u2212" : "+"}</span>
                      </button>
                      {isOpen && (
                        <p className="font-mono text-sm text-[#6b6b6b] leading-relaxed pb-3">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-8 bg-[#111111] border border-[#1a1a1a] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/files" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            1. Extract your knowledge &rarr;
          </Link>
          <Link href="/dashboard/research" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            2. Start a research topic &rarr;
          </Link>
          <Link href="/dashboard/generate" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            3. Generate your first output &rarr;
          </Link>
          <Link href="/dashboard/upgrade" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            Learn about Focus Engagement &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
