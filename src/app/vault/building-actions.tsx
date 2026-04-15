"use client";

import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

interface ExtractButtonProps {
  file: string;
}

export function ExtractButton({ file }: ExtractButtonProps) {
  const { openWithPrompt } = useChatDrawer();
  const label = file.split("/").pop()?.replace(".md", "") ?? file;

  return (
    <button
      onClick={() => openWithPrompt(`/extract ${label.toLowerCase()}`)}
      className="px-3 py-1.5 text-xs font-medium text-blue bg-blue/10 border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors whitespace-nowrap"
    >
      Start this one →
    </button>
  );
}

interface NextStepActionProps {
  file: string;
  reason: string;
}

export function NextStepAction({ file, reason }: NextStepActionProps) {
  const { openWithPrompt } = useChatDrawer();

  return (
    <div className="bg-blue/5 border border-blue/20 rounded-xl p-5">
      <h3 className="text-sm font-sans font-bold text-foreground mb-2">Recommended next</h3>
      <p className="text-sm text-muted leading-relaxed">
        {reason}
      </p>
      <button
        onClick={() => openWithPrompt(`/extract ${file.toLowerCase()}`)}
        className="mt-3 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue to-purple rounded-lg hover:opacity-90 transition-opacity"
      >
        Let's talk about your {file} →
      </button>
    </div>
  );
}
