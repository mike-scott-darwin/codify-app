import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const VALID_FILE_TYPES = ["soul", "offer", "audience", "voice"] as const;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { fileType, content } = body;

  if (
    !fileType ||
    !VALID_FILE_TYPES.includes(fileType as (typeof VALID_FILE_TYPES)[number])
  ) {
    return NextResponse.json(
      { error: "Invalid fileType. Must be: " + VALID_FILE_TYPES.join(", ") },
      { status: 400 }
    );
  }

  if (typeof content !== "string") {
    return NextResponse.json(
      { error: "Content must be a string." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("interview_answers").upsert(
    {
      user_id: user.id,
      file_type: fileType,
      enriched_content: content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,file_type" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }


  // Non-blocking: commit to GitHub if connected
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("github_config")
      .eq("user_id", user.id)
      .single();
    if (profile?.github_config) {
      const { writeFileToRepo } = await import("@/lib/github");
      const ghConfig = profile.github_config as { token: string; owner: string; repo: string; branch?: string };
      writeFileToRepo(
        ghConfig,
        `reference/core/${fileType}.md`,
        content,
        `[codify] Apply codified content to ${fileType}.md`
      ).catch((err: unknown) => {
        console.error("GitHub commit failed (non-blocking):", err instanceof Error ? err.message : err);
      });
    }
  } catch {
    // GitHub commit is non-blocking
  }

  return NextResponse.json({ success: true });
}
