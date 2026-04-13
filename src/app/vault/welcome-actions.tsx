"use client";

import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

export default function WelcomeActions() {
  const { openWithPrompt } = useChatDrawer();

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <button
        onClick={() => openWithPrompt("/extract soul")}
        className="text-left bg-surface border border-border rounded-xl p-6 hover:border-blue/40 transition-colors group"
      >
        <h3 className="text-base font-sans font-bold text-blue mb-2">Start Talking</h3>
        <p className="text-sm text-muted leading-relaxed">
          I'll ask you about your business. Your answers become the foundation.
        </p>
      </button>
      <button
        onClick={() => openWithPrompt("/import")}
        className="text-left bg-surface border border-border rounded-xl p-6 hover:border-blue/40 transition-colors group"
      >
        <h3 className="text-base font-sans font-bold text-blue mb-2">Import Existing</h3>
        <p className="text-sm text-muted leading-relaxed">
          Paste your website copy, a proposal, or any emails. I'll extract the context.
        </p>
      </button>
    </div>
  );
}
