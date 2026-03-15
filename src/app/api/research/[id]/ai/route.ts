import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const googleKey = process.env.GOOGLE_API_KEY;
  if (!googleKey) return NextResponse.json({ error: "AI not configured." }, { status: 503 });

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
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { role: "model", parts: [{ text: system }] },
    });

    return NextResponse.json({ answer: result.response.text() });
  } catch (err: unknown) {
    console.error("Research AI error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "AI research failed." }, { status: 500 });
  }
}
