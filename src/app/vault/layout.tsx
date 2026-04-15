"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import CommandPalette from "@/components/vault/command-palette";
import VaultSidebar, { ActivityRibbon, TreePanel } from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import AiSidePanel from "@/components/vault/ai-side-panel";
import ChatPanel from "@/components/vault/chat-panel";
import type { RibbonPanel } from "@/components/vault/types";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<RibbonPanel>("files");
  const pathname = usePathname();
  const router = useRouter();

  // When navigating to agents via URL (not ribbon click), show AI panel
  useEffect(() => {
    if (pathname.startsWith("/vault/agents") && activePanel !== "files") {
      setActivePanel("ai");
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePanel(panel: "files" | "ai") {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      switch (e.key.toLowerCase()) {
        case "q":
          // Toggle sidebar
          setActivePanel((prev) => (prev === "files" ? null : "files"));
          break;
        case "h":
          // Go home
          router.push("/vault");
          break;
        case "s":
          // Open search (Cmd+K handled by command palette, but S alone also works)
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            // Dispatch Cmd+K to trigger command palette
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            );
          }
          break;
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

        {/* Side panel — files or AI */}
        {activePanel === "files" && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[220px] border-r border-border">
            <TreePanel />
          </div>
        )}
        {activePanel === "ai" && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[260px] border-r border-border">
            <AiSidePanel />
          </div>
        )}

        {/* Content — full remaining width */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Mobile: chat overlay + sidebar overlay */}
        <ChatPanel />
        <div className="md:hidden">
          <VaultSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
    </ChatDrawerProvider>
  );
}
