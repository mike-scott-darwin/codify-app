import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ topics: [] });

  const { data } = await supabase
    .from("research_topics")
    .select("id, title, status, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return NextResponse.json({ topics: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Tier check
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier")
    .eq("user_id", user.id)
    .single();

  const tierLevel: Record<string, number> = { free: 0, build: 1, pro: 2, vip: 3 };
  if (tierLevel[profile?.tier || "free"] < tierLevel["build"]) {
    return NextResponse.json({ error: "Upgrade to BUILD to use research." }, { status: 403 });
  }

  const body = await request.json();
  const { title } = body;
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const { data, error } = await supabase
    .from("research_topics")
    .insert({ user_id: user.id, title })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ topic: data });
}
