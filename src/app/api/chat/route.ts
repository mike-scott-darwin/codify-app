import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("email", user.email ?? "")
    .single();

  if (!client) {
    return NextResponse.json({ error: "No client config found" }, { status: 403 });
  }

  const { messages } = await request.json();
  const hermesUrl = process.env.HERMES_API_URL;
  const hermesKey = process.env.HERMES_API_KEY;

  const hermesResponse = await fetch(`${hermesUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hermesKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "hermes-agent",
      messages,
      stream: true,
    }),
  });

  if (!hermesResponse.ok) {
    return NextResponse.json(
      { error: "Hermes API error" },
      { status: hermesResponse.status }
    );
  }

  return new Response(hermesResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
