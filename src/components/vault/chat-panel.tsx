"use client";

import { useChatDrawer } from "./chat-drawer-provider";
import ChatCore from "./chat-core";

export default function ChatPanel({
  width = 384,
  embedded,
}: {
  width?: number;
  embedded?: boolean;
}) {
  const { isOpen, toggle, pendingPrompt, clearPendingPrompt } = useChatDrawer();

  const header = (
    <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-blue text-sm">◈</span>
        <h3 className="text-sm font-sans font-bold text-foreground">Claude Sonnet</h3>
        <span className="text-xs text-dim px-1.5 py-0.5 bg-background rounded">4.6</span>
      </div>
      {!embedded && (
        <button onClick={toggle} className="text-muted hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );

  // Desktop: embedded in flex layout
  if (embedded) {
    return (
      <div className="flex flex-col h-full w-full bg-surface border-l border-border overflow-hidden">
        {header}
        <ChatCore className="flex-1 min-h-0" initialPrompt={pendingPrompt} onPromptConsumed={clearPendingPrompt} />
      </div>
    );
  }

  // Mobile: overlay
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={toggle} />}
      <aside
        className={`fixed right-0 top-0 h-full z-50 w-full sm:w-96 bg-surface border-l border-border flex flex-col transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {header}
        <ChatCore className="flex-1 min-h-0" initialPrompt={pendingPrompt} onPromptConsumed={clearPendingPrompt} />
      </aside>
    </>
  );
}
