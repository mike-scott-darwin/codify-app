"use client";

import { useChatDrawer } from "./chat-drawer-provider";
import ChatCore from "./chat-core";

export default function ChatPanel() {
  const { isOpen, toggle, pendingPrompt, clearPendingPrompt } = useChatDrawer();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Panel — always visible on lg+, slide-out on mobile */}
      <aside
        className={`
          fixed right-0 top-0 h-full z-50 w-full sm:w-96
          lg:relative lg:z-auto lg:w-96 lg:shrink-0
          bg-surface border-l border-border
          flex flex-col
          transition-transform duration-200
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-blue text-sm">◈</span>
            <h3 className="text-sm font-sans font-bold text-foreground">
              Pocket Architect
            </h3>
          </div>
          <button
            onClick={toggle}
            className="text-muted hover:text-foreground lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        </div>

        {/* Chat */}
        <ChatCore
          className="flex-1 min-h-0"
          initialPrompt={pendingPrompt}
          onPromptConsumed={clearPendingPrompt}
        />
      </aside>
    </>
  );
}
