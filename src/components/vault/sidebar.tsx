"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import SettingsModal from "./settings-modal";
import type { RibbonPanel } from "./types";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
}

const VAULT_FOLDERS = [
  { name: "reference", path: "reference", label: "Context", icon: "◆", color: "text-blue" },
  { name: "decisions", path: "decisions", label: "Decisions", icon: "⚡", color: "text-green" },
  { name: "research", path: "research", label: "Research", icon: "◎", color: "text-amber" },
  { name: "outputs", path: "outputs", label: "Outputs", icon: "□", color: "text-purple" },
  { name: "content", path: "content", label: "Content", icon: "✎", color: "text-cyan" },
  { name: "whatsapp", path: "whatsapp", label: "Pocket Architect", icon: "◈", color: "text-blue" },
  { name: "snapshots", path: "snapshots", label: "Snapshots", icon: "◇", color: "text-muted" },
];

const ONBOARDING_FILES = [
  { name: "Getting Started", path: "ONBOARDING.md", icon: "◈" },
  { name: "Soul — Your Identity", path: "reference/core/soul.md", icon: "◆" },
  { name: "Audience — Who Buys", path: "reference/core/audience.md", icon: "◆" },
  { name: "Offer — Your Value", path: "reference/core/offer.md", icon: "◆" },
  { name: "Voice — How You Sound", path: "reference/core/voice.md", icon: "◆" },
];

const HIDDEN_FOLDERS = new Set(["archive", ".context", ".claude", ".openclaw", ".obsidian"]);

/* ─── Folder tree node ─── */

