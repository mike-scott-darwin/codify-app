"use client";

import { useChatDrawer } from "@/components/vault/chat-drawer-provider";

export default function DocumentActions({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName: string;
}) {
  const { openWithPrompt } = useChatDrawer();

  const actions = [
    {
      label: "Ask about this",
      prompt: `I'm looking at ${fileName}. Summarize the key points and tell me what's important.`,
    },
    {
      label: "Update this",
      prompt: `Review ${filePath} and suggest what should be updated or improved.`,
    },
    {
      label: "Draft from this",
      prompt: `Using ${filePath} as context, draft content based on this file.`,
    },
    {
      label: "Research related",
      prompt: `Research topics related to ${fileName}. What's new or changed that I should know about?`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => openWithPrompt(action.prompt)}
          className="px-3 py-1.5 text-xs bg-blue/10 text-blue border border-blue/20 rounded-lg hover:bg-blue/20 transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
