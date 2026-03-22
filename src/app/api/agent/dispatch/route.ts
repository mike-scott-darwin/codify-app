import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AGENT_CONFIGS } from "@/lib/agents/types";
import { TIER_HIERARCHY } from "@/lib/tier";
import type { AgentType } from "@/lib/agents/types";
import type { Tier } from "@/lib/tier";

const VALID_TYPES = Object.keys(AGENT_CONFIGS);

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json();
  const { agentType, config = {} } = body;

  if (!agentType || !VALID_TYPES.includes(agentType)) {
    return NextResponse.json({ error: "Invalid agent type." }, { status: 400 });
  }

  // Tier check
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tier")
    .eq("user_id", user.id)
    .single();

  const tier = (profile?.tier || "brain_sync") as Tier;
  const agentConfig = AGENT_CONFIGS[agentType as AgentType];
  if (TIER_HIERARCHY[tier] < TIER_HIERARCHY[agentConfig.requiredTier]) {
    return NextResponse.json({
      error: "Upgrade to " + agentConfig.requiredTier.toUpperCase() + " to use " + agentConfig.label + ".",
      requiredTier: agentConfig.requiredTier,
    }, { status: 403 });
  }

  // Create job
  const { data: job, error } = await supabase
    .from("agent_jobs")
    .insert({
      user_id: user.id,
      agent_type: agentType,
      config,
      status: "pending",
      progress: { step: 0, totalSteps: agentConfig.steps, currentAction: "Starting..." },
    })
    .select()
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Failed to create job." }, { status: 500 });
  }

  // Kick off the agent (fire and forget — don't await)
  const baseUrl = request.nextUrl.origin;
  fetch(baseUrl + "/api/agent/run/" + job.id, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: request.headers.get("cookie") || "",
    },
  }).catch(() => {});

  return NextResponse.json({ jobId: job.id });
}
