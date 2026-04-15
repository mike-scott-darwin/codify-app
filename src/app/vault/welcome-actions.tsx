"use client";

import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

export default function WelcomeActions() {
  const { openWithPrompt } = useChatDrawer();

  return (
    <button
      onClick={() => openWithPrompt("/extract soul")}
      className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue to-purple rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
    >
      Get Started
    </button>
  );
}
