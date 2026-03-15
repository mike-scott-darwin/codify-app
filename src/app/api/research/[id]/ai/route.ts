import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { question } = body;
  if (!question) return NextResponse.json({ error: "Question required." }, { status: 400 });

  // Load the research topic for context
  const { data: topic } = await supabase
    .from("research_topics")
    .select("title, content, findings")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  // Load reference files for business context
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content")
    .eq("user_id", user.id);

  const refContext = (answers || [])
    .filter((a) => a.enriched_content)
    .map((a) => "=== " + a.file_type.toUpperCase() + " ===\n" + a.enriched_content)
    .join("\n\n");

  const system = "You are a research assistant helping a business owner explore topics and make decisions. Be specific, cite reasoning, and give actionable insights. Use the business context to tailor your research to their specific situation.";

  const userPrompt = `Business context:\n${refContext || "(No reference files yet)"}\n\nResearch topic: ${topic.title}\n\nExisting notes:\n${topic.content || "(none)"}\n\nQuestion: ${question}`;

  try {
    const config = await getUserLLMConfig(user.id);
    const answer = await callLLM(config, system, userPrompt);
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    console.error("Research AI error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "AI research failed." }, { status: 500 });
  }
}
