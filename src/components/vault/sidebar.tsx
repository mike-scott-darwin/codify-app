"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

/* ─── Help Panel ─── */

function HelpPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed left-[48px] top-0 h-full w-[320px] bg-surface border-r border-border z-50 overflow-y-auto shadow-2xl shadow-black/40">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-sans font-bold text-foreground">How Codify Works</h2>
          <button onClick={onClose} className="text-dim hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* What is this */}
          <div>
            <p className="text-sm text-muted leading-relaxed">
              Codify extracts what you know about your business into structured files so AI can produce work that actually sounds like you.
            </p>
          </div>

          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-blue">1</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">Have a conversation</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed ml-[34px]">
              Click <span className="text-blue font-medium">Get Started</span> on the dashboard.
              AI will ask you about your business — what you sell, who you sell to, why you started,
              and how you talk. Just answer naturally. Takes about 30 minutes.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-green/10 border border-green/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-green">2</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">Your profile builds automatically</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed ml-[34px]">
              Your answers get structured into four files:
            </p>
            <div className="ml-[34px] mt-2 space-y-1.5">
              <Link href="/vault/reference/core/soul.md" onClick={onClose} className="flex items-center gap-2 text-xs text-muted hover:text-blue transition-colors">
                <span className="text-blue">◆</span> <span className="font-medium text-foreground">Soul</span> — your story, beliefs, what makes you different
              </Link>
              <Link href="/vault/reference/core/offer.md" onClick={onClose} className="flex items-center gap-2 text-xs text-muted hover:text-blue transition-colors">
                <span className="text-green">◆</span> <span className="font-medium text-foreground">Offer</span> — what you sell, pricing, transformation
              </Link>
              <Link href="/vault/reference/core/audience.md" onClick={onClose} className="flex items-center gap-2 text-xs text-muted hover:text-blue transition-colors">
                <span className="text-amber">◆</span> <span className="font-medium text-foreground">Audience</span> — who buys, their pain, their language
              </Link>
              <Link href="/vault/reference/core/voice.md" onClick={onClose} className="flex items-center gap-2 text-xs text-muted hover:text-blue transition-colors">
                <span className="text-purple">◆</span> <span className="font-medium text-foreground">Voice</span> — your tone, phrases, how you sound
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-purple">3</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">Start creating</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed ml-[34px]">
              Once your profile is built, use <span className="text-foreground font-medium">AI agents</span> to
              generate ads, proposals, emails, and content — all in your voice, targeting your audience, explaining your offer.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Quick links */}
          <div>
            <h3 className="text-[11px] font-medium text-dim uppercase tracking-wider mb-3">Quick links</h3>
            <div className="space-y-1">
              <Link href="/vault" onClick={onClose} className="flex items-center gap-2.5 px-2 py-2 text-xs text-muted hover:text-foreground hover:bg-[#1a1a1a] rounded-md transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 10.5L10 4l7 6.5M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Dashboard
              </Link>
              <Link href="/vault/agents" onClick={onClose} className="flex items-center gap-2.5 px-2 py-2 text-xs text-muted hover:text-foreground hover:bg-[#1a1a1a] rounded-md transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                AI Agents
              </Link>
              <Link href="/vault/files" onClick={onClose} className="flex items-center gap-2.5 px-2 py-2 text-xs text-muted hover:text-foreground hover:bg-[#1a1a1a] rounded-md transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5h5l2 2h7a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Browse Files
              </Link>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <h3 className="text-[11px] font-medium text-dim uppercase tracking-wider mb-3">Keyboard shortcuts</h3>
            <div className="space-y-2">
              {[
                { keys: "⌘ K", label: "Search & commands" },
                { keys: "Q", label: "Toggle sidebar" },
                { keys: "H", label: "Go to dashboard" },
                { keys: "S", label: "Quick search" },
              ].map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{shortcut.label}</span>
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] text-dim font-mono">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-background border border-border rounded-lg p-4">
            <p className="text-xs text-muted leading-relaxed">
              Need help? Email <a href="mailto:hello@codify.build" className="text-blue hover:underline">hello@codify.build</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Workspace Switcher ─── */

