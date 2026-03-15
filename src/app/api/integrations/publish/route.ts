import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { IntegrationConnection, Platform, PublishLogEntry } from "@/lib/integrations/types";
import { publishToIntegration } from "@/lib/integrations/publish";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    platform: Platform;
    outputId?: string;
    content: string;
    outputType: string;
    metadata?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { platform, outputId, content, outputType, metadata } = body;

  // Load user integrations
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("integrations")
    .eq("user_id", user.id)
    .single();

  const integrations: IntegrationConnection[] = profile?.integrations || [];
  const connection = integrations.find((i) => i.platform === platform && i.enabled);

  if (!connection) {
    return NextResponse.json(
      { error: "No active connection for " + platform },
      { status: 400 }
    );
  }

  const result = await publishToIntegration(connection, outputType, content, metadata);

  // Log the publish attempt to the output record if outputId provided
  if (outputId) {
    const { data: output } = await supabase
      .from("outputs")
      .select("publish_log")
      .eq("id", outputId)
      .eq("user_id", user.id)
      .single();

    const existingLog: PublishLogEntry[] = output?.publish_log || [];
    const logEntry: PublishLogEntry = {
      platform,
      publishedAt: new Date().toISOString(),
      externalId: result.externalId,
      success: result.success,
      message: result.message,
    };
    existingLog.push(logEntry);

    await supabase
      .from("outputs")
      .update({ publish_log: existingLog })
      .eq("id", outputId)
      .eq("user_id", user.id);
  }

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
