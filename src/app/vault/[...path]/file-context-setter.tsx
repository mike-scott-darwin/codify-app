"use client";
import { useEffect } from "react";
import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

export default function FileContextSetter({ path }: { path: string }) {
  const { setCurrentFile } = useChatDrawer();
  useEffect(() => {
    setCurrentFile(path);
    return () => setCurrentFile(null);
  }, [path, setCurrentFile]);
  return null;
}
