import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ outputs: [] });

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const favoritesOnly = url.searchParams.get("favorites") === "true";

  let query = supabase
    .from("outputs")
    .select("id, output_type, title, content, is_favorite, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (type) query = query.eq("output_type", type);
  if (favoritesOnly) query = query.eq("is_favorite", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ outputs: [] });

  return NextResponse.json({ outputs: data || [] });
}
