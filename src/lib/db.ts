import { createClient } from "@/lib/supabase";

function hasSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export type FileType = "soul" | "offer" | "audience" | "voice";

interface SavedAnswers {
  file_type: FileType;
  answers: Record<string, string>;
  enriched_content: string | null;
}

export async function saveAnswers(
  fileType: FileType,
  answers: Record<string, string>,
  enrichedContent?: string | null
): Promise<{ error: string | null }> {
  // Always save to sessionStorage
  sessionStorage.setItem(`codify-interview-${fileType}`, JSON.stringify(answers));
  if (enrichedContent) {
    sessionStorage.setItem(`codify-enriched-${fileType}`, enrichedContent);
  }

  if (!hasSupabase()) return { error: null };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: null };
  }

  const { error } = await supabase
    .from("interview_answers")
    .upsert(
      {
        user_id: user.id,
        file_type: fileType,
        answers,
        enriched_content: enrichedContent ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,file_type" }
    );

  return { error: error?.message ?? null };
}

export async function loadAllAnswers(): Promise<SavedAnswers[]> {
  if (!hasSupabase()) return [];

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("interview_answers")
    .select("file_type, answers, enriched_content")
    .eq("user_id", user.id);

  if (error || !data) return [];

  // Sync to sessionStorage
  data.forEach((row) => {
    sessionStorage.setItem(`codify-interview-${row.file_type}`, JSON.stringify(row.answers));
    if (row.enriched_content) {
      sessionStorage.setItem(`codify-enriched-${row.file_type}`, row.enriched_content);
    }
  });

  return data as SavedAnswers[];
}

export async function getEnrichmentCount(): Promise<number> {
  if (!hasSupabase()) return 0;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("enrichment_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

export async function logEnrichment(fileType: FileType): Promise<void> {
  if (!hasSupabase()) return;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("enrichment_log").insert({
    user_id: user.id,
    file_type: fileType,
  });
}
