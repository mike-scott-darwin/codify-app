"use client";

import { useState } from "react";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import VaultSidebar from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import ChatPanel from "@/components/vault/chat-panel";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ChatDrawerProvider>
      <div className="flex h-screen bg-background text-foreground">
        {/* Left — File tree */}
        <VaultSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center — Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar
            clientName=""
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Right — Pocket Architect (always visible on desktop) */}
        <ChatPanel />
      </div>
    </ChatDrawerProvider>
  );
}
