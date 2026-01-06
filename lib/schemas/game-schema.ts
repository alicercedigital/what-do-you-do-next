import { z } from "zod";
import {
    CharacterPortraitsSchema, GameAttributeSchema,
    GameCharacterSchema, type CharacterPortraits, type GameAttribute,
    type GameCharacter
} from "./game-entity-schema";

// Re-export entity types
export {
    GameAttributeSchema,
    GameCharacterSchema,
    CharacterPortraitsSchema,
    type GameAttribute,
    type GameCharacter,
    type CharacterPortraits,
};

export const PlayerCharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Base attributes are the permanent values (distributed points + consumed items)
  baseAttributes: z.record(z.string(), z.number()).default({}),
  // Cached derived attributes (calculated from formula, cached for performance)
  cachedDerivedAttributes: z.record(z.string(), z.number()).default({}),
  // Equipment: slot -> itemId mapping
  equipment: z.record(z.string(), z.string().nullable()).default({}),
  // Inventory: array of item stacks
  inventory: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number(),
      })
    )
    .default([]),
  // Character level for attribute progression
  level: z.number().default(1),
  totalPoints: z.number(),
  usedPoints: z.number(),
  role: z.string().default("protagonist"),
  portraits: CharacterPortraitsSchema.default({}),
  type: z.literal("character").default("character"),
  description: z.string().default(""),
});

export type PlayerCharacter = z.infer<typeof PlayerCharacterSchema>;

// Hero Journey Step
export const HeroJourneyStepSchema = z.enum([
  "ordinary-world",
  "call-to-adventure",
  "refusal-of-call",
  "meeting-mentor",
  "crossing-threshold",
  "tests-allies-enemies",
  "approach-inmost-cave",
  "ordeal",
  "reward",
  "road-back",
  "resurrection",
  "return-with-elixir",
]);

export type HeroJourneyStep = z.infer<typeof HeroJourneyStepSchema>;

// Attribute Test Schema
export const AttributeTestSchema = z.object({
  attributeId: z.string(),
  difficulty: z.number(),
  successEventId: z.string(),
  failureEventId: z.string(),
});

export type AttributeTest = z.infer<typeof AttributeTestSchema>;

const eventTypes = [
  "narrative",
  "dialogue",
  "action",
  "audio",
  "image",
  "dice-roll",
  "conflict",
] as const;

export type EventType = (typeof eventTypes)[number];

// Game Event Schema
export const GameEventSchema = z.object({
  id: z.string(),
  type: z.enum(eventTypes),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
  audioId: z.string().optional(),
  heroJourneyStep: HeroJourneyStepSchema,
  statChanges: z.record(z.string(), z.number()).optional(),
  locationChange: z.string().optional(),
  diceRollData: z
    .object({
      attributeName: z.string(),
      targetNumber: z.number(),
      attributeValue: z.number(),
      diceRoll: z.number(),
      success: z.boolean(),
    })
    .optional(),
  conflictData: z
    .object({
      conflictEventId: z.string(), // Reference to the ConflictEvent definition
      enemyName: z.string(),
      enemyPortrait: z.string().optional(),
      enemyAttributes: z.record(z.string(), z.number()),
    })
    .optional(),
});

export type GameEvent = z.infer<typeof GameEventSchema>;

// Game Option Schema
export const GameOptionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  description: z.string(),
  attributeTest: AttributeTestSchema.optional(),
  nextEventId: z.string().optional(),
});

export type GameOption = z.infer<typeof GameOptionSchema>;

// Canvas Node Schema (for positioning)
export const CanvasNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["event", "option"]),
  data: z.union([GameEventSchema, GameOptionSchema]),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  selected: z.boolean().optional(),
  greyedOut: z.boolean().optional(),
});

export type CanvasNode = z.infer<typeof CanvasNodeSchema>;

// Canvas Connection Schema
export const CanvasConnectionSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  toNodeId: z.string(),
  active: z.boolean(),
});

export type CanvasConnection = z.infer<typeof CanvasConnectionSchema>;

// Conflict Execution State Schema
export const ConflictExecutionStateSchema = z.object({
  conflictId: z.string(),
  conflictEventId: z.string(),
  roleStates: z.array(
    z.object({
      roleId: z.string(),
      roleName: z.string(),
      entityName: z.string(),
      portrait: z.string().optional(),
      attributes: z.record(z.string(), z.number()),
      maxAttributes: z.record(z.string(), z.number()),
    })
  ),
  variables: z.record(
    z.string(),
    z.union([z.number(), z.string(), z.boolean()])
  ),
  currentCycle: z.number(),
  logs: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      type: z.enum(["action", "damage", "info", "success", "failure"]),
      timestamp: z.number(),
    })
  ),
  isComplete: z.boolean(),
  outcomeId: z.string().optional(),
  currentStepIndex: z.number(),
});

export type ConflictExecutionState = z.infer<
  typeof ConflictExecutionStateSchema
>;

export const GameStateSchema = z.object({
  id: z.string(),
  universeId: z.string(), // Changed from genreId
  character: PlayerCharacterSchema,
  currentHeroStep: HeroJourneyStepSchema,
  nodes: z.array(CanvasNodeSchema),
  connections: z.array(CanvasConnectionSchema),
  currentEventId: z.string().nullable(),
  isWaitingForChoice: z.boolean(),
  storyHistory: z.array(z.string()),
  pendingEvents: z.array(GameEventSchema).optional(),
  pendingOptions: z.array(GameOptionSchema).optional(),
  lastSelectedOptionId: z.string().nullable().optional(),
  isWaitingForContinue: z.boolean().optional(),
  currentLocationId: z.string().optional(),
  activeConflict: ConflictExecutionStateSchema.nullable().optional(),
});

export type GameState = z.infer<typeof GameStateSchema>;
