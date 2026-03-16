import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end query params required" }, { status: 400 });
  }

  const { data: scheduled, error: schedErr } = await supabase
    .from("outputs")
    .select("id, output_type, title, content, is_favorite, created_at, scheduled_date, schedule_status")
    .eq("user_id", user.id)
    .gte("scheduled_date", start)
    .lte("scheduled_date", end)
    .order("scheduled_date", { ascending: true });

  if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });

  const { data: unscheduled, error: unschedErr } = await supabase
    .from("outputs")
    .select("id, output_type, title, content, is_favorite, created_at, scheduled_date, schedule_status")
    .eq("user_id", user.id)
    .is("scheduled_date", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (unschedErr) return NextResponse.json({ error: unschedErr.message }, { status: 500 });

  return NextResponse.json({ scheduled: scheduled || [], unscheduled: unscheduled || [] });
}
