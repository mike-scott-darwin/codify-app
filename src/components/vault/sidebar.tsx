"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navSections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/vault", icon: "grid" },
      { name: "Activity", href: "/vault/activity", icon: "clock" },
    ],
  },
  {
    label: "Vault",
    items: [
      { name: "Context", href: "/vault/files?path=reference/core", icon: "file" },
      { name: "Decisions", href: "/vault/decisions", icon: "zap" },
      { name: "Research", href: "/vault/research", icon: "search" },
      { name: "Outputs", href: "/vault/files?path=outputs", icon: "box" },
      { name: "Content", href: "/vault/files?path=content", icon: "edit" },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Pocket Architect", href: "/vault/chat", icon: "message" },
    ],
  },
];

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </svg>
  ),
  file: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5L9.5 1.5z" />
      <path d="M9.5 1.5V5H13" />
    </svg>
  ),
  zap: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M8.5 1.5L3 9h4.5l-1 5.5L13 7H8.5l1-5.5z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  ),
  box: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" />
      <path d="M2 5l6 3 6-3M8 8v6.5" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 1.5l3.5 3.5L5 14.5H1.5V11L11 1.5z" />
    </svg>
  ),
  message: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V3z" />
    </svg>
  ),
};

export default function VaultSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/vault") return pathname === "/vault";
    return pathname.startsWith(href.split("?")[0]);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-64 bg-surface border-r border-border flex flex-col transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border">
          <Link
            href="/vault"
            className="font-sans font-bold text-foreground text-lg"
            onClick={onClose}
          >
            Codify Vault
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navSections.map((section) => (
            <div key={section.label} className="mb-2">
              <p className="px-4 py-1 text-xs font-medium text-dim uppercase tracking-wider">
                {section.label}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? "text-blue bg-blue/5 border-r-2 border-blue"
                      : "text-muted hover:text-foreground hover:bg-[#1a1a1a]"
                  }`}
                >
                  {icons[item.icon]}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <form action="/vault/auth/signout" method="POST">
            <button
              type="submit"
              className="text-xs text-dim hover:text-muted transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
