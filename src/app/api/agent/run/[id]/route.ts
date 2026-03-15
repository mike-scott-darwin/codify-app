import { NextRequest, NextResponse } from "next/server";
import { executeAgent } from "@/lib/agents/runner";

export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await executeAgent(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Agent run error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Agent execution failed." }, { status: 500 });
  }
}
