"use client";

import { useState, useCallback, useRef } from "react";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import VaultSidebar from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import ChatPanel from "@/components/vault/chat-panel";
import ResizeHandle from "@/components/vault/resize-handle";

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 400;
const CHAT_MIN = 280;
const CHAT_MAX = 600;

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [chatWidth, setChatWidth] = useState(384);

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((w) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, w + delta)));
  }, []);

  const handleChatResize = useCallback((delta: number) => {
    // Dragging left = negative delta = wider chat panel
    setChatWidth((w) => Math.min(CHAT_MAX, Math.max(CHAT_MIN, w - delta)));
  }, []);

  return (
    <ChatDrawerProvider>
      <div className="flex h-screen bg-background text-foreground">
        {/* Left — File tree */}
        <VaultSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          width={sidebarWidth}
        />

        {/* Resize handle — sidebar | content */}
        <div className="hidden md:block">
          <ResizeHandle onResize={handleSidebarResize} />
        </div>

        {/* Center — Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar
            clientName=""
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Resize handle — content | chat */}
        <div className="hidden lg:block">
          <ResizeHandle onResize={handleChatResize} />
        </div>

        {/* Right — LLM chat (always visible on desktop) */}
        <ChatPanel width={chatWidth} />
      </div>
    </ChatDrawerProvider>
  );
}
