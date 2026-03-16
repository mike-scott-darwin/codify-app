import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { maskToken } from "@/lib/github";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { repoName } = body;

  if (!repoName) {
    return NextResponse.json({ error: "Workspace name is required." }, { status: 400 });
  }

  // Get existing github_config (token + owner saved by OAuth)
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("github_config")
    .eq("id", user.id)
    .single();

  const existingConfig = profile?.github_config as { token?: string; owner?: string } | null;

  if (!existingConfig?.token || !existingConfig?.owner) {
    return NextResponse.json({ error: "GitHub not connected. Please connect first." }, { status: 400 });
  }

  const token = existingConfig.token;

  // Create the repo via GitHub API
  const createRes = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      name: repoName,
      private: true,
      auto_init: true,
      description: "Business reference files managed by Codify",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.message || `Failed to create workspace: ${createRes.status}` },
      { status: createRes.status }
    );
  }

  const repoData = await createRes.json();
  const owner = repoData.owner.login;
  const repo = repoData.name;

  // Update config with repo name
  const ghConfig = { token, owner, repo, branch: "main" };
  const { error } = await supabase
    .from("user_profiles")
    .update({ github_config: ghConfig })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    owner,
    repo,
    config: {
      owner,
      repo,
      branch: "main",
      token: maskToken(token),
      connected: true,
    },
  });
}