function FolderNode({
  node,
  depth = 0,
  onClose,
}: {
  node: { name: string; path: string; label?: string; icon?: string; color?: string };
  depth?: number;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const loadChildren = useCallback(async () => {
    if (children.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vault?action=list&path=${encodeURIComponent(node.path)}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = (data as FileNode[])
          .filter((f: FileNode) => !(f.type === "dir" && HIDDEN_FOLDERS.has(f.name)))
          .sort((a: FileNode, b: FileNode) => {
            if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
        setChildren(sorted);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [node.path, children.length]);

  function handleToggle() {
    if (!expanded) loadChildren();
    setExpanded(!expanded);
  }

  const displayName = node.label || node.name;
  const pl = depth * 14 + 16;

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center gap-2.5 py-2 text-[13px] hover:bg-[#1a1a1a] transition-colors text-left ${
          expanded ? "text-foreground" : "text-muted"
        }`}
        style={{ paddingLeft: `${pl}px`, paddingRight: "16px" }}
      >
        <span className="text-dim text-[10px] w-3 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
        {node.icon && (
          <span className={`text-sm ${node.color || "text-muted"}`}>{node.icon}</span>
        )}
        {!node.icon && (
          <span className="text-amber text-sm">📁</span>
        )}
        <span className="truncate">{displayName}</span>
      </button>

      {expanded && (
        <div>
          {loading && (
            <p className="text-xs text-dim py-1.5" style={{ paddingLeft: `${pl + 28}px` }}>
              Loading...
            </p>
          )}
          {children.map((child) =>
            child.type === "dir" ? (
              <FolderNode key={child.path} node={child} depth={depth + 1} onClose={onClose} />
            ) : (
              <Link
                key={child.path}
                href={`/vault/${child.path}`}
                onClick={onClose}
                className={`flex items-center gap-2.5 py-1.5 text-[13px] transition-colors ${
                  pathname === `/vault/${child.path}`
                    ? "text-blue bg-blue/5"
                    : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                }`}
                style={{ paddingLeft: `${(depth + 1) * 14 + 16 + 14}px`, paddingRight: "16px" }}
              >
                <span className={`text-sm ${child.name.endsWith(".md") ? "text-blue" : "text-dim"}`}>
                  {child.name.endsWith(".md") ? "◆" : "·"}
                </span>
                <span className="truncate">
                  {child.name.replace(".md", "")}
                </span>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Activity Ribbon ─── */

export function ActivityRibbon({
  activePanel,
  onTogglePanel,
}: {
  activePanel: RibbonPanel;
  onTogglePanel: (panel: "files" | "ai") => void;
}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isHome = pathname === "/vault";

  return (
    <div className="flex flex-col h-full w-[48px] bg-[#0a0a0a] border-r border-border shrink-0">
      {/* Home */}
      <Link
        href="/vault"
        title="Home"
        className={`flex items-center justify-center h-[48px] transition-colors ${
          isHome && !activePanel
            ? "text-blue"
            : "text-dim hover:text-foreground"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10.5L10 4l7 6.5M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Files */}
      <button
        onClick={() => onTogglePanel("files")}
        title="Files"
        className={`flex items-center justify-center h-[48px] transition-colors ${
          activePanel === "files"
            ? "text-blue"
            : "text-dim hover:text-foreground"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h5l2 2h7a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* AI */}
      <button
        onClick={() => onTogglePanel("ai")}
        title="AI"
        className={`flex items-center justify-center h-[48px] transition-colors ${
          activePanel === "ai"
            ? "text-blue"
            : "text-dim hover:text-foreground"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 12l.75 2.25L18 15l-2.25.75L15 18l-.75-2.25L12 15l2.25-.75L15 12z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Settings */}
      <div className="mt-auto flex flex-col items-center pb-3">
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="flex items-center justify-center w-[48px] h-[48px] text-dim hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3.5a1 1 0 00-1 1v.3a1.7 1.7 0 01-1 1.5 1.7 1.7 0 01-1.8-.2l-.2-.2a1 1 0 10-1.4 1.4l.2.2a1.7 1.7 0 01.2 1.8 1.7 1.7 0 01-1.5 1H4.5a1 1 0 000 2h.3a1.7 1.7 0 011.5 1 1.7 1.7 0 01-.2 1.8l-.2.2a1 1 0 101.4 1.4l.2-.2a1.7 1.7 0 011.8-.2 1.7 1.7 0 011 1.5v.3a1 1 0 002 0v-.3a1.7 1.7 0 011-1.5 1.7 1.7 0 011.8.2l.2.2a1 1 0 101.4-1.4l-.2-.2a1.7 1.7 0 01-.2-1.8 1.7 1.7 0 011.5-1h.3a1 1 0 000-2h-.3a1.7 1.7 0 01-1.5-1 1.7 1.7 0 01.2-1.8l.2-.2a1 1 0 10-1.4-1.4l-.2.2a1.7 1.7 0 01-1.8.2 1.7 1.7 0 01-1-1.5v-.3a1 1 0 00-1 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
        </button>
      </div>

      {settingsOpen && (
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

/* ─── Tree Panel ─── */

export function TreePanel() {
  const pathname = usePathname();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [contextDepth, setContextDepth] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/vault?action=depth")
      .then(r => r.ok ? r.json() : [])
      .then((data: { file: string; level: string }[]) => {
        const map: Record<string, string> = {};
        for (const d of data) map[d.file] = d.level;
        setContextDepth(map);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
      {/* Onboarding */}
      <div className="border-b border-border py-2">
        <button
          onClick={() => setOnboardingOpen(!onboardingOpen)}
          className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-colors text-left ${
            onboardingOpen ? "text-blue" : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <span className="text-[10px]">{onboardingOpen ? "▼" : "▶"}</span>
          <span className="text-blue text-sm">◈</span>
          Getting Started
        </button>
        {onboardingOpen && (
          <div>
            {ONBOARDING_FILES.map((file) => (
              <Link
                key={file.path}
                href={`/vault/${file.path}`}
                className={`flex items-center gap-2.5 py-1.5 text-[13px] transition-colors ${
                  pathname === `/vault/${file.path}`
                    ? "text-blue bg-blue/5"
                    : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                }`}
                style={{ paddingLeft: "40px", paddingRight: "16px" }}
              >
                <span className="text-blue text-sm">{file.icon}</span>
                <span className="truncate">{file.name}</span>
                {file.path.startsWith("reference/core/") && contextDepth[file.path] && (
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ml-auto shrink-0 ${
                    contextDepth[file.path] === "deep" ? "bg-green" :
                    contextDepth[file.path] === "growing" ? "bg-amber" : "bg-red/50"
                  }`} />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {VAULT_FOLDERS.map((folder) => (
          <FolderNode key={folder.path} node={folder} depth={0} onClose={() => {}} />
        ))}
      </div>

      {/* Sign out — tucked at bottom of tree panel */}
      <div className="p-3 border-t border-border">
        <form action="/vault/auth/signout" method="POST">
          <button type="submit" className="text-xs text-dim hover:text-muted transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Mobile Sidebar ─── */

export default function VaultSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [contextDepth, setContextDepth] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/vault?action=depth")
      .then(r => r.ok ? r.json() : [])
      .then((data: { file: string; level: string }[]) => {
        const map: Record<string, string> = {};
        for (const d of data) map[d.file] = d.level;
        setContextDepth(map);
      })
      .catch(() => {});
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border">
          <Link href="/vault" className="font-sans font-bold text-foreground text-lg" onClick={onClose}>
            Codify Vault
          </Link>
        </div>

        <div className="border-b border-border py-2">
          <Link
            href="/vault"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              pathname === "/vault" ? "text-blue bg-blue/5" : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10.5L10 4l7 6.5M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Home
          </Link>
        </div>

        <div className="border-b border-border py-2">
          <button
            onClick={() => setOnboardingOpen(!onboardingOpen)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${
              onboardingOpen ? "text-blue" : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
            }`}
          >
            <span className="text-xs">{onboardingOpen ? "▼" : "▶"}</span>
            <span className="text-blue text-sm">◈</span>
            Getting Started
          </button>
          {onboardingOpen && (
            <div>
              {ONBOARDING_FILES.map((file) => (
                <Link
                  key={file.path}
                  href={`/vault/${file.path}`}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 py-1.5 text-sm transition-colors ${
                    pathname === `/vault/${file.path}`
                      ? "text-blue bg-blue/5"
                      : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                  }`}
                  style={{ paddingLeft: "40px", paddingRight: "16px" }}
                >
                  <span className="text-blue text-sm">{file.icon}</span>
                  <span className="truncate">{file.name}</span>
                  {file.path.startsWith("reference/core/") && contextDepth[file.path] && (
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ml-auto shrink-0 ${
                      contextDepth[file.path] === "deep" ? "bg-green" :
                      contextDepth[file.path] === "growing" ? "bg-amber" : "bg-red/50"
                    }`} />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {VAULT_FOLDERS.map((folder) => (
            <FolderNode key={folder.path} node={folder} depth={0} onClose={onClose} />
          ))}
        </div>

        <div className="p-3 border-t border-border flex items-center justify-between">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 text-xs text-dim hover:text-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3.5a1 1 0 00-1 1v.3a1.7 1.7 0 01-1 1.5 1.7 1.7 0 01-1.8-.2l-.2-.2a1 1 0 10-1.4 1.4l.2.2a1.7 1.7 0 01.2 1.8 1.7 1.7 0 01-1.5 1H4.5a1 1 0 000 2h.3a1.7 1.7 0 011.5 1 1.7 1.7 0 01-.2 1.8l-.2.2a1 1 0 101.4 1.4l.2-.2a1.7 1.7 0 011.8-.2 1.7 1.7 0 011 1.5v.3a1 1 0 002 0v-.3a1.7 1.7 0 011-1.5 1.7 1.7 0 011.8.2l.2.2a1 1 0 101.4-1.4l-.2-.2a1.7 1.7 0 01-.2-1.8 1.7 1.7 0 011.5-1h.3a1 1 0 000-2h-.3a1.7 1.7 0 01-1.5-1 1.7 1.7 0 01.2-1.8l.2-.2a1 1 0 10-1.4-1.4l-.2.2a1.7 1.7 0 01-1.8.2 1.7 1.7 0 01-1-1.5v-.3a1 1 0 00-1 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            Settings
          </button>
          <form action="/vault/auth/signout" method="POST">
            <button type="submit" className="text-xs text-dim hover:text-muted transition-colors">
              Sign out
            </button>
          </form>
        </div>

        {settingsOpen && (
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        )}
      </aside>
    </>
  );
}
