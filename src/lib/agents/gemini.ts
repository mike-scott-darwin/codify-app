import { callLLM } from "@/lib/llm/provider";
import { getUserLLMConfig } from "@/lib/llm/user-config";
import type { LLMConfig } from "@/lib/llm/provider";

export async function callGemini(
  system: string,
  prompt: string,
  userId?: string
): Promise<string> {
  let config: LLMConfig = { provider: "gemini" };

  if (userId) {
    try {
      config = await getUserLLMConfig(userId);
    } catch {
      // Fall back to default Gemini if config load fails
    }
  }

  return callLLM(config, system, prompt);
}
