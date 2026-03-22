"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { RepoProvider } from "@/lib/repo-context";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user) {
      fetch("/api/github/config")
        .then((res) => res.json())
        .then((data) => {
          if (data.config && data.config.connected) {
            setHasConfig(true);
          } else {
            router.push("/onboarding");
          }
        })
        .catch(() => {
          router.push("/onboarding");
        });
    }
  }, [user, loading, router]);

  if (loading || hasConfig === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!user) return null;

  const isTerminal = pathname === "/dashboard";

  return (
    <RepoProvider>
      <div className="flex min-h-screen bg-[#0a0a0a] text-white">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className={isTerminal ? "px-6 py-6 h-screen" : "mx-auto max-w-4xl px-8 py-10"}>
            {children}
          </div>
        </main>
      </div>
    </RepoProvider>
  );
}
