import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * AI Provider configuration
 *
 * Supports multiple providers via environment variables:
 * - OPENAI_API_KEY for OpenAI
 * - ANTHROPIC_API_KEY for Anthropic
 */

export type AIProvider = "openai" | "anthropic";

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
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}
