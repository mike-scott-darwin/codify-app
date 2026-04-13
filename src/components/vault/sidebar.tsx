"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import SettingsModal from "./settings-modal";

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

const NAV_ITEMS = [
  { id: "dashboard", href: "/vault", icon: "◫", label: "Dashboard" },
  { id: "activity", href: "/vault/activity", icon: "◔", label: "Activity" },
  { id: "pipeline", href: "/vault/pipeline", icon: "▥", label: "Pipeline" },
] as const;

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
  const pl = depth * 12 + 12;

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center gap-2 py-1.5 text-sm hover:bg-[#1a1a1a] transition-colors text-left ${
          expanded ? "text-foreground" : "text-muted"
        }`}
        style={{ paddingLeft: `${pl}px`, paddingRight: "12px" }}
      >
        <span className="text-dim text-xs w-3 shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
        {node.icon && (
          <span className={`text-xs ${node.color || "text-muted"}`}>{node.icon}</span>
        )}
        {!node.icon && (
          <span className="text-amber text-xs">📁</span>
        )}
        <span className="truncate">{displayName}</span>
      </button>

      {expanded && (
        <div>
          {loading && (
            <p className="text-xs text-dim py-1" style={{ paddingLeft: `${pl + 24}px` }}>
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
                className={`flex items-center gap-2 py-1 text-sm transition-colors ${
                  pathname === `/vault/${child.path}`
                    ? "text-blue bg-blue/5"
                    : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                }`}
                style={{ paddingLeft: `${(depth + 1) * 12 + 12 + 12}px`, paddingRight: "12px" }}
              >
                <span className={`text-xs ${child.name.endsWith(".md") ? "text-blue" : "text-dim"}`}>
                  {child.name.endsWith(".md") ? "◆" : "·"}
                </span>
                <span className="truncate text-xs">
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

/* ─── Activity Ribbon (narrow icon strip) ─── */

export function ActivityRibbon({
  treePanelOpen,
  onToggleTreePanel,
}: {
  treePanelOpen: boolean;
  onToggleTreePanel: () => void;
}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isFilesActive = !NAV_ITEMS.some((n) => pathname === n.href) || treePanelOpen && !NAV_ITEMS.some((n) => pathname === n.href);

  return (
    <div className="flex flex-col h-full w-[52px] bg-[#0d0d0d] border-r border-border shrink-0">
      {/* Logo / Home */}
      <Link
        href="/vault"
        className="flex items-center justify-center h-12 border-b border-border text-foreground hover:text-blue transition-colors"
        title="Codify Vault"
      >
        <span className="text-lg font-bold">C</span>
      </Link>

      {/* Nav icons */}
      <div className="flex flex-col items-center py-3 gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={`relative flex items-center justify-center w-9 h-9 rounded-lg text-base transition-colors ${
                active
                  ? "text-blue bg-blue/10"
                  : "text-dim hover:text-foreground hover:bg-[#1a1a1a]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue rounded-r-full" />
              )}
              <span>{item.icon}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-6 h-px bg-border my-1" />

        {/* Files toggle */}
        <button
          onClick={onToggleTreePanel}
          title={treePanelOpen ? "Collapse files" : "Expand files"}
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg text-base transition-colors ${
            treePanelOpen || isFilesActive
              ? "text-blue bg-blue/10"
              : "text-dim hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          {(treePanelOpen || isFilesActive) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue rounded-r-full" />
          )}
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 4h5l2 2h7a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" />
          </svg>
        </button>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col items-center py-3 gap-1">
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-dim hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3.5a1 1 0 00-1 1v.3a1.7 1.7 0 01-1 1.5 1.7 1.7 0 01-1.8-.2l-.2-.2a1 1 0 10-1.4 1.4l.2.2a1.7 1.7 0 01.2 1.8 1.7 1.7 0 01-1.5 1H4.5a1 1 0 000 2h.3a1.7 1.7 0 011.5 1 1.7 1.7 0 01-.2 1.8l-.2.2a1 1 0 101.4 1.4l.2-.2a1.7 1.7 0 011.8-.2 1.7 1.7 0 011 1.5v.3a1 1 0 002 0v-.3a1.7 1.7 0 011-1.5 1.7 1.7 0 011.8.2l.2.2a1 1 0 101.4-1.4l-.2-.2a1.7 1.7 0 01-.2-1.8 1.7 1.7 0 011.5-1h.3a1 1 0 000-2h-.3a1.7 1.7 0 01-1.5-1 1.7 1.7 0 01.2-1.8l.2-.2a1 1 0 10-1.4-1.4l-.2.2a1.7 1.7 0 01-1.8.2 1.7 1.7 0 01-1-1.5v-.3a1 1 0 00-1 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
        </button>

        <form action="/vault/auth/signout" method="POST">
          <button
            type="submit"
            title="Sign out"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-dim hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4M9 16l-4-4m0 0l4-4m-4 4h11" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

