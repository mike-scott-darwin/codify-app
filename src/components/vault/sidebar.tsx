"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
}

// Top-level vault folders to show in tree
const VAULT_FOLDERS = [
  { name: "reference", path: "reference", label: "Context", icon: "◆", color: "text-blue" },
  { name: "decisions", path: "decisions", label: "Decisions", icon: "⚡", color: "text-green" },
  { name: "research", path: "research", label: "Research", icon: "◎", color: "text-amber" },
  { name: "outputs", path: "outputs", label: "Outputs", icon: "□", color: "text-purple" },
  { name: "content", path: "content", label: "Content", icon: "✎", color: "text-cyan" },
  { name: "whatsapp", path: "whatsapp", label: "WhatsApp", icon: "◯", color: "text-muted" },
  { name: "snapshots", path: "snapshots", label: "Snapshots", icon: "◇", color: "text-muted" },
];

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
        const sorted = (data as FileNode[]).sort((a: FileNode, b: FileNode) => {
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
              <FolderNode
                key={child.path}
                node={child}
                depth={depth + 1}
                onClose={onClose}
              />
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

export default function VaultSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border">
          <Link
            href="/vault"
            className="font-sans font-bold text-foreground text-lg"
            onClick={onClose}
          >
            Codify Vault
          </Link>
        </div>

        {/* Quick nav */}
        <div className="border-b border-border py-2">
          <Link
            href="/vault"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-1.5 text-sm transition-colors ${
              pathname === "/vault"
                ? "text-blue bg-blue/5"
                : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
            }`}
          >
            <span className="text-xs">◫</span>
            Dashboard
          </Link>
          <Link
            href="/vault/activity"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-1.5 text-sm transition-colors ${
              pathname === "/vault/activity"
                ? "text-blue bg-blue/5"
                : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
            }`}
          >
            <span className="text-xs">◔</span>
            Activity
          </Link>
          <Link
            href="/vault/chat"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-1.5 text-sm transition-colors ${
              pathname === "/vault/chat"
                ? "text-blue bg-blue/5"
                : "text-blue/70 hover:text-blue hover:bg-blue/5"
            }`}
          >
            <span className="text-xs">◈</span>
            Pocket Architect
          </Link>
        </div>

        {/* File tree */}
        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-4 py-1 text-xs font-medium text-dim uppercase tracking-wider">
            Files
          </p>
          {VAULT_FOLDERS.map((folder) => (
            <FolderNode
              key={folder.path}
              node={folder}
              depth={0}
              onClose={onClose}
            />
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <form action="/vault/auth/signout" method="POST">
            <button
              type="submit"
              className="text-xs text-dim hover:text-muted transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
