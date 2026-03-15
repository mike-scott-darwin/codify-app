"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTier } from "@/lib/tier-context";
import { TIER_LABELS, TIER_COLORS, hasAccess } from "@/lib/tier";
import type { Feature } from "@/lib/tier";

interface NavItem {
  label: string;
  href: string;
  feature?: Feature;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "■" },
  { label: "Build", href: "/dashboard/files", icon: "1" },
  { label: "Research", href: "/dashboard/research", feature: "research", icon: "2" },
  { label: "Create", href: "/dashboard/generate", feature: "generate:ad_copy", icon: "3" },
  { label: "Publish", href: "/dashboard/outputs", feature: "output_history", icon: "4" },
  { label: "Automate", href: "/dashboard/agents", feature: "agent:congruence_audit", icon: "5" },
  { label: "Terminal", href: "/dashboard/terminal", icon: "❯" },
  { label: "Help", href: "/dashboard/help", icon: "?" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { tier } = useTier();

  return (
    <aside className="w-56 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1a1a1a]">
        <Link href="/dashboard" className="font-mono text-lg text-white">
          <span className="text-[#22c55e]">&#10095;</span> codify
        </Link>
      </div>

      {/* Tier badge */}
      <div className="px-5 py-3 border-b border-[#1a1a1a]">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1 border"
          style={{ color: TIER_COLORS[tier], borderColor: TIER_COLORS[tier] }}
        >
          {TIER_LABELS[tier]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          const locked = item.feature ? !hasAccess(tier, item.feature) : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 font-mono text-sm transition-colors ${
                isActive
                  ? "text-white bg-[#1a1a1a]"
                  : "text-[#6b6b6b] hover:text-[#a0a0a0]"
              }`}
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.label}</span>
              {locked && (
                <span className="ml-auto text-[10px] text-[#6b6b6b]">⚿</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA for free users */}
      {tier === "free" && (
        <div className="px-3 pb-3">
          <Link
            href="/dashboard/upgrade"
            className="block text-center font-mono text-xs px-3 py-2 border border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* User */}
      <div className="px-5 py-4 border-t border-[#1a1a1a]">
        {user && (
          <>
            <p className="font-mono text-[10px] text-[#6b6b6b] truncate mb-2">
              {user.email}
            </p>
            <button
              onClick={signOut}
              className="font-mono text-[10px] text-[#6b6b6b] hover:text-[#ef4444] transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
