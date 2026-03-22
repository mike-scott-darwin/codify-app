import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load current topic
  const { data: topic } = await supabase
    .from("research_topics")
    .select("title, content, decision, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!topic)
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  // Load all other topics
  const { data: allTopics } = await supabase
    .from("research_topics")
    .select("id, title, status, decision, content")
    .eq("user_id", user.id)
    .neq("id", id);

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content")
    .eq("user_id", user.id);

  const refSummary = (answers || [])
    .filter((a) => a.enriched_content)
    .map((a) => `${a.file_type}: ${a.enriched_content.substring(0, 300)}`)
    .join("\n");

  const otherTopicsList = (allTopics || [])
    .map(
      (t) =>
        `- "${t.title}" [${t.status}]${t.decision ? " — Decision: " + t.decision.substring(0, 150) : ""}${t.content ? " — Notes: " + t.content.substring(0, 150) : ""}`
    )
    .join("\n");

  const system = `You are a research assistant that finds connections between research topics for a business owner. Return valid JSON only, no markdown fences.`;

  const userPrompt = `Current topic: "${topic.title}"
Notes: ${(topic.content || "").substring(0, 500)}
Decision: ${topic.decision || "(none)"}

Other research topics:
${otherTopicsList || "(none yet)"}

Reference files summary:
${refSummary || "(none yet)"}

Analyze the current topic against the other research topics and reference files. Find:
1. "related" — other topics that connect to this one (by id and a short reason why they connect)
2. "gaps" — 2-3 questions the user hasn't explored yet that would strengthen their understanding (based on patterns across ALL their research and reference files)
3. "strengthens" — which reference files (soul, offer, audience, voice) this topic makes stronger, with a one-line reason

Return JSON in this exact format:
{
  "related": [{"id": "topic-uuid", "title": "topic title", "reason": "short connection reason"}],
  "gaps": ["question 1", "question 2"],
  "strengthens": [{"file": "soul", "reason": "short reason"}],
  "connection_count": 5
}

Rules:
- Only include genuinely related topics, not forced connections
- Gaps should be specific and actionable, not generic
- connection_count = related.length + strengthens.length + number of previous topics that informed this one
- If there are no other topics yet, return empty related array but still suggest gaps based on reference files`;

  try {
    const config = await getUserLLMConfig(user.id);
    const raw = await callLLM(config, system, userPrompt);

    // Parse JSON from response
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Connections error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { related: [], gaps: [], strengthens: [], connection_count: 0 },
      { status: 200 }
    );
  }
}
