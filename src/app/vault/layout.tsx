"use client";

import { useState, useRef, useEffect } from "react";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import CommandPalette from "@/components/vault/command-palette";
import VaultSidebar, { ActivityRibbon, TreePanel } from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import ChatPanel from "@/components/vault/chat-panel";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [treePanelOpen, setTreePanelOpen] = useState(true);
  const [treePanelW, setTreePanelW] = useState(220);
  const [chatW, setChatW] = useState(384);
  const dragRef = useRef<{ target: "tree" | "chat"; startX: number; startW: number } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const { target, startX, startW } = dragRef.current;
      if (target === "tree") {
        const delta = e.clientX - startX;
        setTreePanelW(Math.min(360, Math.max(160, startW + delta)));
      } else {
        const delta = startX - e.clientX;
        setChatW(Math.min(600, Math.max(280, startW + delta)));
      }
    }
    function onUp() {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function startDrag(target: "tree" | "chat", e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = {
      target,
      startX: e.clientX,
      startW: target === "tree" ? treePanelW : chatW,
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <ChatDrawerProvider>
      <CommandPalette />
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Activity Ribbon — always visible on desktop */}
        <div className="hidden md:flex">
          <ActivityRibbon
            treePanelOpen={treePanelOpen}
            onToggleTreePanel={() => setTreePanelOpen(!treePanelOpen)}
          />
        </div>

        {/* Tree Panel — collapsible file browser */}
        {treePanelOpen && (
          <div
            className="hidden md:flex flex-col shrink-0 h-full border-r border-border"
            style={{ width: treePanelW }}
          >
            <TreePanel embedded />
          </div>
        )}

        {/* Gutter: tree panel | content */}
        {treePanelOpen && (
          <div
            onMouseDown={(e) => startDrag("tree", e)}
            className="hidden md:block w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-blue/30 active:bg-blue/60 transition-colors"
          />
        )}

        {/* Center — content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar clientName="" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Gutter: content | chat */}
        <div
          onMouseDown={(e) => startDrag("chat", e)}
          className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-blue/30 active:bg-blue/60 transition-colors"
        />

        {/* Right — LLM chat */}
        <div
          className="hidden lg:flex flex-col shrink-0 h-full"
          style={{ width: chatW }}
        >
          <ChatPanel width={chatW} embedded />
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
