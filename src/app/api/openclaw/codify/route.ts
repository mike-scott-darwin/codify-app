import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFileToRepo } from "@/lib/github";
import type { GitHubConfig } from "@/lib/github";

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function validateApiKey(request: NextRequest): boolean {
  const key = request.headers.get("x-api-key");
  return key === process.env.OPENCLAW_API_KEY;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// POST — Codify a decision or research from Telegram into GitHub
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { user_id, type, title, content, source } = body;

  if (!user_id || !title || !content) {
    return NextResponse.json(
      { error: "user_id, title, and content are required" },
      { status: 400 }
    );
  }

  const fileType = type === "research" ? "research" : "decision";

  // Get user's GitHub config
  const supabase = createServiceClient();
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("github_config")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile?.github_config) {
    return NextResponse.json(
      { error: "No GitHub connection found for this user" },
      { status: 400 }
    );
  }

  const config = profile.github_config as GitHubConfig;
  if (!config.token || !config.owner || !config.repo) {
    return NextResponse.json(
      { error: "GitHub config incomplete — missing token, owner, or repo" },
      { status: 400 }
    );
  }

  // Build the file
  const date = todayISO();
  const slug = slugify(title);
  const folder = fileType === "research" ? "research" : "decisions";
  const filePath = `${folder}/${date}-${slug}.md`;

  const fileContent = [
    "---",
    `type: ${fileType}`,
    "status: active",
    `date: ${date}`,
    `source: ${source || "telegram"}`,
    "---",
    "",
    `# ${title}`,
    "",
    content,
    "",
  ].join("\n");

  const commitMessage = `[add] ${fileType}: ${title} (via Telegram)`;

  // Write to GitHub
  const result = await writeFileToRepo(config, filePath, fileContent, commitMessage);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to write to GitHub" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    file: filePath,
    sha: result.sha,
    message: `Codified: ${filePath}`,
  });
}
