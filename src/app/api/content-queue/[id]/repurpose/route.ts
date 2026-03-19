import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getGenerationPrompt } from "@/lib/generation-prompts";
import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";
import type { OutputType } from "@/lib/generation-types";

const VALID_TYPES: OutputType[] = ["ad_copy", "social_post", "email_sequence", "vsl_script", "landing_page", "newsletter"];

const TYPE_LABELS: Record<string, string> = {
  ad_copy: "Ad Copy",
  social_post: "Social Post",
  email_sequence: "Email Sequence",
  vsl_script: "VSL Script",
  landing_page: "Landing Page",
  newsletter: "Newsletter",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Get the queue item
  const { data: queueItem, error: queueError } = await supabase
    .from("content_queue")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (queueError || !queueItem) {
    return NextResponse.json({ error: "Queue item not found." }, { status: 404 });
  }

  const body = await request.json();
  const { formats } = body;

  if (!formats || !Array.isArray(formats) || formats.length === 0) {
    return NextResponse.json({ error: "At least one format is required." }, { status: 400 });
  }

  // Validate all formats
  const validFormats = formats.filter((f: string) => VALID_TYPES.includes(f as OutputType));
  if (validFormats.length === 0) {
    return NextResponse.json({ error: "No valid formats provided." }, { status: 400 });
  }

  // Load reference files
  const { data: answers } = await supabase
    .from("interview_answers")
    .select("file_type, enriched_content, answers")
    .eq("user_id", user.id);

  const refs: Record<string, string> = {};
  if (answers) {
    for (const row of answers) {
      refs[row.file_type] = row.enriched_content || JSON.stringify(row.answers);
    }
  }

  if (Object.keys(refs).length === 0) {
    return NextResponse.json({
      error: "Build at least one reference file before generating.",
    }, { status: 400 });
  }

  const config = await getUserLLMConfig(user.id);
  const outputIds: string[] = [];
  const errors: string[] = [];

  for (const format of validFormats) {
    try {
      // Build options with the queue item context as the topic/seed
      const options: Record<string, string> = {
        topic: queueItem.title + (queueItem.summary ? ": " + queueItem.summary : ""),
      };

      const { system, user: userPrompt } = getGenerationPrompt(format as OutputType, refs, options);
      const content = await callLLM(config, system, userPrompt);

      const title = TYPE_LABELS[format] + " — " + queueItem.title;

      const { data: inserted } = await supabase.from("outputs").insert({
        user_id: user.id,
        output_type: format,
        title,
        prompt_config: { queue_item_id: id, ...options },
        content,
        reference_snapshot: refs,
      }).select("id").single();

      if (inserted) outputIds.push(inserted.id);

      await supabase.from("generation_log").insert({
        user_id: user.id,
        output_type: format,
      });
    } catch (err: unknown) {
      console.error("Repurpose error for " + format + ":", err instanceof Error ? err.message : err);
      errors.push(format);
    }
  }

  // Update queue item status to generated
  if (outputIds.length > 0) {
    await supabase
      .from("content_queue")
      .update({
        status: "generated",
        metadata: { ...((queueItem.metadata as Record<string, unknown>) || {}), output_ids: outputIds },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  return NextResponse.json({
    outputIds,
    errors,
    generated: outputIds.length,
    failed: errors.length,
  });
}
