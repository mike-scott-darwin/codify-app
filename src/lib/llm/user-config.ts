import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { LLMConfig, LLMProvider } from "./provider";

const VALID_PROVIDERS: LLMProvider[] = ["gemini", "openai", "anthropic", "ollama"];

export async function getUserLLMConfig(userId: string): Promise<LLMConfig> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("llm_config")
    .eq("user_id", userId)
    .single();

  if (!data?.llm_config) {
    return { provider: "gemini" };
  }

  const cfg = data.llm_config as Record<string, unknown>;
  const provider = VALID_PROVIDERS.includes(cfg.provider as LLMProvider)
    ? (cfg.provider as LLMProvider)
    : "gemini";

  return {
    provider,
    apiKey: typeof cfg.apiKey === "string" ? cfg.apiKey : undefined,
    model: typeof cfg.model === "string" ? cfg.model : undefined,
    baseUrl: typeof cfg.baseUrl === "string" ? cfg.baseUrl : undefined,
  };
}

export async function saveUserLLMConfig(
  userId: string,
  config: LLMConfig
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("user_profiles")
    .update({ llm_config: config })
    .eq("user_id", userId);
}
