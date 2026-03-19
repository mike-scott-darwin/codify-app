import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client for machine-to-machine access (OpenClaw on M1)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function validateApiKey(request: NextRequest): boolean {
  const key = request.headers.get("x-api-key");
  return key === process.env.OPENCLAW_API_KEY;
}

// GET — Fetch pending queue items for a user
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("user_id");
  const status = request.nextUrl.searchParams.get("status") || "pending";
  const since = request.nextUrl.searchParams.get("since"); // ISO timestamp

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  let query = supabase
    .from("content_queue")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (since) {
    query = query.gte("created_at", since);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [], count: data?.length || 0 });
}

// PATCH — Approve/reject a queue item
export async function PATCH(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, action, feedback } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("content_queue")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      user_feedback: feedback || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

// POST — Add item to queue (from OpenClaw agents)
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { user_id, title, summary, source, topics, suggested_formats, relevance_score } = body;

  if (!user_id || !title) {
    return NextResponse.json({ error: "user_id and title required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("content_queue")
    .insert({
      user_id,
      title,
      summary: summary || null,
      source: source || "openclaw",
      relevance_score: relevance_score || 0,
      topics: topics || [],
      suggested_formats: suggested_formats || [],
      metadata: {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
