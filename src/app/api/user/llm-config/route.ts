import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserLLMConfig, saveUserLLMConfig } from "@/lib/llm/user-config";
import type { LLMProvider, LLMConfig } from "@/lib/llm/provider";
import { callLLM } from "@/lib/llm/provider";

const VALID_PROVIDERS: LLMProvider[] = ["gemini", "openai", "anthropic", "ollama"];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getUserLLMConfig(user.id);
  // Never return the raw API key to the client — mask it
  const safeConfig = {
    ...config,
    apiKey: config.apiKey ? "****" + config.apiKey.slice(-4) : undefined,
  };
  return NextResponse.json({ config: safeConfig });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const provider = body.provider as string;
  if (!provider || !VALID_PROVIDERS.includes(provider as LLMProvider)) {
    return NextResponse.json(
      { error: "Invalid provider. Must be: " + VALID_PROVIDERS.join(", ") },
      { status: 400 }
    );
  }

  const config: LLMConfig = {
    provider: provider as LLMProvider,
    apiKey: typeof body.apiKey === "string" && body.apiKey.length > 0 ? body.apiKey : undefined,
    model: typeof body.model === "string" && body.model.length > 0 ? body.model : undefined,
    baseUrl: typeof body.baseUrl === "string" && body.baseUrl.length > 0 ? body.baseUrl : undefined,
  };

  // If apiKey is masked (from GET), preserve the existing key
  if (config.apiKey && config.apiKey.startsWith("****")) {
    const existing = await getUserLLMConfig(user.id);
    config.apiKey = existing.apiKey;
  }

  // Test mode
  if (body.test === true) {
    try {
      await callLLM(config, "You are a test assistant.", "Say OK.");
      return NextResponse.json({ success: true, message: "Connection successful." });
    } catch (err: unknown) {
      return NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : "Connection failed." },
        { status: 400 }
      );
    }
  }

  await saveUserLLMConfig(user.id, config);
  return NextResponse.json({ success: true });
}
