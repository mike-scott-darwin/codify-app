"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function VaultLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/vault/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-sans font-bold text-foreground">Codify Vault</h1>
          <p className="text-muted mt-2">Sign in to access your vault dashboard</p>
        </div>

        {sent ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <p className="text-green font-medium">Check your email</p>
            <p className="text-muted text-sm mt-2">
              We sent a magic link to <strong className="text-foreground">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-surface border border-border rounded-lg p-6">
            <label htmlFor="email" className="block text-sm text-muted mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground placeholder:text-dim focus:outline-none focus:border-blue"
            />
            {error && <p className="text-red text-sm mt-2">{error}</p>}
            <button
              type="submit"
              className="w-full mt-4 bg-blue text-background font-medium py-2 rounded hover:opacity-90 transition-opacity"
            >
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
