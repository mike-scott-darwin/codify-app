import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { syncRepoToCache } from "@/lib/vault-cache";
import { NextResponse, type NextRequest } from "next/server";

// POST /api/vault/sync — manual sync (authenticated user)
export async function POST() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const { data: client } = await admin
    .from("clients")
    .select("*")
    .eq("email", user.email ?? "")
    .single();

  if (!client?.github_token || !client?.github_repo) {
    return NextResponse.json({ error: "Missing GitHub config" }, { status: 500 });
  }

  try {
    const result = await syncRepoToCache(client.github_token, client.github_repo);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GitHub webhook — POST with X-GitHub-Event header
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

  // Look up the client by repo
  const admin = createSupabaseAdmin();
  const { data: client } = await admin
    .from("clients")
    .select("github_token, github_repo")
    .eq("github_repo", repo)
    .single();

  if (!client?.github_token) {
    return NextResponse.json({ error: "No client for repo" }, { status: 404 });
  }

  try {
    const result = await syncRepoToCache(client.github_token, client.github_repo);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
