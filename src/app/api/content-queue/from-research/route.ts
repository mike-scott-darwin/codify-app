import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { research_id, title, summary } = body;

  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const { data, error } = await supabase
    .from("content_queue")
    .insert({
      user_id: user.id,
      title,
      summary: summary || null,
      source: "research",
      metadata: research_id ? { research_id } : {},
      suggested_formats: ["social_post", "newsletter"],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
