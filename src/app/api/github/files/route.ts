import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { readFileFromRepo, writeFileToRepo, listFilesInRepo } from "@/lib/github";
import type { GitHubConfig } from "@/lib/github";

const VALID_FILE_TYPES = ["soul", "offer", "audience", "voice"] as const;

async function getGitHubConfig(supabase: ReturnType<Awaited<ReturnType<typeof createServerSupabaseClient>> extends infer T ? () => T : never>): Promise<GitHubConfig | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb
    .from("user_profiles")
    .select("github_config")
    .eq("id", user.id)
    .single();

  if (!profile?.github_config) return null;
  return profile.github_config as GitHubConfig;
}

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
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  const config = profile.github_config as GitHubConfig;

  // List files in reference/core/
  const files = await listFilesInRepo(config, "reference/core");
  const result: Record<string, string> = {};

  for (const file of files) {
    if (file.name.endsWith(".md")) {
      const key = file.name.replace(".md", "");
      if (VALID_FILE_TYPES.includes(key as (typeof VALID_FILE_TYPES)[number])) {
        const content = await readFileFromRepo(config, file.path);
        if (content) result[key] = content;
      }
    }
  }

  return NextResponse.json({ files: result });
}

export async function POST(request: NextRequest) {
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
  const body = await request.json();
  const { fileType, content, message } = body;

  if (!fileType || !VALID_FILE_TYPES.includes(fileType as (typeof VALID_FILE_TYPES)[number])) {
    return NextResponse.json(
      { error: "Invalid fileType. Must be: " + VALID_FILE_TYPES.join(", ") },
      { status: 400 }
    );
  }

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const commitMessage = message || `[codify] Update ${fileType}.md`;
  const path = `reference/core/${fileType}.md`;

  const result = await writeFileToRepo(config, path, content, commitMessage);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, sha: result.sha });
}
