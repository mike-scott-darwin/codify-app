"use client";

import { useChatDrawer } from "./chat-drawer-provider";
import ChatCore from "./chat-core";

export default function ChatDrawer() {
  const { isOpen, toggle, pendingPrompt, clearPendingPrompt } = useChatDrawer();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={toggle}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full z-50 w-full sm:w-96 bg-surface border-l border-border transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-12 border-b border-border flex items-center justify-between px-4">
          <h3 className="text-sm font-sans font-bold text-blue">
            Pocket Architect
          </h3>
          <button
            onClick={toggle}
            className="text-muted hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>
        </div>
        <ChatCore
          className="h-[calc(100%-3rem)]"
          initialPrompt={pendingPrompt}
          onPromptConsumed={clearPendingPrompt}
        />
      </div>
    </>
  );
}
