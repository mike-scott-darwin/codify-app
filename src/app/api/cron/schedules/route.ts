import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { executeChain } from "@/lib/agents/chain-runner";

const CRON_INTERVALS: Record<string, number> = {
  "4h": 4 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

function getNextRunAt(cronExpression: string): string {
  const intervalMs = CRON_INTERVALS[cronExpression];
  if (!intervalMs) return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return new Date(Date.now() + intervalMs).toISOString();
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get("x-cron-secret") || request.headers.get("authorization");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();

  // Find due schedules
  const { data: dueSchedules, error } = await supabase
    .from("agent_schedules")
    .select("*")
    .eq("enabled", true)
    .lte("next_run_at", new Date().toISOString());

  if (error || !dueSchedules) {
    return NextResponse.json({ error: "Failed to query schedules", detail: error }, { status: 500 });
  }

  const results: { scheduleId: string; status: string; jobId?: string; chainRunId?: string }[] = [];

  for (const schedule of dueSchedules) {
    // Check max_runs
    if (schedule.max_runs && schedule.run_count >= schedule.max_runs) {
      await supabase
        .from("agent_schedules")
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .eq("id", schedule.id);
      results.push({ scheduleId: schedule.id, status: "max_runs_reached" });
      continue;
    }

    try {
      if (schedule.schedule_type === "single" && schedule.agent_type) {
        // Dispatch single agent job
        const { data: job } = await supabase
          .from("agent_jobs")
          .insert({
            user_id: schedule.user_id,
            agent_type: schedule.agent_type,
            config: schedule.config || {},
            status: "pending",
            progress: { step: 0, totalSteps: 1, currentAction: "Starting..." },
            schedule_id: schedule.id,
          })
          .select()
          .single();

        if (job) {
          results.push({ scheduleId: schedule.id, status: "dispatched", jobId: job.id });
        }
      } else if (schedule.schedule_type === "chain" && schedule.chain_id) {
        // Load chain to get step count
        const { data: steps } = await supabase
          .from("agent_chain_steps")
          .select("id")
          .eq("chain_id", schedule.chain_id);

        // Create chain run
        const { data: chainRun } = await supabase
          .from("agent_chain_runs")
          .insert({
            user_id: schedule.user_id,
            chain_id: schedule.chain_id,
            schedule_id: schedule.id,
            status: "pending",
            total_steps: steps?.length || 0,
          })
          .select()
          .single();

        if (chainRun) {
          await executeChain(chainRun.id, supabase);
          results.push({ scheduleId: schedule.id, status: "chain_started", chainRunId: chainRun.id });
        }
      }

      // Update schedule
      await supabase
        .from("agent_schedules")
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: getNextRunAt(schedule.cron_expression),
          run_count: (schedule.run_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", schedule.id);
    } catch (err) {
      console.error("Schedule execution error:", err);
      results.push({ scheduleId: schedule.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
