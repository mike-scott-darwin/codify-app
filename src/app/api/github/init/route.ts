import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { initRepoStructure } from "@/lib/github";
import type { GitHubConfig } from "@/lib/github";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("github_config")
    .eq("id", user.id)
    .single();

  if (!profile?.github_config) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  const config = profile.github_config as GitHubConfig;
  const result = await initRepoStructure(config);

  return NextResponse.json(result);
}
