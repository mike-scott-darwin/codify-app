import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Platform } from "@/lib/integrations/types";
import { PLATFORM_CONFIGS } from "@/lib/integrations/types";
import { testIntegrationConnection } from "@/lib/integrations/publish";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { platform: Platform; credentials: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { platform, credentials } = body;

  if (!platform || !PLATFORM_CONFIGS[platform]) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const result = await testIntegrationConnection(platform, credentials);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
