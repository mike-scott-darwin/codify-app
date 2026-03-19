import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { AgentContext, AgentResult, AgentType } from "./types";
import { runCongruenceAudit } from "./congruence-audit";
import { runAdCampaign } from "./ad-campaign";
import { runDeepResearch } from "./deep-research";
import { runContentCalendar } from "./content-calendar";
import { runEmailCampaign } from "./email-campaign";
import { runResearchScout } from "./research-scout";
import { runTrendMonitor } from "./trend-monitor";
import { runSocialPostGenerator } from "./social-post-generator";
import { runPublisher } from "./publisher-agent";
import { runAuditAgent } from "./audit-agent";
import { advanceChain } from "./chain-runner";

const AGENT_RUNNERS: Record<AgentType, (ctx: AgentContext) => Promise<AgentResult>> = {
  congruence_audit: runCongruenceAudit,
  ad_campaign: runAdCampaign,
  deep_research: runDeepResearch,
  content_calendar: runContentCalendar,
  email_campaign: runEmailCampaign,
  research_scout: runResearchScout,
  trend_monitor: runTrendMonitor,
  social_post_generator: runSocialPostGenerator,
  publisher: runPublisher,
  audit_agent: runAuditAgent,
};

export async function executeAgent(jobId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Load job
  const { data: job } = await supabase
    .from("agent_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!job) throw new Error("Job not found: " + jobId);

  // Mark as running
  await supabase
    .from("agent_jobs")
    .update({ status: "running", updated_at: new Date().toISOString() })
    .eq("id", jobId);

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content, answers")
    .eq("user_id", job.user_id);

  const refs: Record<string, string> = {};
  if (answers) {
    for (const row of answers) {
      refs[row.file_type] = row.enriched_content || JSON.stringify(row.answers);
    }
  }

  // Progress updater
  const updateProgress = async (step: number, totalSteps: number, currentAction: string) => {
    await supabase
      .from("agent_jobs")
      .update({
        progress: { step, totalSteps, currentAction },
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  };

  const ctx: AgentContext = {
    jobId,
    userId: job.user_id,
    config: job.config || {},
    refs,
    updateProgress,
  };

  try {
    const runner = AGENT_RUNNERS[job.agent_type as AgentType];
    if (!runner) throw new Error("Unknown agent type: " + job.agent_type);

    const result = await runner(ctx);

    // Save result
    await supabase
      .from("agent_jobs")
      .update({
        status: "complete",
        result: { title: result.title, content: result.content, structured: result.structured },
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Also save to outputs table
    await supabase.from("outputs").insert({
      user_id: job.user_id,
      output_type: job.agent_type,
      title: result.title,
      prompt_config: job.config,
      content: result.content,
      reference_snapshot: refs,
    });

    // If this job is part of a chain, advance to the next step
    if (job.chain_run_id) {
      try {
        await advanceChain(job.chain_run_id, jobId, supabase);

        // Find the next pending job in this chain and kick it off
        const { data: nextJob } = await supabase
          .from("agent_jobs")
          .select("id")
          .eq("chain_run_id", job.chain_run_id)
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (nextJob) {
          // Recursively execute the next job in the chain
          await executeAgent(nextJob.id);
        }
      } catch (chainErr) {
        console.error("Chain advancement error:", chainErr);
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Agent failed";
    console.error("Agent error:", errorMsg);
    await supabase
      .from("agent_jobs")
      .update({
        status: "failed",
        error: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // If part of a chain, mark chain as partial
    if (job.chain_run_id) {
      try {
        await advanceChain(job.chain_run_id, jobId, supabase);
      } catch {
        // Best effort
      }
    }
  }
}
