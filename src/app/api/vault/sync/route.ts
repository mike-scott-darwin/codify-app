import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { syncRepoToCache } from "@/lib/vault-cache";
import { NextResponse, type NextRequest } from "next/server";

// Reuse the same client lookup as the main vault route
async function getClientConfig() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user.email ?? "")
    .single();

  return client;
}

// POST /api/vault/sync — manual sync (authenticated user)
export async function POST() {
  const client = await getClientConfig();
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = client.github_token || process.env.GITHUB_TOKEN;
  const repo = client.github_repo;

  if (!token || !repo) {
    return NextResponse.json(
      { error: `Missing GitHub config: token=${!!token}, repo=${!!repo}` },
      { status: 500 }
    );
  }

  try {
    const result = await syncRepoToCache(token, repo);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GitHub webhook — PUT with X-GitHub-Event header
export async function PUT(request: NextRequest) {
  const event = request.headers.get("x-github-event");
  if (event !== "push") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await request.json();
  const repo = body.repository?.full_name;
  if (!repo) {
    return NextResponse.json({ error: "No repo in payload" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { data: client } = await admin
    .from("clients")
    .select("github_token, github_repo")
    .eq("github_repo", repo)
    .single();

  const token = client?.github_token || process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "No client for repo" }, { status: 404 });
  }

  try {
    const result = await syncRepoToCache(token, repo);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
