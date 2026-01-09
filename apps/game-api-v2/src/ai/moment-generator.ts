import { generateObject } from "ai";
import { z } from "zod";
import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Universe = v2.Universe;
type Moment = v2.Moment;
import { getModel, isAIConfigured } from "./client";

export interface MomentGenerationRequest {
  gameState: GameState;
  universe: Universe;
  context?: string;
  momentType?: "transition" | "gap-fill" | "consequence";
  locationId?: string;
}

export interface GeneratedMoment {
  title: string;
  text: string;
  preview?: string;
  locationId?: string;
  tags?: string[];
}

/**
 * Schema for generated moment
 */
const momentSchema = z.object({
  title: z.string().describe("Short, evocative title for the moment"),
  text: z.string().describe("Narrative text describing what happens (2-4 paragraphs)"),
  preview: z.string().optional().describe("Short teaser text if this is a choice"),
  locationId: z.string().optional().describe("Location ID from the universe, if relevant"),
  tags: z.array(z.string()).optional().describe("Relevant tags like 'combat', 'social', 'exploration'"),
});

/**
 * Build prompt context for moment generation
 */
function buildGenerationContext(request: MomentGenerationRequest): string {
  const { gameState, universe } = request;
  const player = gameState.characters.find((c) => c.isPlayer);
  const activeMoment = gameState.moments.find((m) => m.status === "active");
  const recentMoments = gameState.moments
    .filter((m) => m.status === "lived")
    .slice(-3);
  const availableLocations = universe.locations.map((l) => `${l.id}: ${l.name}`).join(", ");

  const lines: string[] = [
    `UNIVERSE: ${universe.name}`,
    `THEME: ${universe.theme}`,
    "",
  ];

  // Player info
  if (player) {
    lines.push(`PLAYER CHARACTER: ${player.name}`);
    if (player.description) {
      lines.push(player.description);
    }
    const stats = Object.entries(player.stats)
      .filter(([_, v]) => typeof v === "number" && v !== 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    if (stats) {
      lines.push(`Stats: ${stats}`);
    }
    lines.push("");
  }

  // Recent history
  if (recentMoments.length > 0) {
    lines.push("RECENT EVENTS:");
    for (const m of recentMoments) {
      lines.push(`- ${m.title}: ${m.text?.slice(0, 100)}...`);
    }
    lines.push("");
  }

  // Current situation
  if (activeMoment) {
    lines.push("CURRENT SITUATION:");
    lines.push(`${activeMoment.title}: ${activeMoment.text}`);
    lines.push("");
  }

  // Available locations
  lines.push(`AVAILABLE LOCATIONS: ${availableLocations}`);

  // Additional context
  if (request.context) {
    lines.push("");
    lines.push(`ADDITIONAL CONTEXT: ${request.context}`);
  }

  return lines.join("\n");
}

/**
 * Generate a new moment using AI
 */
export async function generateMoment(
  request: MomentGenerationRequest
): Promise<GeneratedMoment | null> {
  if (!isAIConfigured()) {
    console.warn("AI not configured, cannot generate moment");
    return null;
  }

  const context = buildGenerationContext(request);

  let instructions = "Generate a new narrative moment for this game. ";

  switch (request.momentType) {
    case "gap-fill":
      instructions +=
        "This should be a transitional moment that bridges the gap between recent events. " +
        "It should feel natural and maintain narrative continuity.";
      break;
    case "consequence":
      instructions +=
        "This should be a consequence of recent player actions. " +
        "Show how the world reacts to what the player has done.";
      break;
    case "transition":
    default:
      instructions +=
        "This should advance the story while offering interesting narrative possibilities.";
  }

  if (request.locationId) {
    instructions += ` Set this moment in location: ${request.locationId}.`;
  }

  const prompt = `${context}

INSTRUCTIONS:
${instructions}

Write engaging, immersive narrative text in second person ("You see...", "You walk...").
Keep the tone consistent with the universe theme.`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const result = await generateObject({
      model,
      schema: momentSchema,
      prompt,
      maxOutputTokens: 1000,
    });

    return result.object;
  } catch (error) {
    console.error("Moment generation failed:", error);
    return null;
  }
}

/**
 * Generate multiple moment options for player choice
 */
export async function generateMomentOptions(
  request: MomentGenerationRequest,
  count: number = 3
): Promise<GeneratedMoment[]> {
  if (!isAIConfigured()) {
    console.warn("AI not configured, cannot generate moments");
    return [];
  }

  const context = buildGenerationContext(request);

  const prompt = `${context}

INSTRUCTIONS:
Generate ${count} different possible next moments the player could choose from.
Each should be a distinct option with different consequences and themes.
Make them varied: perhaps one is social, one is action-oriented, one is exploratory.

Write engaging, immersive narrative previews in second person.`;

  const optionsSchema = z.object({
    options: z.array(momentSchema).describe(`Array of ${count} moment options`),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const result = await generateObject({
      model,
      schema: optionsSchema,
      prompt,
      maxOutputTokens: 2000,
    });

    return result.object.options;
  } catch (error) {
    console.error("Moment options generation failed:", error);
    return [];
  }
}

/**
 * Expand a brief moment into full narrative text
 */
export async function expandMomentText(
  moment: Partial<Moment>,
  universe: Universe,
  gameState: GameState
): Promise<string | null> {
  if (!isAIConfigured()) {
    return null;
  }

  const player = gameState.characters.find((c) => c.isPlayer);

  const prompt = `UNIVERSE: ${universe.name} (${universe.theme})
PLAYER: ${player?.name ?? "Unknown"}
MOMENT TITLE: ${moment.title}
BRIEF DESCRIPTION: ${moment.text ?? moment.preview ?? "No description"}

Expand this into 2-4 paragraphs of engaging narrative text.
Write in second person ("You walk into the tavern...").
Include sensory details and atmosphere.
Maintain the universe's theme and tone.

Write ONLY the narrative text, no headers or explanations.`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = getModel() as any;
    const result = await generateObject({
      model,
      schema: z.object({
        text: z.string().describe("The expanded narrative text"),
      }),
      prompt,
      maxOutputTokens: 800,
    });

    return result.object.text;
  } catch (error) {
    console.error("Moment expansion failed:", error);
    return null;
  }
}
