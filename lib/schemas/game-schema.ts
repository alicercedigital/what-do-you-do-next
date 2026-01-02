import { z } from "zod"
import {
  GameAttributeSchema,
  GameCharacterSchema,
  CharacterPortraitsSchema,
  type GameAttribute,
  type GameCharacter,
  type CharacterPortraits,
} from "./game-entity-schema"

// Re-export entity types
export {
  GameAttributeSchema,
  GameCharacterSchema,
  CharacterPortraitsSchema,
  type GameAttribute,
  type GameCharacter,
  type CharacterPortraits,
}

export const PlayerCharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  attributes: z.record(z.string(), z.number()),
  totalPoints: z.number(),
  usedPoints: z.number(),
  role: z.string().default("protagonist"),
  portraits: CharacterPortraitsSchema.default({}),
  type: z.literal("character").default("character"),
  description: z.string().default(""),
})

export type PlayerCharacter = z.infer<typeof PlayerCharacterSchema>

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
])

export type HeroJourneyStep = z.infer<typeof HeroJourneyStepSchema>

// Attribute Test Schema
export const AttributeTestSchema = z.object({
  attributeId: z.string(),
  difficulty: z.number(),
  successEventId: z.string(),
  failureEventId: z.string(),
})

export type AttributeTest = z.infer<typeof AttributeTestSchema>

// Game Event Schema
export const GameEventSchema = z.object({
  id: z.string(),
  type: z.enum(["narrative", "dialogue", "action", "audio", "image"]),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
  audioId: z.string().optional(),
  heroJourneyStep: HeroJourneyStepSchema,
  statChanges: z.record(z.string(), z.number()).optional(),
  locationChange: z.string().optional(),
})

export type GameEvent = z.infer<typeof GameEventSchema>

// Game Option Schema
export const GameOptionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  description: z.string(),
  attributeTest: AttributeTestSchema.optional(),
  nextEventId: z.string().optional(),
})

export type GameOption = z.infer<typeof GameOptionSchema>

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
})

export type CanvasNode = z.infer<typeof CanvasNodeSchema>

// Canvas Connection Schema
export const CanvasConnectionSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  toNodeId: z.string(),
  active: z.boolean(),
})

export type CanvasConnection = z.infer<typeof CanvasConnectionSchema>

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
})

export type GameState = z.infer<typeof GameStateSchema>
