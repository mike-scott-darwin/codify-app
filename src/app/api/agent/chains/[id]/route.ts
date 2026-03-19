import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { executeChain } from "@/lib/agents/chain-runner";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Load chain with steps
  const { data: chain } = await supabase
    .from("agent_chains")
    .select("*, agent_chain_steps(*)")
    .eq("id", id)
    .single();

  if (!chain) return NextResponse.json({ error: "Chain not found." }, { status: 404 });

  // Check ownership (or template)
  if (!chain.is_template && chain.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  // Load recent runs
  const { data: runs } = await supabase
    .from("agent_chain_runs")
    .select("*")
    .eq("chain_id", id)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ chain, runs: runs || [] });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Verify chain ownership
  const { data: chain } = await supabase
    .from("agent_chains")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!chain) return NextResponse.json({ error: "Chain not found." }, { status: 404 });

  // Get step count
  const { data: steps } = await supabase
    .from("agent_chain_steps")
    .select("id")
    .eq("chain_id", id);

  // Create chain run
  const { data: chainRun, error } = await supabase
    .from("agent_chain_runs")
    .insert({
      user_id: user.id,
      chain_id: id,
      status: "pending",
      total_steps: steps?.length || 0,
    })
    .select()
    .single();

  if (error || !chainRun) {
    return NextResponse.json({ error: "Failed to create chain run." }, { status: 500 });
  }

  // Fire and forget
  executeChain(chainRun.id, supabase).catch((err) => {
    console.error("Chain execution error:", err);
  });

  return NextResponse.json({ chainRunId: chainRun.id });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Delete associated schedules
  await supabase
    .from("agent_schedules")
    .delete()
    .eq("chain_id", id)
    .eq("user_id", user.id);

  // Delete the chain (cascade will handle steps)
  const { error } = await supabase
    .from("agent_chains")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Failed to delete chain." }, { status: 500 });

  return NextResponse.json({ success: true });
}