/* ─── Tree Panel (file browser) ─── */

function TreePanelContent({ onClose }: { onClose: () => void }) {
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
    <>
      <div className="px-3 py-3 border-b border-border">
        <span className="text-xs font-medium text-dim uppercase tracking-wider">Files</span>
      </div>

      {/* Onboarding section */}
      <div className="border-b border-border py-2">
        <button
          onClick={() => setOnboardingOpen(!onboardingOpen)}
          className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm transition-colors text-left ${
            onboardingOpen ? "text-blue" : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
          }`}
        >
          <span className="text-xs">{onboardingOpen ? "▼" : "▶"}</span>
          <span className="text-blue text-xs">◈</span>
          Getting Started
        </button>
        {onboardingOpen && (
          <div className="pl-4">
            {ONBOARDING_FILES.map((file) => (
              <Link
                key={file.path}
                href={`/vault/${file.path}`}
                onClick={onClose}
                className={`flex items-center gap-2 py-1 text-sm transition-colors ${
                  pathname === `/vault/${file.path}`
                    ? "text-blue bg-blue/5"
                    : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                }`}
                style={{ paddingLeft: "24px", paddingRight: "12px" }}
              >
                <span className="text-blue text-xs">{file.icon}</span>
                <span className="truncate text-xs">{file.name}</span>
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
    </>
  );
}

export function TreePanel({ embedded }: { embedded?: boolean }) {
  if (embedded) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
        <TreePanelContent onClose={() => {}} />
      </div>
    );
  }
  return null;
}

/* ─── Mobile Sidebar (combined ribbon + tree for overlay) ─── */

export default function VaultSidebar({
  isOpen,
  onClose,
  embedded,
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
    if (!isOpen && !embedded) return;
    fetch("/api/vault?action=depth")
      .then(r => r.ok ? r.json() : [])
      .then((data: { file: string; level: string }[]) => {
        const map: Record<string, string> = {};
        for (const d of data) map[d.file] = d.level;
        setContextDepth(map);
      })
      .catch(() => {});
  }, [isOpen, embedded]);

  // On desktop, the ribbon + tree panel are rendered separately in layout
  if (embedded) return null;

  // Mobile overlay — full sidebar with nav + tree combined
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
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-1.5 text-sm transition-colors ${
                pathname === item.href ? "text-blue bg-blue/5" : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Onboarding section */}
        <div className="border-b border-border py-2">
          <button
            onClick={() => setOnboardingOpen(!onboardingOpen)}
            className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm transition-colors text-left ${
              onboardingOpen ? "text-blue" : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
            }`}
          >
            <span className="text-xs">{onboardingOpen ? "▼" : "▶"}</span>
            <span className="text-blue text-xs">◈</span>
            Getting Started
          </button>
          {onboardingOpen && (
            <div className="pl-4">
              {ONBOARDING_FILES.map((file) => (
                <Link
                  key={file.path}
                  href={`/vault/${file.path}`}
                  onClick={onClose}
                  className={`flex items-center gap-2 py-1 text-sm transition-colors ${
                    pathname === `/vault/${file.path}`
                      ? "text-blue bg-blue/5"
                      : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                  }`}
                  style={{ paddingLeft: "24px", paddingRight: "12px" }}
                >
                  <span className="text-blue text-xs">{file.icon}</span>
                  <span className="truncate text-xs">{file.name}</span>
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
          <p className="px-4 py-1 text-xs font-medium text-dim uppercase tracking-wider">Files</p>
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

        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </aside>
    </>
  );
}
