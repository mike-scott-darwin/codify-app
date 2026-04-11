import Link from "next/link";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/vault" className="font-sans font-bold text-foreground">
              Codify Vault
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/vault" className="text-muted hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/vault/files" className="text-muted hover:text-foreground transition-colors">
                Files
              </Link>
              <Link href="/vault/chat" className="text-muted hover:text-foreground transition-colors">
                Pocket Architect
              </Link>
            </div>
          </div>
          <form action="/vault/auth/signout" method="POST">
            <button type="submit" className="text-sm text-dim hover:text-muted transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
