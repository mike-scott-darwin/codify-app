"use client";

import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

interface ExtractButtonProps {
  file: string;
}

export function ExtractButton({ file }: ExtractButtonProps) {
  const { openWithPrompt } = useChatDrawer();

  return (
    <button
      onClick={() => openWithPrompt(`/extract ${file.toLowerCase()}`)}
      className="text-xs text-blue hover:underline whitespace-nowrap"
    >
      [Extract →]
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
      <h3 className="text-sm font-sans font-bold text-blue mb-2">Next Step</h3>
      <p className="text-sm text-muted leading-relaxed">
        Your <span className="text-foreground font-bold">{file}</span> is empty.
        Without it, {reason}.
      </p>
      <button
        onClick={() => openWithPrompt(`/extract ${file.toLowerCase()}`)}
        className="mt-3 text-sm text-blue hover:underline"
      >
        Extract {file} →
      </button>
    </div>
  );
}
