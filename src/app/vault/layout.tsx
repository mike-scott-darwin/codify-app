"use client";

import { useState } from "react";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import CommandPalette from "@/components/vault/command-palette";
import VaultSidebar, { ActivityRibbon, TreePanel } from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import ChatPanel from "@/components/vault/chat-panel";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [treePanelOpen, setTreePanelOpen] = useState(true);

  return (
    <ChatDrawerProvider>
      <CommandPalette />
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Ribbon — always visible on desktop */}
        <div className="hidden md:flex">
          <ActivityRibbon
            treePanelOpen={treePanelOpen}
            onToggleTreePanel={() => setTreePanelOpen(!treePanelOpen)}
          />
        </div>

        {/* Tree panel — toggles instantly */}
        {treePanelOpen && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[220px] border-r border-border">
            <TreePanel />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar clientName="" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Chat panel — desktop */}
        <div className="hidden lg:flex flex-col shrink-0 h-full w-[384px]">
          <ChatPanel width={384} embedded />
        </div>

        {/* Mobile overlays */}
        <div className="md:hidden">
          <VaultSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="lg:hidden">
          <ChatPanel width={384} />
        </div>
      </div>
    </ChatDrawerProvider>
  );
}
