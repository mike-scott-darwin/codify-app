import type { SupabaseClient } from "@supabase/supabase-js";

export async function executeChain(
  chainRunId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Load chain run
  const { data: chainRun } = await supabase
    .from("agent_chain_runs")
    .select("*, agent_chains(id, name)")
    .eq("id", chainRunId)
    .single();

  if (!chainRun) throw new Error("Chain run not found: " + chainRunId);

  // Load chain steps
  const { data: steps } = await supabase
    .from("agent_chain_steps")
    .select("*")
    .eq("chain_id", chainRun.chain_id)
    .order("step_order", { ascending: true });

  if (!steps || steps.length === 0) {
    await supabase
      .from("agent_chain_runs")
      .update({ status: "failed", error: "No steps defined for chain." })
      .eq("id", chainRunId);
    return;
  }

  // Update chain run with total steps and mark as running
  await supabase
    .from("agent_chain_runs")
    .update({
      status: "running",
      current_step: 1,
      total_steps: steps.length,
      started_at: new Date().toISOString(),
    })
    .eq("id", chainRunId);

  // Dispatch first step
  const firstStep = steps[0];
  const config = { ...(firstStep.config || {}) };

  const { data: job } = await supabase
    .from("agent_jobs")
    .insert({
      user_id: chainRun.user_id,
      agent_type: firstStep.agent_type,
      config,
      status: "pending",
      progress: { step: 0, totalSteps: 1, currentAction: "Starting..." },
      chain_run_id: chainRunId,
      schedule_id: chainRun.schedule_id,
    })
    .select()
    .single();

  if (job) {
    // Record the chain run step
    await supabase.from("agent_chain_run_steps").insert({
      chain_run_id: chainRunId,
      step_order: firstStep.step_order,
      agent_job_id: job.id,
      input_data: config,
    });
  }

  return;
}

export async function advanceChain(
  chainRunId: string,
  completedJobId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Load chain run
  const { data: chainRun } = await supabase
    .from("agent_chain_runs")
    .select("*")
    .eq("id", chainRunId)
    .single();

  if (!chainRun) return;

  // Load completed job result
  const { data: completedJob } = await supabase
    .from("agent_jobs")
    .select("result, status, agent_type")
    .eq("id", completedJobId)
    .single();

  if (!completedJob) return;

  // If the job failed, mark chain as partial/failed
  if (completedJob.status === "failed") {
    await supabase
      .from("agent_chain_runs")
      .update({
        status: "partial",
        error: "Step failed: " + completedJob.agent_type,
        completed_at: new Date().toISOString(),
      })
      .eq("id", chainRunId);
    return;
  }

  const currentStep = chainRun.current_step;
  const totalSteps = chainRun.total_steps;

  // Check if this was the last step
  if (currentStep >= totalSteps) {
    await supabase
      .from("agent_chain_runs")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", chainRunId);
    return;
  }

  // Load next step
  const nextStepOrder = currentStep + 1;
  const { data: steps } = await supabase
    .from("agent_chain_steps")
    .select("*")
    .eq("chain_id", chainRun.chain_id)
    .order("step_order", { ascending: true });

  const nextStep = steps?.find((s) => s.step_order === nextStepOrder);

  if (!nextStep) {
    await supabase
      .from("agent_chain_runs")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", chainRunId);
    return;
  }

  // Build config for next step using input_mapping
  const previousOutput =
    typeof completedJob.result === "object" && completedJob.result !== null
      ? (completedJob.result as Record<string, unknown>).content || JSON.stringify(completedJob.result)
      : String(completedJob.result || "");

  const nextConfig: Record<string, unknown> = { ...(nextStep.config || {}) };
  const inputMapping = (nextStep.input_mapping || {}) as Record<string, string>;

  for (const [key, value] of Object.entries(inputMapping)) {
    if (value === "previous_output") {
      nextConfig[key] = previousOutput;
    }
  }

  // Update chain run progress
  await supabase
    .from("agent_chain_runs")
    .update({ current_step: nextStepOrder })
    .eq("id", chainRunId);

  // Create next job
  const { data: job } = await supabase
    .from("agent_jobs")
    .insert({
      user_id: chainRun.user_id,
      agent_type: nextStep.agent_type,
      config: nextConfig,
      status: "pending",
      progress: { step: 0, totalSteps: 1, currentAction: "Starting..." },
      chain_run_id: chainRunId,
      schedule_id: chainRun.schedule_id,
    })
    .select()
    .single();

  if (job) {
    await supabase.from("agent_chain_run_steps").insert({
      chain_run_id: chainRunId,
      step_order: nextStep.step_order,
      agent_job_id: job.id,
      input_data: nextConfig,
    });
  }
}
