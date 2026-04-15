"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AgentNavPanel() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="url(#sg1)" />
              <path d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z" fill="url(#sg2)" />
              <defs>
                <linearGradient id="sg1" x1="4" y1="2" x2="20" y2="18">
                  <stop stopColor="#818cf8" />
                  <stop offset="0.5" stopColor="#c084fc" />
                  <stop offset="1" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="sg2" x1="16" y1="14" x2="22" y2="20">
                  <stop stopColor="#c084fc" />
                  <stop offset="1" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-sm font-sans font-bold text-foreground">AI</span>
        </div>
      </div>

      {/* Ask or Create */}
      <div className="border-b border-border py-2">
        <NavItem
          href="/vault/agents"
          active={pathname === "/vault/agents"}
          icon={
            <svg className="w-4 h-4 text-blue" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" />
            </svg>
          }
          label="Ask or Create"
        />
      </div>

      {/* Agents section */}
      <div className="border-b border-border py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Agents</p>

        <NavItem
          href="/vault/agents/create"
          active={pathname === "/vault/agents/create"}
          icon={
            <svg className="w-4 h-4 text-red" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          }
          label="Create Agent"
        />

        <NavItem
          href="/vault/agents/all"
          active={pathname === "/vault/agents/all"}
          icon={
            <svg className="w-4 h-4 text-purple" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 00-2 2v1h14V6a2 2 0 00-2-2H5zM3 14a2 2 0 002 2h10a2 2 0 002-2V9H3v5zm5-3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
          }
          label="All Agents"
        />

        <NavItem
          href="/vault/agents/mine"
          active={pathname === "/vault/agents/mine"}
          icon={
            <svg className="w-4 h-4 text-green" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          }
          label="My Agents"
        />

        <NavItem
          href="/vault/agents/activity"
          active={pathname === "/vault/agents/activity"}
          icon={
            <svg className="w-4 h-4 text-muted" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          }
          label="Audit Log"
        />
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto py-2">
        <p className="px-4 py-1.5 text-[11px] font-medium text-dim uppercase tracking-wider">Recent Chats</p>
        <p className="px-6 py-3 text-[12px] text-dim italic">No recent chats</p>
      </div>
    </div>
  );
}

function NavItem({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors rounded-md mx-2 ${
        active
          ? "text-foreground bg-blue/10"
          : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
