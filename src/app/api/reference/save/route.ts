import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { fileType, content } = body;

  const validTypes = ["soul", "offer", "audience", "voice"];
  if (!validTypes.includes(fileType)) {
    return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
  }
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content required." }, { status: 400 });
  }

  // Upsert the enriched content into interview_answers
  const { error } = await supabase
    .from("interview_answers")
    .upsert(
      {
        user_id: user.id,
        file_type: fileType,
        enriched_content: content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,file_type" }
    );

  if (error) {
    console.error("Reference save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also push to GitHub if user has a connected repo
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("github_config")
      .eq("user_id", user.id)
      .single();

    if (profile?.github_config?.token && profile.github_config.repo) {
      const { token, username, repo } = profile.github_config;
      const path = `reference/core/${fileType}.md`;
      const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

      // Get current file SHA if it exists
      let sha: string | undefined;
      try {
        const getRes = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (getRes.ok) {
          const existing = await getRes.json();
          sha = existing.sha;
        }
      } catch {
        // File doesn't exist yet, that's fine
      }

      await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `[codify] Update ${fileType}.md via research codification`,
          content: Buffer.from(content).toString("base64"),
          ...(sha ? { sha } : {}),
        }),
      });
    }
  } catch (err) {
    // GitHub push is best-effort, don't fail the save
    console.error("GitHub push error:", err);
  }

  return NextResponse.json({ success: true });
}
