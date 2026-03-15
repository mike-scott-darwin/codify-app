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
        a: "Codify turns your business knowledge into AI-powered content. You build reference files (your soul, offer, audience, and voice), then every output — ads, emails, social posts — is informed by who you actually are. Not generic. Yours.",
      },
      {
        q: "What are reference files?",
        a: "Four core files that teach AI about your business. Soul (why you exist), Offer (what you sell), Audience (who you serve), Voice (how you sound). The stronger these files, the better every output.",
      },
      {
        q: "How do I start?",
        a: "Go to Build and complete the interview for each file. The interview asks guided questions, then AI enriches your answers into a full reference file. Start with Soul — it's the foundation.",
      },
    ],
  },
  {
    title: "The Compounding Loop",
    icon: "↻",
    items: [
      {
        q: "What is the compounding loop?",
        a: "Build → Research → Create → Publish → Automate. Each cycle makes your reference files stronger, which makes every future output better. The sidebar follows this exact order.",
      },
      {
        q: "How does research improve my files?",
        a: "In Research, you explore topics and make decisions. When you mark a topic as 'decided', you can Codify it — AI proposes updates to your reference files based on what you learned. Apply the updates, and your files get sharper.",
      },
      {
        q: "What does Codify mean?",
        a: "Codify means turning a research decision into a reference file update. AI reads your decision and your current files, then proposes how to weave the new insight in. You review and apply per file.",
      },
    ],
  },
  {
    title: "Build (Reference Files)",
    icon: "1",
    items: [
      {
        q: "How do I build a reference file?",
        a: "Click Build in the sidebar, then Start Interview on any file. Answer the guided questions. When done, preview your file and click Enrich with AI to expand it.",
      },
      {
        q: "Can I edit files directly?",
        a: "Yes. Click Edit on any file to open the markdown editor. Changes save to your GitHub repo if connected.",
      },
      {
        q: "What is the Context Power Score?",
        a: "A score from 0-100 measuring how complete your reference files are. Higher scores mean better AI outputs. It checks word count, structure, specificity, and depth.",
      },
    ],
  },
  {
    title: "Research",
    icon: "2",
    items: [
      {
        q: "How does research work?",
        a: "Create a topic, take notes, and use the AI Research Assistant to explore questions. Move topics through the pipeline: Research → Deciding → Decided → Codified.",
      },
      {
        q: "What is Deep Research?",
        a: "A multi-step agent that generates research questions, answers them from multiple angles, synthesizes findings, and provides recommendations. Find it on any research topic or in Automate.",
      },
    ],
  },
  {
    title: "Create (Generate)",
    icon: "3",
    items: [
      {
        q: "What can I generate?",
        a: "Social posts, ad copy, email sequences, VSL scripts, and landing pages. Each uses your reference files so the output sounds like you.",
      },
      {
        q: "What is Campaign Mode?",
        a: "Multi-step agents that produce complete campaigns instead of single outputs. Ad Campaign gives you 9 hooks and 5 ranked ads. Email Campaign builds a full sequence with timing.",
      },
    ],
  },
  {
    title: "Publish",
    icon: "4",
    items: [
      {
        q: "How do I publish content?",
        a: "Connect platforms in Settings (GoHighLevel, Postiz, Buffer, Mailchimp, or Webhooks). Then on any output, click Publish to send it directly to that platform.",
      },
      {
        q: "Can I publish to multiple platforms?",
        a: "Yes. Each output shows all your connected platforms that support that content type. Publish to as many as you want.",
      },
    ],
  },
  {
    title: "Automate (Agents)",
    icon: "5",
    items: [
      {
        q: "What are agents?",
        a: "Multi-step AI workflows that go beyond single prompts. They run 4-5 steps automatically: analyzing, generating, reviewing, and ranking. You see live progress and get a complete result.",
      },
      {
        q: "What agents are available?",
        a: "Congruence Audit (checks your files for alignment), Ad Campaign (9 hooks, 5 ranked ads), Deep Research (multi-angle exploration), Content Calendar (5 days of posts), Email Campaign (full sequence with arc).",
      },
    ],
  },
  {
    title: "Settings & Integrations",
    icon: "⚙",
    items: [
      {
        q: "Can I use my own AI model?",
        a: "Yes. In Settings > AI Provider, choose OpenAI, Anthropic, or Ollama (local). Bring your own API key and every feature uses your chosen model.",
      },
      {
        q: "How do I connect GitHub?",
        a: "In Settings > GitHub Repository, enter a Personal Access Token (with repo scope), your username, and repo name. Click Connect. Your reference files will be committed to reference/core/ in your repo.",
      },
      {
        q: "What platforms can I connect?",
        a: "GoHighLevel (email/SMS), Postiz (social scheduling), Buffer (social), Mailchimp (email campaigns), and generic Webhooks. Each needs an API key configured in Settings.",
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
        How Codify works, step by step.
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
                {openSection === si ? "−" : "+"}
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
                        <span className="font-mono text-xs text-[#333] ml-4">{isOpen ? "−" : "+"}</span>
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
            1. Start building reference files →
          </Link>
          <Link href="/dashboard/research" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            2. Start a research topic →
          </Link>
          <Link href="/dashboard/generate" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            3. Generate your first output →
          </Link>
          <Link href="/dashboard/settings" className="font-mono text-sm text-[#a0a0a0] hover:text-white transition-colors">
            Connect platforms →
          </Link>
        </div>
      </div>
    </>
  );
}