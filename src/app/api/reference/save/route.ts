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

  return NextResponse.json({ success: true });
}
