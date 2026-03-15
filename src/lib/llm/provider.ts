import { GoogleGenerativeAI } from "@google/generative-ai";

export type LLMProvider = "gemini" | "openai" | "anthropic" | "ollama";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
  ollama: "llama3.1",
};

export const PROVIDER_OPTIONS: {
  label: string;
  value: LLMProvider;
  description: string;
  models: string[];
}[] = [
  {
    label: "Gemini",
    value: "gemini",
    description: "Google Gemini — uses platform key by default",
    models: ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.5-flash"],
  },
  {
    label: "OpenAI",
    value: "openai",
    description: "OpenAI GPT models — requires your own API key",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
  },
  {
    label: "Anthropic",
    value: "anthropic",
    description: "Anthropic Claude models — requires your own API key",
    models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"],
  },
  {
    label: "Ollama",
    value: "ollama",
    description: "Local Ollama instance — no API key needed",
    models: ["llama3.1", "llama3.2", "mistral", "mixtral", "codellama", "gemma2"],
  },
];

async function callGeminiProvider(
  apiKey: string,
  model: string,
  system: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const m = genAI.getGenerativeModel({ model });
  const result = await m.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { role: "model", parts: [{ text: system }] },
  });
  return result.response.text();
}

async function callOpenAIProvider(
  apiKey: string,
  model: string,
  system: string,
  prompt: string
): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return response.choices[0]?.message?.content || "";
}

async function callAnthropicProvider(
  apiKey: string,
  model: string,
  system: string,
  prompt: string
): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

async function callOllamaProvider(
  baseUrl: string,
  model: string,
  system: string,
  prompt: string
): Promise<string> {
  const url = baseUrl.replace(/\/+$/, "") + "/api/generate";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, system, prompt, stream: false }),
  });
  if (!res.ok) {
    throw new Error("Ollama request failed: " + res.status + " " + (await res.text()));
  }
  const data = await res.json();
  return data.response || "";
}

export async function callLLM(
  config: LLMConfig,
  system: string,
  prompt: string
): Promise<string> {
  const provider = config.provider || "gemini";
  const model = config.model || DEFAULT_MODELS[provider];

  switch (provider) {
    case "gemini": {
      const key = config.apiKey || process.env.GOOGLE_API_KEY;
      if (!key) throw new Error("No API key for Gemini. Set GOOGLE_API_KEY or provide your own.");
      return callGeminiProvider(key, model, system, prompt);
    }
    case "openai": {
      if (!config.apiKey) throw new Error("OpenAI requires an API key.");
      return callOpenAIProvider(config.apiKey, model, system, prompt);
    }
    case "anthropic": {
      if (!config.apiKey) throw new Error("Anthropic requires an API key.");
      return callAnthropicProvider(config.apiKey, model, system, prompt);
    }
    case "ollama": {
      const baseUrl = config.baseUrl || "http://localhost:11434";
      return callOllamaProvider(baseUrl, model, system, prompt);
    }
    default:
      throw new Error("Unknown LLM provider: " + provider);
  }
}
