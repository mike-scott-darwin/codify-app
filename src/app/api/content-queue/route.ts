import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [], counts: {} });

  const statusFilter = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("content_queue")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;

  // Get counts by status
  const { data: allItems } = await supabase
    .from("content_queue")
    .select("status")
    .eq("user_id", user.id);

  const counts: Record<string, number> = { pending: 0, approved: 0, rejected: 0, generated: 0 };
  if (allItems) {
    for (const item of allItems) {
      counts[item.status] = (counts[item.status] || 0) + 1;
    }
  }

  return NextResponse.json({ items: data || [], counts });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, summary, source, source_url, topics, suggested_formats, relevance_score, metadata } = body;

  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const { data, error } = await supabase
    .from("content_queue")
    .insert({
      user_id: user.id,
      title,
      summary: summary || null,
      source: source || "manual",
      source_url: source_url || null,
      relevance_score: relevance_score || 0,
      topics: topics || [],
      suggested_formats: suggested_formats || [],
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
