"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChatDrawerProvider } from "@/components/vault/chat-drawer-provider";
import CommandPalette from "@/components/vault/command-palette";
import VaultSidebar, { ActivityRibbon, TreePanel, FileListPanel, FilePreviewPanel } from "@/components/vault/sidebar";
import type { PreviewFile } from "@/components/vault/sidebar";
import VaultTopBar from "@/components/vault/top-bar";
import ChatPanel from "@/components/vault/chat-panel";
import type { RibbonPanel } from "@/components/vault/types";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
}

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<RibbonPanel>("files");
  // 3-pane state: selected folder → file list → preview
  const [openFolder, setOpenFolder] = useState<{ path: string; label: string } | null>(null);
  const [folderFiles, setFolderFiles] = useState<FileNode[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(420);
  const fileCache = useRef<Record<string, string>>({});
  const resizing = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  // Resize handler for preview panel
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startWidth = previewWidth;

    function onMouseMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const delta = ev.clientX - startX;
      setPreviewWidth(Math.max(280, Math.min(startWidth + delta, 700)));
    }
    function onMouseUp() {
      resizing.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [previewWidth]);

  // Close panes when navigating to a specific file/page (not agents or dashboard)
  useEffect(() => {
    // Keep 3-pane open as the user browses
  }, [pathname]);

  // Open a folder → fetch file list → auto-preview first file
  async function handleOpenFolder(path: string, label: string) {
    if (openFolder?.path === path) {
      // Toggle off
      setOpenFolder(null);
      setFolderFiles([]);
      setPreview(null);
      return;
    }

    setOpenFolder({ path, label });
    setLoadingFiles(true);
    setFolderFiles([]);
    setPreview(null);

    try {
      const res = await fetch(`/api/vault?action=list&path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = (await res.json()) as FileNode[];
        const files = data
          .filter((f) => f.type === "file")
          .sort((a, b) => a.name.localeCompare(b.name));
        const dirs = data
          .filter((f) => f.type === "dir")
          .sort((a, b) => a.name.localeCompare(b.name));

        // If there are subdirectories, fetch their files too (one level deep)
        const subFiles: FileNode[] = [];
        for (const dir of dirs) {
          try {
            const subRes = await fetch(`/api/vault?action=list&path=${encodeURIComponent(dir.path)}`);
            if (subRes.ok) {
              const subData = (await subRes.json()) as FileNode[];
              subFiles.push(...subData.filter((f) => f.type === "file"));
            }
          } catch { /* skip */ }
        }

        const allFiles = [...files, ...subFiles].sort((a, b) => a.name.localeCompare(b.name));
        setFolderFiles(allFiles);

        // Auto-preview first file
        if (allFiles.length > 0) {
          loadPreview(allFiles[0].path, allFiles[0].name);
        }
      }
    } catch {
      setFolderFiles([]);
    }
    setLoadingFiles(false);
  }

  // Load file preview with caching
  async function loadPreview(path: string, name: string) {
    // Optimistic: show cached content immediately if available
    if (fileCache.current[path]) {
      setPreview({ path, name, content: fileCache.current[path] });
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    setPreview({ path, name, content: "" });

    try {
      const res = await fetch(`/api/vault?action=file&path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        const content = typeof data === "string" ? data : data.content || JSON.stringify(data, null, 2);
        fileCache.current[path] = content;
        setPreview({ path, name, content });
      }
    } catch {
      setPreview({ path, name, content: "Failed to load file." });
    }
    setLoadingPreview(false);
  }

  // When navigating to agents, keep files panel open for drag & drop
  useEffect(() => {
    if (activePanel === "ai") {
      setActivePanel("files");
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePanel(panel: "files" | "ai") {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      switch (e.key.toLowerCase()) {
        case "q":
          setActivePanel((prev) => (prev === "files" ? null : "files"));
          break;
        case "h":
          router.push("/vault");
          break;
        case "s":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
            );
          }
          break;
        case "escape":
          if (preview) { setPreview(null); setOpenFolder(null); setFolderFiles([]); }
          break;
      }
    },
    [router, preview]
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

        {/* Pane 1: Folder tree */}
        {activePanel === "files" && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[220px] border-r border-border">
            <TreePanel
              onOpenFolder={handleOpenFolder}
              activeFolderPath={openFolder?.path}
            />
          </div>
        )}

        {/* Pane 2: File list within selected folder */}
        {openFolder && (
          <div className="hidden md:flex flex-col shrink-0 h-full w-[200px] border-r border-border">
            <FileListPanel
              folderLabel={openFolder.label}
              files={folderFiles}
              loading={loadingFiles}
              selectedPath={preview?.path}
              onSelectFile={loadPreview}
              onClose={() => { setOpenFolder(null); setFolderFiles([]); setPreview(null); }}
            />
          </div>
        )}

        {/* Pane 3: File preview — resizable */}
        {preview && (
          <div className="hidden md:flex shrink-0 h-full relative" style={{ width: previewWidth }}>
            <div className="flex flex-col h-full w-full border-r border-border">
              <FilePreviewPanel
                file={preview}
                loading={loadingPreview}
                onClose={() => setPreview(null)}
              />
            </div>
            {/* Resize handle */}
            <div
              onMouseDown={startResize}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-10 group hover:bg-blue/20 transition-colors"
            >
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-8 rounded-full bg-border group-hover:bg-blue/50 transition-colors" />
            </div>
          </div>
        )}

        {/* Content — full remaining width */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <VaultTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {/* Mobile */}
        <ChatPanel />
        <div className="md:hidden">
          <VaultSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
    </ChatDrawerProvider>
  );
}
