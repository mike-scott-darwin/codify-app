import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { IntegrationConnection, Platform } from "@/lib/integrations/types";
import { PLATFORM_CONFIGS } from "@/lib/integrations/types";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("integrations")
    .eq("user_id", user.id)
    .single();

  const integrations: IntegrationConnection[] = profile?.integrations || [];

  // Mask credentials before sending to client
  const safeIntegrations = integrations.map((i) => ({
    ...i,
    credentials: Object.fromEntries(
      Object.entries(i.credentials).map(([k, v]) => [
        k,
        v && v.length > 4 ? "****" + v.slice(-4) : "****",
      ])
    ),
  }));

  return NextResponse.json({ integrations: safeIntegrations });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { platform: Platform; credentials: Record<string, string>; label?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { platform, credentials, label } = body;

  if (!platform || !PLATFORM_CONFIGS[platform]) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  // Validate required fields
  const config = PLATFORM_CONFIGS[platform];
  for (const field of config.fields) {
    if (field.required && (!credentials[field.key] || credentials[field.key].trim() === "")) {
      return NextResponse.json(
        { error: field.label + " is required" },
        { status: 400 }
      );
    }
  }

  // Get existing integrations
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("integrations")
    .eq("user_id", user.id)
    .single();

  const existing: IntegrationConnection[] = profile?.integrations || [];

  // Replace if platform already exists, otherwise add
  const filtered = existing.filter((i) => i.platform !== platform);
  const newConnection: IntegrationConnection = {
    id: platform + "_" + Date.now(),
    platform,
    credentials,
    enabled: true,
    label: label || config.label,
  };
  filtered.push(newConnection);

  const { error } = await supabase
    .from("user_profiles")
    .update({ integrations: filtered })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: config.label + " connected" });
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { platform: Platform };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("integrations")
    .eq("user_id", user.id)
    .single();

  const existing: IntegrationConnection[] = profile?.integrations || [];
  const filtered = existing.filter((i) => i.platform !== body.platform);

  const { error } = await supabase
    .from("user_profiles")
    .update({ integrations: filtered })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to remove integration" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Integration disconnected" });
}
