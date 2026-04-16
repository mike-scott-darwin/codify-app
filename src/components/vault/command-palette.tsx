"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChatDrawer } from "./chat-drawer-provider";

interface SearchResult {
  id: string;
  label: string;
  description: string;
  category: "file" | "skill" | "nav";
  action: () => void;
}

const NAV_ITEMS: Omit<SearchResult, "action">[] = [
  { id: "nav-dashboard", label: "Dashboard", description: "Home", category: "nav" },
  { id: "nav-activity", label: "Activity", description: "Recent changes", category: "nav" },
  { id: "nav-decisions", label: "Decisions", description: "Strategic decisions", category: "nav" },
  { id: "nav-research", label: "Research", description: "Market intelligence", category: "nav" },
  { id: "nav-files", label: "File Browser", description: "Browse all files", category: "nav" },
];

const NAV_PATHS: Record<string, string> = {
  "nav-dashboard": "/vault",
  "nav-activity": "/vault/activity",
  "nav-decisions": "/vault/decisions",
  "nav-research": "/vault/research",
  "nav-files": "/vault/files",
};

const SKILL_ITEMS: Omit<SearchResult, "action">[] = [
  // Extract
  { id: "sk-extract", label: "/extract", description: "AI interviews you and builds your profile", category: "skill" },
  { id: "sk-import", label: "/import", description: "Import existing docs, copy, or proposals", category: "skill" },
  { id: "sk-audit", label: "/audit", description: "Check which profile areas need more depth", category: "skill" },
  { id: "sk-voice-check", label: "/voice-check", description: "Check if text sounds like you", category: "skill" },
  // Create
  { id: "sk-draft", label: "/draft", description: "Draft content for any platform", category: "skill" },
  { id: "sk-facebook-ad", label: "/facebook-ad", description: "Generate Facebook ad copy", category: "skill" },
  { id: "sk-email", label: "/email", description: "Generate email sequences", category: "skill" },
  { id: "sk-proposal", label: "/proposal", description: "Generate a client proposal", category: "skill" },
  { id: "sk-landing", label: "/landing-page", description: "Generate landing page copy", category: "skill" },
  { id: "sk-research", label: "/research", description: "Research a topic or competitor", category: "skill" },
];

const CATEGORY_LABELS: Record<string, string> = {
  nav: "Navigation",
  skill: "Skills",
  file: "Files",
};

const CATEGORY_ORDER: ("nav" | "skill" | "file")[] = ["nav", "skill", "file"];

interface VaultFile {
  name: string;
  path: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [filesCached, setFilesCached] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openWithPrompt } = useChatDrawer();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Fetch vault files on first open
  useEffect(() => {
    if (!open || filesCached) return;

    const paths = ["reference/core", "decisions", "research"];
    Promise.all(
      paths.map((p) =>
        fetch(`/api/vault?action=list&path=${encodeURIComponent(p)}`)
          .then((r) => (r.ok ? r.json() : { files: [] }))
          .catch(() => ({ files: [] }))
      )
    ).then((results) => {
      const all: VaultFile[] = [];
      for (const result of results) {
        const items = Array.isArray(result) ? result : result.files || result.items || [];
        for (const item of items) {
          if (typeof item === "string") {
            all.push({ name: item.split("/").pop() || item, path: item });
          } else if (item.name || item.path) {
            all.push({
              name: item.name || (item.path as string).split("/").pop() || "",
              path: item.path || item.name,
            });
          }
        }
      }
      setFiles(all);
      setFilesCached(true);
    });
  }, [open, filesCached]);

  // Build results
  const buildResults = useCallback((): SearchResult[] => {
    const q = query.toLowerCase().trim();

    const match = (item: Omit<SearchResult, "action">) =>
      !q ||
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    const navResults: SearchResult[] = NAV_ITEMS.filter(match).map((item) => ({
      ...item,
      action: () => router.push(NAV_PATHS[item.id] || "/vault"),
    }));

    const skillResults: SearchResult[] = SKILL_ITEMS.filter(match).map((item) => ({
      ...item,
      action: () => openWithPrompt(item.label),
    }));

    const fileResults: SearchResult[] = files
      .filter(
        (f) =>
          !q ||
          f.name.toLowerCase().includes(q) ||
          f.path.toLowerCase().includes(q)
      )
      .map((f) => ({
        id: `file-${f.path}`,
        label: f.name.replace(/\.md$/, ""),
        description: f.path,
        category: "file" as const,
        action: () => router.push(`/vault/${f.path}`),
      }));

    return [...navResults, ...skillResults, ...fileResults];
  }, [query, files, router, openWithPrompt]);

  const results = buildResults();

  // Group results by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: results.filter((r) => r.category === cat),
  })).filter((g) => g.items.length > 0);

  // Flatten for index-based keyboard nav
  const flatResults = grouped.flatMap((g) => g.items);

  // Keyboard navigation inside the modal
  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        flatResults[selectedIndex].action();
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <svg
            className="w-4 h-4 text-dim shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search files, skills, pages..."
            className="flex-1 bg-background border-0 outline-none text-foreground text-sm px-3 py-3 placeholder:text-dim"
          />
          <kbd className="hidden sm:inline-block text-[10px] text-dim border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {flatResults.length === 0 && (
            <p className="px-4 py-6 text-sm text-dim text-center">
              No results found.
            </p>
          )}

          {grouped.map((group) => (
            <div key={group.category}>
              <div className="px-4 pt-3 pb-1 text-xs text-dim uppercase tracking-wide">
                {group.label}
              </div>
              {group.items.map((item) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => {
                      item.action();
                      setOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                      idx === selectedIndex
                        ? "bg-blue/10 text-foreground"
                        : "text-foreground hover:bg-blue/5"
                    }`}
                  >
                    <span className="font-medium truncate">{item.label}</span>
                    <span className="text-dim text-xs truncate">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
