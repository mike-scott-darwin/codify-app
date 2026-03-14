"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await signInWithEmail(email);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <nav className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="font-mono text-lg text-white">
            <span className="text-[#22c55e]">&#10095;</span> codify
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="bg-[#111111] border border-[#1a1a1a] p-8 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#22c55e] mb-4">
                Check Your Email
              </p>
              <p className="text-sm text-[#a0a0a0] mb-2">
                We sent a magic link to
              </p>
              <p className="font-mono text-sm text-white mb-6">{email}</p>
              <p className="text-xs text-[#6b6b6b]">
                Click the link to sign in. No password needed.
              </p>
            </div>
          ) : (
            <div className="bg-[#111111] border border-[#1a1a1a] p-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#4a9eff] mb-2">
                Save Your Progress
              </p>
              <p className="text-sm text-[#a0a0a0] mb-6">
                Sign in to save your reference files and come back anytime. No password — we&apos;ll email you a magic link.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#4a9eff] mb-4"
                  style={{ borderRadius: 0 }}
                />

                {error && (
                  <p className="font-mono text-xs text-[#ef4444] mb-4">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-mono text-sm font-bold px-6 py-3 hover:brightness-110 transition-all disabled:opacity-50"
                  style={{ backgroundColor: "#22c55e", color: "#000000", borderRadius: 0 }}
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
                <Link
                  href="/interview/soul"
                  className="font-mono text-xs text-[#6b6b6b] hover:text-[#a0a0a0] transition-colors"
                >
                  Skip for now — continue without saving &#8594;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
