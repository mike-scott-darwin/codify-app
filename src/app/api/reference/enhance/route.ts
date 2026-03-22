import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const fileType = formData.get("fileType") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!fileType || typeof fileType !== "string") {
    return NextResponse.json(
      { error: "fileType is required." },
      { status: 400 }
    );
  }

  // Read uploaded file as text
  let uploadedText: string;
  try {
    uploadedText = await file.text();
  } catch {
    return NextResponse.json(
      { error: "Could not read uploaded file as text." },
      { status: 400 }
    );
  }

  if (!uploadedText.trim()) {
    return NextResponse.json(
      { error: "Uploaded file is empty." },
      { status: 400 }
    );
  }

  // Load current enriched content for this file type
  const { data: answer } = await supabase
    .from("interview_answers")
    .select("enriched_content")
    .eq("user_id", user.id)
    .eq("file_type", fileType)
    .single();

  const currentContent = answer?.enriched_content || "";

  // Load LLM config
  const config = await getUserLLMConfig(user.id);

  const system = `You are enhancing a business reference file. The user is uploading additional information. Integrate this new information naturally into the existing file, strengthening sections and adding specificity. Return the complete updated file.

Rules:
- Return ONLY the complete updated file content — no explanations, no markdown code fences, no preamble
- Integrate new information into the existing structure — do NOT just append at the bottom
- Strengthen existing sections with new specificity where relevant
- Maintain the existing tone, formatting, and structure of the file
- If the uploaded content contradicts existing content, prefer the uploaded content as it represents newer thinking
- Do not add YAML frontmatter unless it already exists in the original`;

  const prompt = `## Current ${fileType}.md Content
${currentContent || "(empty — create initial content based on the uploaded information)"}

## Uploaded Information
${uploadedText}

Generate the complete updated ${fileType}.md file with the uploaded information integrated naturally.`;

  try {
    let result = await callLLM(config, system, prompt);
    // Strip any markdown code fences the model might wrap it in
    result = result
      .replace(/^```(?:markdown|md)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
    // Strip YAML frontmatter if model adds one
    result = result.replace(/^---[\s\S]*?---\s*\n/, "").trim();

    return NextResponse.json({ proposedContent: result });
  } catch (err: unknown) {
    console.error(
      "Enhance LLM error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      {
        error:
          "Failed to generate enhanced content: " +
          (err instanceof Error ? err.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
