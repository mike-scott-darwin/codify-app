"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CORE_FILE_KEYS, type ReferenceCategory } from "./types";

interface FileStatus {
  exists: boolean;
  content: string;
  wordCount: number;
  lastModified: string | null;
  category: ReferenceCategory;
  path: string;
}

interface RepoState {
  owner: string;
  repo: string;
  connected: boolean;
  loading: boolean;
  files: Record<string, FileStatus>;
  fileCompleteness: number;
  contextScore: number;
  totalFiles: number;
  categoryCounts: Record<ReferenceCategory, number>;
  error: string | null;
  refreshFiles: () => Promise<void>;
  writeFile: (fileType: string, content: string, path?: string) => Promise<boolean>;
}

const DEFAULT_STATE: RepoState = {
  owner: "",
  repo: "",
  connected: false,
  loading: true,
  files: {},
  fileCompleteness: 0,
  contextScore: 0,
  totalFiles: 0,
  categoryCounts: { core: 0, domain: 0, proof: 0, brand: 0 },
  error: null,
  refreshFiles: async () => {},
  writeFile: async () => false,
};

const RepoContext = createContext<RepoState>(DEFAULT_STATE);

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function computeContextScore(files: Record<string, FileStatus>): number {
  let score = 0;
  // Core files: up to 20 pts each (80 total)
  for (const key of CORE_FILE_KEYS) {
    const file = files[key];
    if (!file || !file.exists) continue;
    if (file.wordCount > 200) score += 20;
    else if (file.wordCount > 100) score += 12;
    else if (file.wordCount > 50) score += 8;
    else score += 4;
  }
  // Non-core files: 5 pts each up to 20 pts bonus
  let bonus = 0;
  for (const [key, file] of Object.entries(files)) {
    if (CORE_FILE_KEYS.includes(key as typeof CORE_FILE_KEYS[number])) continue;
    if (!file.exists || file.wordCount < 50) continue;
    bonus += 5;
    if (bonus >= 20) break;
  }
  return score + bonus;
}

function computeCompleteness(files: Record<string, FileStatus>): number {
  let count = 0;
  for (const key of CORE_FILE_KEYS) {
    const file = files[key];
    if (file && file.exists && file.wordCount > 50) count++;
  }
  return count;
}

function computeCategoryCounts(files: Record<string, FileStatus>): Record<ReferenceCategory, number> {
  const counts: Record<ReferenceCategory, number> = { core: 0, domain: 0, proof: 0, brand: 0 };
  for (const file of Object.values(files)) {
    if (file.exists) counts[file.category]++;
  }
  return counts;
}

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<Record<string, FileStatus>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (ownerName: string, repoName: string) => {
    if (!ownerName || !repoName) return;

    try {
      const res = await fetch("/api/github/files");
      if (!res.ok) {
        setError("Failed to fetch files");
        return;
      }
      const data = await res.json();
      const ghFiles: Record<string, string> = data.files || {};
      const fileMeta: Array<{ name: string; path: string; category: string }> = data.fileMeta || [];

      const newFiles: Record<string, FileStatus> = {};

      // Add core file placeholders first
      for (const key of CORE_FILE_KEYS) {
        const content = ghFiles[key] || "";
        const exists = !!ghFiles[key];
        newFiles[key] = {
          exists,
          content,
          wordCount: exists ? countWords(content) : 0,
          lastModified: exists ? new Date().toISOString().split("T")[0] : null,
          category: "core",
          path: `reference/core/${key}.md`,
        };
      }

      // Add all discovered files (including non-core)
      for (const meta of fileMeta) {
        const key = meta.name.replace(".md", "");
        if (newFiles[key]) {
          // Already added as core file — update path/category
          newFiles[key].path = meta.path;
          newFiles[key].category = meta.category as ReferenceCategory;
          continue;
        }
        const content = ghFiles[key] || "";
        newFiles[key] = {
          exists: !!content,
          content,
          wordCount: content ? countWords(content) : 0,
          lastModified: content ? new Date().toISOString().split("T")[0] : null,
          category: meta.category as ReferenceCategory,
          path: meta.path,
        };
      }

      setFiles(newFiles);
      setError(null);
    } catch {
      setError("Failed to load files from GitHub");
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    await fetchFiles(owner, repo);
  }, [owner, repo, fetchFiles]);

  const writeFile = useCallback(async (fileType: string, content: string, path?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/github/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType, content, path }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to write file");
        return false;
      }
      // Update this file in state immediately
      const wc = countWords(content);
      const category = path ? (
        path.includes("/domain/") ? "domain" :
        path.includes("/proof/") ? "proof" :
        path.includes("/brand/") ? "brand" : "core"
      ) as ReferenceCategory : "core";

      setFiles((prev) => ({
        ...prev,
        [fileType]: {
          exists: true,
          content,
          wordCount: wc,
          lastModified: new Date().toISOString().split("T")[0],
          category,
          path: path || `reference/core/${fileType}.md`,
        },
      }));
      return true;
    } catch {
      setError("Failed to write file");
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const configRes = await fetch("/api/github/config");
        const configData = await configRes.json();
        if (configData.config && configData.config.connected) {
          setOwner(configData.config.owner);
          setRepo(configData.config.repo);
          setConnected(true);
          await fetchFiles(configData.config.owner, configData.config.repo);
        } else {
          setConnected(false);
        }
      } catch {
        setError("Failed to load GitHub config");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchFiles]);

  const fileCompleteness = computeCompleteness(files);
  const contextScore = computeContextScore(files);
  const totalFiles = Object.values(files).filter(f => f.exists).length;
  const categoryCounts = computeCategoryCounts(files);

  return (
    <RepoContext.Provider
      value={{
        owner,
        repo,
        connected,
        loading,
        files,
        fileCompleteness,
        contextScore,
        totalFiles,
        categoryCounts,
        error,
        refreshFiles,
        writeFile,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
}

export const useRepo = () => useContext(RepoContext);
