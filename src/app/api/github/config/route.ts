import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRepo, maskToken } from "@/lib/github";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("github_config")
    .eq("id", user.id)
    .single();

  if (!profile?.github_config) {
    return NextResponse.json({ config: null });
  }

  const config = profile.github_config as { token: string; owner: string; repo: string; branch?: string };
  return NextResponse.json({
    config: {
      owner: config.owner,
      repo: config.repo,
      branch: config.branch || "main",
      token: maskToken(config.token),
      connected: true,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { token, owner, repo, branch } = body;

  if (!token || !owner || !repo) {
    return NextResponse.json({ error: "Token, owner, and repo are required." }, { status: 400 });
  }

  const ghConfig = { token, owner, repo, branch: branch || "main" };

  // Validate the connection
  const verification = await verifyRepo(ghConfig);
  if (!verification.valid) {
    return NextResponse.json({ error: verification.message }, { status: 400 });
  }

  // Save to user_profiles
  const { error } = await supabase
    .from("user_profiles")
    .update({ github_config: ghConfig })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    config: {
      owner,
      repo,
      branch: branch || "main",
      token: maskToken(token),
      connected: true,
    },
    message: verification.message,
  });
}
