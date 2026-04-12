"use client";

import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

const actions = [
  { label: "Brief me", prompt: "Brief me — read my core context files and recent activity, then give me a summary of where things stand." },
  { label: "Draft content", prompt: "/draft " },
  { label: "Research", prompt: "/research " },
  { label: "What needs work?", prompt: "Audit my vault — check which core files need work, what's outdated, and what's missing." },
];

export default function DashboardActions() {
  const { openWithPrompt } = useChatDrawer();

  return (
    <div className="bg-surface border border-blue/20 rounded-lg p-4">
      <h2 className="text-sm font-sans font-bold text-blue mb-3">Claude Sonnet</h2>
      <p className="text-xs text-muted mb-3">
        Your AI strategist — grounded in your vault files.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => openWithPrompt(action.prompt)}
            className="text-center px-3 py-2 text-xs bg-blue/10 text-blue border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
