"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ChatDrawerContextType {
  isOpen: boolean;
  toggle: () => void;
  openWithPrompt: (prompt: string) => void;
  pendingPrompt: string | null;
  clearPendingPrompt: () => void;
  currentFile: string | null;
  setCurrentFile: (path: string | null) => void;
}

const ChatDrawerContext = createContext<ChatDrawerContextType>({
  isOpen: false,
  toggle: () => {},
  openWithPrompt: () => {},
  pendingPrompt: null,
  clearPendingPrompt: () => {},
  currentFile: null,
  setCurrentFile: () => {},
});

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  function openWithPrompt(prompt: string) {
    setPendingPrompt(prompt);
    setIsOpen(true);
  }

  function clearPendingPrompt() {
    setPendingPrompt(null);
  }

  return (
    <ChatDrawerContext.Provider
      value={{ isOpen, toggle, openWithPrompt, pendingPrompt, clearPendingPrompt, currentFile, setCurrentFile }}
    >
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawer() {
  return useContext(ChatDrawerContext);
}
