"use client";

import { usePathname } from "next/navigation";
import AgentNavPanel from "./agent-nav-panel";
import ChatPanel from "./chat-panel";

export default function AiSidePanel() {
  const pathname = usePathname();
  const isAgentsRoute = pathname.startsWith("/vault/agents");

  if (isAgentsRoute) {
    return <AgentNavPanel />;
  }

  return <ChatPanel embedded />;
}
