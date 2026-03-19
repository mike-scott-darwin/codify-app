import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const CRON_INTERVALS: Record<string, number> = {
  "4h": 4 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: schedules, error } = await supabase
    .from("agent_schedules")
    .select("*, agent_chains(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load schedules." }, { status: 500 });

  return NextResponse.json({ schedules: schedules || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const { name, scheduleType, agentType, chainId, frequency, config = {}, maxRuns } = body;

  if (!name || !scheduleType || !frequency) {
    return NextResponse.json({ error: "name, scheduleType, and frequency are required." }, { status: 400 });
  }

  if (scheduleType === "single" && !agentType) {
    return NextResponse.json({ error: "agentType is required for single schedules." }, { status: 400 });
  }

  if (scheduleType === "chain" && !chainId) {
    return NextResponse.json({ error: "chainId is required for chain schedules." }, { status: 400 });
  }

  if (!CRON_INTERVALS[frequency]) {
    return NextResponse.json({ error: "Invalid frequency. Use: 4h, 8h, 12h, 24h, or 7d." }, { status: 400 });
  }

  const nextRunAt = new Date(Date.now() + CRON_INTERVALS[frequency]).toISOString();

  const { data: schedule, error } = await supabase
    .from("agent_schedules")
    .insert({
      user_id: user.id,
      name,
      schedule_type: scheduleType,
      cron_expression: frequency,
      agent_type: agentType || null,
      chain_id: chainId || null,
      config,
      enabled: true,
      next_run_at: nextRunAt,
      max_runs: maxRuns || null,
    })
    .select()
    .single();

  if (error || !schedule) {
    return NextResponse.json({ error: "Failed to create schedule." }, { status: 500 });
  }

  return NextResponse.json({ schedule });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const { id, enabled } = body;

  if (!id || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "id and enabled are required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("agent_schedules")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Failed to update schedule." }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const { error } = await supabase
    .from("agent_schedules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Failed to delete schedule." }, { status: 500 });

  return NextResponse.json({ success: true });
}
