import { z } from "zod"

// Base Game Entity Schema
export const GameEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  attributes: z.record(z.string(), z.number()),
  type: z.string(),
})

export type GameEntity = z.infer<typeof GameEntitySchema>

// Game Location Schema
export const GameLocationSchema = GameEntitySchema.extend({
  type: z.literal("location"),
  musics: z.array(z.string()), // Array of music track IDs that randomly play when visiting the location
  ambientSounds: z.array(z.string()), // Array of ambient sound IDs for the location
  backgroundImageUrl: z.string().optional(),
})

export type GameLocation = z.infer<typeof GameLocationSchema>

// Relationship Label Schema
export const RelationshipLabelSchema = GameEntitySchema.extend({
  type: z.literal("relationship_label"),
  name: z.string().describe("The unique identifier and display name of the label"),
  description: z.string().describe("Explanation of what this label implies about the relationship"),
  exclusionGroup: z
    .string()
    .optional()
    .describe("Mutually exclusive group. Adding a new label of this group removes existing ones."),
})

export type RelationshipLabel = z.infer<typeof RelationshipLabelSchema>

// Relationship Schema
export const RelationshipSchema = z.object({
  id: z.string(),
  fromCharacterId: z.string(),
  targetCharacterId: z.string(),
  labels: z.array(z.string()),
  dynamic: z.string(),
  history: z.array(z.string()),
})

export type Relationship = z.infer<typeof RelationshipSchema>

// Character Portraits Schema
export const CharacterPortraitsSchema = z.object({
  default: z.string().optional(),
  happy: z.string().optional(),
  joy: z.string().optional(),
  anger: z.string().optional(),
  sad: z.string().optional(),
  fear: z.string().optional(),
  thinking: z.string().optional(),
  confused: z.string().optional(),
  embarrassed: z.string().optional(),
  confident: z.string().optional(),
})

export type CharacterPortraits = z.infer<typeof CharacterPortraitsSchema>

// Game Character Schema
export const GameCharacterSchema = GameEntitySchema.extend({
  type: z.literal("character"),
  role: z.string().describe("The character's role in the story"),
  portraits: CharacterPortraitsSchema,
})

export type GameCharacter = z.infer<typeof GameCharacterSchema>

// Game Attribute Schema (for universe attributes definition)
export const GameAttributeSchema = z.object({
  id: z.string(),
  name: z.string().describe("The name of the attribute"),
  summary: z.string().describe("A brief explanation of what the attribute represents"),
  benchmarks: z.array(
    z.object({
      value: z.number().describe("Reference point value for this benchmark"),
      label: z.string().describe("Descriptive title (e.g., 'Novice', 'Legendary')"),
      description: z.string().describe("Capability at this level"),
    }),
  ),
})

export type GameAttribute = z.infer<typeof GameAttributeSchema>

// Game Universe Schema
export const GameUniverseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  setting: z.string(),
  thumbnailUrl: z.string().optional(),
  charactersAttributes: z.array(GameAttributeSchema),
  characters: z.array(GameCharacterSchema),
  locations: z.array(GameLocationSchema),
  relationshipLabels: z.array(RelationshipLabelSchema).optional(),
})

export type GameUniverse = z.infer<typeof GameUniverseSchema>
