"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signInWithGitHub: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signInWithGitHub: async () => ({ error: null }),
  signOut: async () => {},
});

const DEV_USER: User = {
  id: "dev-local-user",
  email: "dev@localhost",
  app_metadata: {},
  user_metadata: { user_name: "dev" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

const isDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(isDevBypass ? DEV_USER : null);
  const [loading, setLoading] = useState(!isDevBypass);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabase = !!(supabaseUrl && supabaseKey);

  useEffect(() => {
    if (isDevBypass || !hasSupabase) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [hasSupabase]);

  const signInWithEmail = useCallback(async (email: string) => {
    if (isDevBypass) return { error: null };
    if (!hasSupabase) return { error: "Auth not configured" };
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  }, [hasSupabase]);

  const signInWithGitHub = useCallback(async () => {
    if (isDevBypass) return { error: null };
    if (!hasSupabase) return { error: "Auth not configured" };
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  }, [hasSupabase]);

  const signOut = useCallback(async () => {
    if (isDevBypass) return;
    if (!hasSupabase) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, [hasSupabase]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signInWithGitHub, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