function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    fetch("/api/vault?action=client")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.client_name) {
          setClientName(data.client_name);
          setInitials(
            data.client_name
              .split(" ")
              .slice(0, 2)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title={clientName || "Workspace"}
        className="flex items-center justify-center w-[48px] h-[48px] transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
          {initials || "C"}
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-full ml-2 mb-0 w-56 bg-surface border border-border rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
            {/* Current workspace */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  {initials || "C"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{clientName || "Codify"}</p>
                  <p className="text-[11px] text-dim">Current workspace</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
                onClick={() => setOpen(false)}
              >
                <svg className="w-4 h-4 text-dim" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                Add workspace
              </button>
              <form action="/vault/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-muted hover:text-foreground hover:bg-[#1a1a1a] transition-colors"
                >
                  <svg className="w-4 h-4 text-dim" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 3H7a2 2 0 00-2 2v10a2 2 0 002 2h6M10 12l4-4m0 0l-4-4m4 4H5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
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
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const isHome = pathname === "/vault";

  function handleAiToggle() {
    if (activePanel !== "ai") {
      router.push("/vault/agents");
    }
    onTogglePanel("ai");
  }

  return (
    <div className="flex flex-col h-full w-[48px] bg-[#0a0a0a] border-r border-border shrink-0">
      {/* Home */}
      <Link
        href="/vault"
        title="Home (H)"
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
        onClick={() => {
          if (pathname.startsWith("/vault/agents")) {
            router.push("/vault");
          }
          onTogglePanel("files");
        }}
        title="Files (Q)"
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
        onClick={handleAiToggle}
        title="AI Agents"
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Help */}
      <button
        onClick={() => setHelpOpen(!helpOpen)}
        title="Help"
        className={`flex items-center justify-center w-[48px] h-[48px] transition-colors ${
          helpOpen ? "text-blue" : "text-dim hover:text-foreground"
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
          <path d="M7.5 7.5a2.5 2.5 0 014.9.7c0 1.7-2.5 2.3-2.5 2.3" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.5" fill="currentColor" />
        </svg>
      </button>

      {/* Settings */}
      <button
        onClick={() => setSettingsOpen(true)}
        title="Settings"
        className="flex items-center justify-center w-[48px] h-[48px] text-dim hover:text-foreground transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3.5a1 1 0 00-1 1v.3a1.7 1.7 0 01-1 1.5 1.7 1.7 0 01-1.8-.2l-.2-.2a1 1 0 10-1.4 1.4l.2.2a1.7 1.7 0 01.2 1.8 1.7 1.7 0 01-1.5 1H4.5a1 1 0 000 2h.3a1.7 1.7 0 011.5 1 1.7 1.7 0 01-.2 1.8l-.2.2a1 1 0 101.4 1.4l.2-.2a1.7 1.7 0 011.8-.2 1.7 1.7 0 011 1.5v.3a1 1 0 002 0v-.3a1.7 1.7 0 011-1.5 1.7 1.7 0 011.8.2l.2.2a1 1 0 101.4-1.4l-.2-.2a1.7 1.7 0 01-.2-1.8 1.7 1.7 0 011.5-1h.3a1 1 0 000-2h-.3a1.7 1.7 0 01-1.5-1 1.7 1.7 0 01.2-1.8l.2-.2a1 1 0 10-1.4-1.4l-.2.2a1.7 1.7 0 01-1.8.2 1.7 1.7 0 01-1-1.5v-.3a1 1 0 00-1 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        </svg>
      </button>

      {/* Workspace switcher */}
      <div className="pb-2">
        <WorkspaceSwitcher />
      </div>

      {/* Modals */}
      {settingsOpen && (
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

/* ─── Tree Panel ─── */

export function TreePanel() {
  const pathname = usePathname();
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

  const coreFiles = [
    { name: "Soul", path: "reference/core/soul.md", icon: "◆" },
    { name: "Audience", path: "reference/core/audience.md", icon: "◆" },
    { name: "Offer", path: "reference/core/offer.md", icon: "◆" },
    { name: "Voice", path: "reference/core/voice.md", icon: "◆" },
  ];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
      {/* Core context files */}
      <div className="border-b border-border py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Your Profile</p>
        {coreFiles.map((file) => (
          <Link
            key={file.path}
            href={`/vault/${file.path}`}
            className={`flex items-center gap-2.5 py-1.5 text-[13px] transition-colors ${
              pathname === `/vault/${file.path}`
                ? "text-blue bg-blue/5"
                : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
            }`}
            style={{ paddingLeft: "16px", paddingRight: "16px" }}
          >
            <span className="text-blue text-sm">{file.icon}</span>
            <span className="truncate">{file.name}</span>
            {contextDepth[file.path] && (
              <span className={`inline-block w-1.5 h-1.5 rounded-full ml-auto shrink-0 ${
                contextDepth[file.path] === "deep" ? "bg-green" :
                contextDepth[file.path] === "growing" ? "bg-amber" : "bg-red/50"
              }`} />
            )}
          </Link>
        ))}
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {VAULT_FOLDERS.map((folder) => (
          <FolderNode key={folder.path} node={folder} depth={0} onClose={() => {}} />
        ))}
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

  const coreFiles = [
    { name: "Soul", path: "reference/core/soul.md", icon: "◆" },
    { name: "Audience", path: "reference/core/audience.md", icon: "◆" },
    { name: "Offer", path: "reference/core/offer.md", icon: "◆" },
    { name: "Voice", path: "reference/core/voice.md", icon: "◆" },
  ];

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

        {/* Core profile files */}
        <div className="border-b border-border py-2">
          <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Your Profile</p>
          {coreFiles.map((file) => (
            <Link
              key={file.path}
              href={`/vault/${file.path}`}
              onClick={onClose}
              className={`flex items-center gap-2.5 py-1.5 text-sm transition-colors ${
                pathname === `/vault/${file.path}`
                  ? "text-blue bg-blue/5"
                  : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
              }`}
              style={{ paddingLeft: "16px", paddingRight: "16px" }}
            >
              <span className="text-blue text-sm">{file.icon}</span>
              <span className="truncate">{file.name}</span>
              {contextDepth[file.path] && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full ml-auto shrink-0 ${
                  contextDepth[file.path] === "deep" ? "bg-green" :
                  contextDepth[file.path] === "growing" ? "bg-amber" : "bg-red/50"
                }`} />
              )}
            </Link>
          ))}
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
