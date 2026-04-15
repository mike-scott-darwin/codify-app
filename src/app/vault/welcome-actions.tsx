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
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💬</span>
          <h3 className="text-base font-sans font-bold text-blue">Talk it through</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          I'll ask simple questions about your business. You talk, I build your profile. Most people start here.
        </p>
        <p className="text-xs text-dim mt-3">~ 30 minutes</p>
      </button>
      <button
        onClick={() => openWithPrompt("/import")}
        className="text-left bg-surface border border-border rounded-xl p-6 hover:border-blue/40 transition-colors group"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📄</span>
          <h3 className="text-base font-sans font-bold text-blue">Import what you have</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Already have website copy, proposals, or brand docs? Paste them in and I'll extract the key information.
        </p>
        <p className="text-xs text-dim mt-3">~ 10 minutes</p>
      </button>
    </div>
  );
}
