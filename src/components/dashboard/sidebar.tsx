"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRepo } from "@/lib/repo-context";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { contextScore, totalFiles } = useRepo();

  const nav = [
    { label: "Terminal", href: "/dashboard", icon: "❯" },
    { label: "Files", href: "/dashboard/files", icon: "◆" },
    { label: "Outputs", href: "/dashboard/outputs", icon: "✓" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
  ];

  return (
    <aside className="w-44 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-[#1a1a1a]">
        <Link href="/dashboard" className="font-mono text-base text-white">
          <span className="text-[#22c55e]">❯</span> codify
        </Link>
        <div className="mt-2 font-mono text-[9px] text-[#6b6b6b]">
          {totalFiles > 0 ? contextScore + "/100 · " + totalFiles + " files" : "no files yet"}
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 font-mono text-sm transition-colors ${
                active ? "text-white bg-[#1a1a1a]" : "text-[#6b6b6b] hover:text-[#a0a0a0]"
              }`}
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-[#1a1a1a]">
        {user && (
          <>
            <p className="font-mono text-[9px] text-[#6b6b6b] truncate mb-1">{user.email}</p>
            <button onClick={signOut} className="font-mono text-[9px] text-[#6b6b6b] hover:text-[#ef4444] transition-colors">
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
