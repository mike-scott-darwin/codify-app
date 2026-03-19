import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Get current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Monthly token usage
  const { data: usage } = await supabase
    .from("agent_token_usage")
    .select("agent_type, tokens_input, tokens_output, tokens_total, cost_estimate_usd, created_at")
    .eq("user_id", user.id)
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd);

  // Aggregate by agent type
  const byAgent: Record<string, { runs: number; tokens: number; cost: number }> = {};
  let totalTokens = 0;
  let totalCost = 0;
  let totalRuns = 0;

  if (usage) {
    for (const row of usage) {
      const type = row.agent_type;
      if (!byAgent[type]) byAgent[type] = { runs: 0, tokens: 0, cost: 0 };
      byAgent[type].runs += 1;
      byAgent[type].tokens += Number(row.tokens_total) || 0;
      byAgent[type].cost += Number(row.cost_estimate_usd) || 0;
      totalTokens += Number(row.tokens_total) || 0;
      totalCost += Number(row.cost_estimate_usd) || 0;
      totalRuns += 1;
    }
  }

  // Budget settings
  const { data: budget } = await supabase
    .from("agent_budget_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    month: now.toLocaleString("default", { month: "long", year: "numeric" }),
    totalTokens,
    totalCost: Math.round(totalCost * 1000000) / 1000000,
    totalRuns,
    byAgent,
    budget: budget || null,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const { monthlyTokenCap, monthlyCostCap, alertThreshold } = body;

  const { data, error } = await supabase
    .from("agent_budget_settings")
    .upsert({
      user_id: user.id,
      monthly_token_cap: monthlyTokenCap || null,
      monthly_cost_cap: monthlyCostCap || null,
      alert_threshold: alertThreshold || 80,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to save budget settings." }, { status: 500 });

  return NextResponse.json({ budget: data });
}
