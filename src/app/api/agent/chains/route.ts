import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Load templates
  const { data: templates } = await supabase
    .from("agent_chains")
    .select("*, agent_chain_steps(*)")
    .eq("is_template", true)
    .order("created_at", { ascending: true });

  // Load user's chains
  const { data: userChains } = await supabase
    .from("agent_chains")
    .select("*, agent_chain_steps(*)")
    .eq("user_id", user.id)
    .eq("is_template", false)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    templates: templates || [],
    userChains: userChains || [],
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const { templateKey, frequency = "24h" } = body;

  if (!templateKey) {
    return NextResponse.json({ error: "templateKey is required." }, { status: 400 });
  }

  // Load template
  const { data: template } = await supabase
    .from("agent_chains")
    .select("*, agent_chain_steps(*)")
    .eq("template_key", templateKey)
    .eq("is_template", true)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  // Create user-owned chain
  const { data: chain, error: chainErr } = await supabase
    .from("agent_chains")
    .insert({
      user_id: user.id,
      name: template.name,
      description: template.description,
      is_template: false,
    })
    .select()
    .single();

  if (chainErr || !chain) {
    return NextResponse.json({ error: "Failed to create chain." }, { status: 500 });
  }

  // Copy steps
  const steps = (template.agent_chain_steps || []).map((s: Record<string, unknown>) => ({
    chain_id: chain.id,
    step_order: s.step_order,
    agent_type: s.agent_type,
    config: s.config || {},
    input_mapping: s.input_mapping || {},
  }));

  if (steps.length > 0) {
    await supabase.from("agent_chain_steps").insert(steps);
  }

  // Create schedule for the chain
  const CRON_INTERVALS: Record<string, number> = {
    "4h": 4 * 60 * 60 * 1000,
    "8h": 8 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
  };

  const nextRunAt = new Date(Date.now() + (CRON_INTERVALS[frequency] || CRON_INTERVALS["24h"])).toISOString();

  const { data: schedule } = await supabase
    .from("agent_schedules")
    .insert({
      user_id: user.id,
      name: template.name,
      schedule_type: "chain",
      cron_expression: frequency,
      chain_id: chain.id,
      enabled: true,
      next_run_at: nextRunAt,
    })
    .select()
    .single();

  return NextResponse.json({ chain, schedule });
}
