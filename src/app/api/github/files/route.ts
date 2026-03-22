import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { readFileFromRepo, writeFileToRepo, listFilesAcrossDirectories } from "@/lib/github";
import { REFERENCE_CATEGORIES } from "@/lib/types";
import type { GitHubConfig } from "@/lib/github";

async function getConfig(): Promise<{ config: GitHubConfig; userId: string } | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("github_config")
    .eq("user_id", user.id)
    .single();

  if (!profile?.github_config) return null;
  return { config: profile.github_config as GitHubConfig, userId: user.id };
}

export async function GET() {
  const auth = await getConfig();
  if (!auth) return NextResponse.json({ error: "Unauthorized or GitHub not connected" }, { status: 401 });

  const { config } = auth;

  // Discover all .md files across reference categories
  const allFiles = await listFilesAcrossDirectories(config, "reference", [...REFERENCE_CATEGORIES]);

  // Read content for each file
  const files: Record<string, string> = {};
  const fileMeta: Array<{ name: string; path: string; category: string }> = [];

  await Promise.all(
    allFiles.map(async (file) => {
      const content = await readFileFromRepo(config, file.path);
      if (content) {
        const key = file.name.replace(".md", "");
        files[key] = content;
        fileMeta.push({ name: file.name, path: file.path, category: file.category });
      }
    })
  );

  return NextResponse.json({ files, fileMeta });
}

export async function POST(request: NextRequest) {
  const auth = await getConfig();
  if (!auth) return NextResponse.json({ error: "Unauthorized or GitHub not connected" }, { status: 401 });

  const { config } = auth;
  const body = await request.json();
  const { fileType, content, message, path: customPath } = body;

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  // Support either a custom path or fileType (backwards compatible)
  let filePath: string;
  if (customPath) {
    // Validate it's under an allowed directory
    if (!customPath.startsWith("reference/") && !customPath.startsWith("research/") && !customPath.startsWith("decisions/")) {
      return NextResponse.json({ error: "Path must be under reference/, research/, or decisions/" }, { status: 400 });
    }
    filePath = customPath;
  } else if (fileType) {
    // Legacy: assume reference/core/
    filePath = `reference/core/${fileType}.md`;
  } else {
    return NextResponse.json({ error: "Either fileType or path is required." }, { status: 400 });
  }

  const commitMessage = message || `[codify] Update ${filePath}`;
  const result = await writeFileToRepo(config, filePath, content, commitMessage);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, sha: result.sha });
}
