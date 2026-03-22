import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";

const VALID_FILE_TYPES = ["soul", "offer", "audience", "voice"] as const;
type RefFileType = (typeof VALID_FILE_TYPES)[number];

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

  // Parse body
  const body = await request.json();
  const targetFiles: string[] = body.targetFiles;
  if (
    !targetFiles ||
    !Array.isArray(targetFiles) ||
    targetFiles.length === 0
  ) {
    return NextResponse.json(
      { error: "targetFiles is required (array of file types)." },
      { status: 400 }
    );
  }

  const validTargets = targetFiles.filter((f) =>
    VALID_FILE_TYPES.includes(f as RefFileType)
  ) as RefFileType[];
  if (validTargets.length === 0) {
    return NextResponse.json(
      { error: "No valid target files. Must be: " + VALID_FILE_TYPES.join(", ") },
      { status: 400 }
    );
  }

  // Load the research topic
  const { data: topic } = await supabase
    .from("research_topics")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!topic)
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  // Must be in decided or deciding status with a decision written
  if (!["decided", "deciding", "decision"].includes(topic.status)) {
    return NextResponse.json(
      { error: "Topic must have a decision before you can codify." },
      { status: 400 }
    );
  }
  if (!topic.decision || topic.decision.trim().length === 0) {
    return NextResponse.json(
      { error: "A decision must be written before codifying." },
      { status: 400 }
    );
  }

  // Load the user's current reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content")
    .eq("user_id", user.id);

  const refMap: Record<string, string> = {};
  (answers || []).forEach((a) => {
    if (a.enriched_content) {
      refMap[a.file_type] = a.enriched_content;
    }
  });

  // Load LLM config
  const config = await getUserLLMConfig(user.id);

  // Generate proposals for each target file
  const proposals: Record<string, string> = {};
  const errors: string[] = [];

  const system = `You are a reference file editor for a business owner's strategic reference system. Your job is to take a research decision and weave its insights naturally into an existing reference file.

Rules:
- Return ONLY the complete updated file content — no explanations, no markdown code fences, no preamble
- Integrate new insights into the existing structure — do NOT just append a new section at the bottom
- Strengthen existing sections with new specificity where relevant
- If a belief or position has evolved based on the decision, update it naturally
- Maintain the existing tone, formatting, and structure of the file
- If the decision is not relevant to the target file, return the file unchanged
- Do not add YAML frontmatter unless it already exists in the original`;

  for (const fileType of validTargets) {
    const currentContent = refMap[fileType] || "";

    const prompt = `## Research Topic
${topic.title}

## Research Notes
${topic.content || "(none)"}

## Decision
${topic.decision}

## Current ${fileType}.md Content
${currentContent || "(empty — create initial content based on the decision)"}

Generate the complete updated ${fileType}.md file with the decision's insights woven in naturally.`;

    try {
      let result = await callLLM(config, system, prompt);
      // Strip any markdown code fences the model might wrap it in
      result = result.replace(/^```(?:markdown|md)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
      // Strip YAML frontmatter if model adds one
      result = result.replace(/^---[\s\S]*?---\s*\n/, "").trim();
      proposals[fileType] = result;
    } catch (err: unknown) {
      console.error("Codify LLM error for " + fileType + ":", err instanceof Error ? err.message : err);
      errors.push(fileType + ": " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  if (Object.keys(proposals).length === 0) {
    return NextResponse.json(
      { error: "Failed to generate any proposals. " + errors.join("; ") },
      { status: 500 }
    );
  }

  // Save proposals to the topic
  await supabase
    .from("research_topics")
    .update({
      codify_proposals: proposals,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({
    proposals,
    currentContent: validTargets.reduce(
      (acc, ft) => {
        acc[ft] = refMap[ft] || "";
        return acc;
      },
      {} as Record<string, string>
    ),
    errors: errors.length > 0 ? errors : undefined,
  });
}
