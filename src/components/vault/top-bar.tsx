"use client";

import { useChatDrawer } from "./chat-drawer-provider";

export default function VaultTopBar({
  clientName,
  onMenuToggle,
}: {
  clientName: string;
  onMenuToggle: () => void;
}) {
  const { toggle } = useChatDrawer();

  return (
    <div className="h-12 border-b border-border bg-surface flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-muted hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted hidden sm:block">{clientName}</span>
        {/* Chat toggle — only on mobile (chat panel is always visible on lg+) */}
        <button
          onClick={toggle}
          className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm bg-blue/10 text-blue border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z" />
          </svg>
          <span className="hidden sm:inline">Pocket Architect</span>
        </button>
      </div>
    </div>
  );
}
