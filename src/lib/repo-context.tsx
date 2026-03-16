"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CORE_FILES = ["soul", "offer", "audience", "voice"] as const;

interface FileStatus {
  exists: boolean;
  content: string;
  wordCount: number;
  lastModified: string | null;
}

interface RepoState {
  owner: string;
  repo: string;
  connected: boolean;
  loading: boolean;
  files: Record<string, FileStatus>;
  fileCompleteness: number;
  contextScore: number;
  error: string | null;
  refreshFiles: () => Promise<void>;
  writeFile: (fileType: string, content: string) => Promise<boolean>;
}

const DEFAULT_STATE: RepoState = {
  owner: "",
  repo: "",
  connected: false,
  loading: true,
  files: {},
  fileCompleteness: 0,
  contextScore: 0,
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
  for (const key of CORE_FILES) {
    const file = files[key];
    if (!file || !file.exists) continue;
    if (file.wordCount > 200) score += 25;
    else if (file.wordCount > 100) score += 15;
    else if (file.wordCount > 50) score += 10;
    else score += 5;
  }
  return score;
}

function computeCompleteness(files: Record<string, FileStatus>): number {
  let count = 0;
  for (const key of CORE_FILES) {
    const file = files[key];
    if (file && file.exists && file.wordCount > 50) count++;
  }
  return count;
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

      const newFiles: Record<string, FileStatus> = {};
      for (const key of CORE_FILES) {
        const content = ghFiles[key] || "";
        const exists = !!ghFiles[key];
        newFiles[key] = {
          exists,
          content,
          wordCount: exists ? countWords(content) : 0,
          lastModified: exists ? new Date().toISOString().split("T")[0] : null,
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

  const writeFile = useCallback(async (fileType: string, content: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/github/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType, content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to write file");
        return false;
      }
      // Update this file in state immediately
      const wc = countWords(content);
      setFiles((prev) => ({
        ...prev,
        [fileType]: {
          exists: true,
          content,
          wordCount: wc,
          lastModified: new Date().toISOString().split("T")[0],
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
