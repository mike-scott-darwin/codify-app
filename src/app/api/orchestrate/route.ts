import { createSupabaseServer } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import { getFileContent, listDirectory } from "@/lib/vault";
import { AGENTS, getAgent } from "@/lib/agents";
import { NextResponse } from "next/server";

// Orchestrate runs multiple agents in sequence on a single goal.
// 1. Strategy agent breaks the goal into agent-specific tasks
// 2. Each assigned agent runs with the goal + its task + prior outputs
// 3. Strategy summarises at the end

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user.email ?? "")
    .single();

  if (!client) {
    return NextResponse.json({ error: "No client config found" }, { status: 403 });
  }

  const githubToken = client.github_token || process.env.GITHUB_TOKEN;
  const repo = client.github_repo;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!githubToken || !repo || !anthropicKey) {
    return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
  }

  const { goal } = await request.json();
  if (!goal?.trim()) {
    return NextResponse.json({ error: "No goal provided" }, { status: 400 });
  }

  // Load vault context
  let vaultContext = "";
  try {
    const coreFiles = ["reference/core/soul.md", "reference/core/offer.md", "reference/core/audience.md", "reference/core/voice.md"];
    const cores = await Promise.all(
      coreFiles.map(async (path) => {
        try {
          const doc = await getFileContent(githubToken, repo, path);
          return `## ${path}\n${doc.content.slice(0, 1500)}`;
        } catch {
          return "";
        }
      })
    );
    vaultContext = cores.filter(Boolean).join("\n\n");
  } catch {
    // Continue without
  }

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, ...data as object })}\n\n`));
      }

      try {
        // --- Step 1: Strategy agent creates the plan ---
        send("plan_start", { message: "Strategy agent analysing goal..." });

        const availableAgents = AGENTS.map(a => `- ${a.id}: ${a.name} — ${a.shortDescription}`).join("\n");

        const planResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: `You are the Strategy agent coordinating an orchestrated workflow. You have a team of specialist agents:

${availableAgents}

Given a business goal, create a plan that assigns specific tasks to the right agents. Return your plan as JSON with this structure:
{
  "summary": "One sentence summary of the orchestration plan",
  "steps": [
    { "agentId": "brand", "task": "Specific task for this agent", "reason": "Why this agent" }
  ]
}

Rules:
- Use 3-5 agents maximum (not all 8)
- Order matters — earlier agents' output feeds into later agents
- Each task should be specific and actionable
- Don't include "strategy" as a step — you ARE the strategy agent
- Return ONLY the JSON, no other text`,
          messages: [{ role: "user", content: `Goal: ${goal}\n\nVault context:\n${vaultContext}` }],
        });

        const planText = planResponse.content[0].type === "text" ? planResponse.content[0].text : "";
        let plan: { summary: string; steps: { agentId: string; task: string; reason: string }[] };

        try {
          // Extract JSON from response (handle markdown code fences)
          const jsonMatch = planText.match(/\{[\s\S]*\}/);
          plan = JSON.parse(jsonMatch?.[0] || planText);
        } catch {
          send("error", { message: "Failed to parse orchestration plan" });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        send("plan_ready", {
          summary: plan.summary,
          steps: plan.steps.map(s => ({
            agentId: s.agentId,
            agentName: getAgent(s.agentId)?.name || s.agentId,
            agentEmoji: getAgent(s.agentId)?.emoji || "◆",
            agentGradient: getAgent(s.agentId)?.gradient || "",
            task: s.task,
            reason: s.reason,
            status: "waiting",
          })),
        });

        // --- Step 2: Run each agent in sequence ---
        const agentOutputs: { agentId: string; agentName: string; output: string }[] = [];

        for (let i = 0; i < plan.steps.length; i++) {
          const step = plan.steps[i];
          const agent = getAgent(step.agentId);
          if (!agent) continue;

          send("agent_start", { index: i, agentId: step.agentId, agentName: agent.name });

          // Build context from previous agent outputs
          const priorContext = agentOutputs.length > 0
            ? `\n\n## Prior Agent Outputs\n${agentOutputs.map(o => `### ${o.agentName}\n${o.output}`).join("\n\n")}`
            : "";

          const agentResponse = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 3000,
            system: `You are the ${agent.name} agent in an orchestrated workflow.

${agent.systemPrompt}

You are working on part of a larger goal. Focus specifically on YOUR assigned task.
Be concise and actionable — your output will feed into the next agent.

Vault context:
${vaultContext}
${priorContext}`,
            messages: [{ role: "user", content: `Overall goal: ${goal}\n\nYour specific task: ${step.task}` }],
            stream: true,
          });

          let agentOutput = "";
          for await (const event of agentResponse) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              agentOutput += event.delta.text;
              send("agent_delta", { index: i, agentId: step.agentId, delta: event.delta.text });
            }
          }

          agentOutputs.push({ agentId: step.agentId, agentName: agent.name, output: agentOutput });
          send("agent_complete", { index: i, agentId: step.agentId });
        }

        // --- Step 3: Strategy summarises ---
        send("summary_start", { message: "Strategy agent summarising results..." });

        const summaryResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: `You are the Strategy agent. Summarise the orchestrated workflow results.
Be concise. Highlight the key deliverables, decisions made, and recommended next steps.
Write for a business owner — plain language, no jargon.`,
          messages: [{
            role: "user",
            content: `Goal: ${goal}\n\nAgent outputs:\n${agentOutputs.map(o => `### ${o.agentName}\n${o.output}`).join("\n\n")}`,
          }],
          stream: true,
        });

        let summaryOutput = "";
        for await (const event of summaryResponse) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            summaryOutput += event.delta.text;
            send("summary_delta", { delta: event.delta.text });
          }
        }

        send("complete", { message: "Orchestration complete" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        send("error", { message: errMsg });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
