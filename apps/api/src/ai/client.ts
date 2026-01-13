import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * AI Provider configuration
 *
 * Supports multiple providers via environment variables:
 * - OPENAI_API_KEY for OpenAI
 * - ANTHROPIC_API_KEY for Anthropic
 *
 * User-specific OpenRouter API keys can be passed to getModelWithUserKey
 */

export type AIProvider = "openai" | "anthropic" | "openrouter";

export function getAIProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }
  throw new Error("No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getModel(provider?: AIProvider): any {
  const activeProvider = provider ?? getAIProvider();

  if (activeProvider === "anthropic") {
    const anthropic = createAnthropic();
    return anthropic("claude-sonnet-4-20250514");
  }

  const openai = createOpenAI();
  return openai("gpt-4o-mini");
}

/**
 * Get a model configured with user's OpenRouter API key
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getModelWithUserKey(apiKey: string, modelId?: string): any {
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": process.env.APP_URL || "http://localhost:5173",
      "X-Title": "WDYDN - What Do You Do Next",
    },
  });

  // Default to a capable model if not specified
  return openrouter(modelId || "anthropic/claude-sonnet-4-20250514");
}

/**
 * Get a model that prefers user's API key, falls back to platform key
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getModelWithFallback(userApiKey?: string | null, modelId?: string): any {
  if (userApiKey) {
    return getModelWithUserKey(userApiKey, modelId);
  }
  return getModel();
}

/**
 * Check if AI is configured (platform-level)
 */
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/**
 * Check if AI is available (either platform or user key)
 */
export function isAIAvailable(userApiKey?: string | null): boolean {
  return !!(userApiKey || isAIConfigured());
}
