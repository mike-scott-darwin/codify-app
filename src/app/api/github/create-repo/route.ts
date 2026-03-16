import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { maskToken } from "@/lib/github";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { pat, repoName } = body;

  if (!pat || !repoName) {
    return NextResponse.json({ error: "PAT and repo name are required." }, { status: 400 });
  }

  // Create the repo via GitHub API
  const createRes = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
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
      { error: err.message || `Failed to create repo: ${createRes.status}` },
      { status: createRes.status }
    );
  }

  const repoData = await createRes.json();
  const owner = repoData.owner.login;
  const repo = repoData.name;

  // Save config to user_profiles
  const ghConfig = { token: pat, owner, repo, branch: "main" };
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
      token: maskToken(pat),
      connected: true,
    },
  });
}
