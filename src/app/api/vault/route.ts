import { createSupabaseServer } from "@/lib/supabase-server";
import {
  listDirectory,
  getFileContent,
  getRecentCommits,
  getVaultMetrics,
  getContextDepth,
} from "@/lib/vault";
import { NextResponse, type NextRequest } from "next/server";

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

export async function GET(request: NextRequest) {
  const client = await getClientConfig();
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = client.github_token || process.env.GITHUB_TOKEN;
  const repo = client.github_repo;

  if (!token || !repo) {
    return NextResponse.json(
      { error: "Missing GitHub configuration" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "metrics":
        return NextResponse.json(await getVaultMetrics(token, repo));

      case "list": {
        const path = searchParams.get("path") ?? "";
        return NextResponse.json(await listDirectory(token, repo, path));
      }

      case "file": {
        const path = searchParams.get("path");
        if (!path) {
          return NextResponse.json({ error: "path required" }, { status: 400 });
        }
        return NextResponse.json(await getFileContent(token, repo, path));
      }

      case "activity": {
        const count = parseInt(searchParams.get("count") ?? "20", 10);
        return NextResponse.json(await getRecentCommits(token, repo, count));
      }

      case "depth":
        return NextResponse.json(await getContextDepth(token, repo));

      default:
        return NextResponse.json(
          { error: "Unknown action. Use: metrics, list, file, activity, depth" },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
