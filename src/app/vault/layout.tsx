"use client";

import { useState } from "react";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import CommandPalette from "@/components/vault/command-palette";
import VaultSidebar, { ActivityRibbon, TreePanel } from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import ChatPanel from "@/components/vault/chat-panel";

import type { RibbonPanel } from "@/components/vault/types";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<RibbonPanel>("files");

  function togglePanel(panel: "files" | "ai") {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  return (
    <ChatDrawerProvider>
      <CommandPalette />
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Ribbon */}
        <div className="hidden md:flex">
          <ActivityRibbon
            activePanel={activePanel}
            onTogglePanel={togglePanel}
          />
        </div>

        {/* Second panel — files or AI, driven by ribbon */}
        {activePanel === "files" && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[220px] border-r border-border">
            <TreePanel />
          </div>
        )}
        {activePanel === "ai" && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[340px] border-r border-border">
            <ChatPanel embedded />
          </div>
        )}

        {/* Content — full remaining width */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar clientName="" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Mobile sidebar overlay */}
        <div className="md:hidden">
          <VaultSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
    </ChatDrawerProvider>
  );
}
