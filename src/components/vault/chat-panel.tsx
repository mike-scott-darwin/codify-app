"use client";

import { useChatDrawer } from "./chat-drawer-provider";
import ChatCore from "./chat-core";

export default function ChatPanel({
  embedded,
}: {
  width?: number;
  embedded?: boolean;
}) {
  const { isOpen, toggle, pendingPrompt, clearPendingPrompt } = useChatDrawer();

  const header = (
    <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="text-sm font-sans font-bold text-foreground">AI</h3>
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

  // Embedded: inline in the panel area (like the file tree)
  if (embedded) {
    return (
      <div className="flex flex-col h-full w-full bg-surface overflow-hidden">
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
