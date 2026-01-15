import { generateText } from "ai";
import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
import { getModel, isAIConfigured } from "./client";

export interface ConditionEvaluationRequest {
  hint: string;
  gameState: GameState;
  momentId?: string;
}

export interface ConditionEvaluationResult {
  hint: string;
  result: boolean;
  reasoning?: string;
  error?: string;
}

/**
 * Build context summary for AI evaluation
 */
function buildContextSummary(gameState: GameState, momentId?: string): string {
  const player = gameState.characters.find((c) => c.isPlayer);
  const activeMoment = gameState.moments.find((m) => m.status === "active");
  const recentMoments = gameState.moments
    .filter((m) => m.status === "lived")
    .slice(-5);

  const lines: string[] = [];

  // Player info
  if (player) {
    lines.push(`Player: ${player.name}`);
    const relevantStats = Object.entries(player.stats)
      .filter(([_, v]) => v !== 0 && v !== false)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    if (relevantStats) {
      lines.push(`Stats: ${relevantStats}`);
    }
  }

  // Current location
  if (activeMoment?.locationId) {
    lines.push(`Current location: ${activeMoment.locationId}`);
  }

  // Active moment
  if (activeMoment) {
    lines.push(`Current moment: ${activeMoment.title ?? activeMoment.id}`);
    if (activeMoment.text) {
      lines.push(`Scene: ${activeMoment.text.slice(0, 200)}...`);
    }
  }

  // Recent history
  if (recentMoments.length > 0) {
    lines.push("Recent history:");
    for (const m of recentMoments) {
      lines.push(`- ${m.title ?? m.id}`);
    }
  }

  // Global stats
  const globalStats = Object.entries(gameState.globalStats)
    .filter(([k, v]) => k !== "turn" && v !== 0 && v !== false)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  if (globalStats) {
    lines.push(`World state: ${globalStats}`);
  }

  return lines.join("\n");
}

/**
 * Evaluate a single AI condition
 */
export async function evaluateCondition(
  request: ConditionEvaluationRequest
): Promise<ConditionEvaluationResult> {
  if (!isAIConfigured()) {
    return {
      hint: request.hint,
      result: false,
      error: "AI not configured",
    };
  }

  const context = buildContextSummary(request.gameState, request.momentId);

  const prompt = `You are evaluating a game condition for a narrative game.

GAME CONTEXT:
${context}

CONDITION TO EVALUATE:
"${request.hint}"

Based on the game context, determine if this condition is currently TRUE or FALSE.
Consider the narrative situation, character states, and recent events.

Respond with ONLY a JSON object in this exact format:
{"result": true, "reasoning": "brief explanation"}
or
{"result": false, "reasoning": "brief explanation"}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const response = await generateText({
      model,
      prompt,
      maxOutputTokens: 200,
      temperature: 0.3,
    });

    // Parse the response
    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        hint: request.hint,
        result: false,
        error: "Failed to parse AI response",
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      hint: request.hint,
      result: !!parsed.result,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error("AI condition evaluation failed:", error);
    return {
      hint: request.hint,
      result: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Evaluate multiple AI conditions in batch
 */
export async function evaluateConditions(
  requests: ConditionEvaluationRequest[]
): Promise<ConditionEvaluationResult[]> {
  // Evaluate in parallel with a reasonable concurrency limit
  const results: ConditionEvaluationResult[] = [];
  const batchSize = 3;

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(evaluateCondition));
    results.push(...batchResults);
  }

  return results;
}
