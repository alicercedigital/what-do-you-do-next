import { z } from "zod";
import { ConflictEventSchema } from "./conflict-event-schema";

// Base Game Entity Schema
export const GameEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  attributes: z.record(z.string(), z.number()),
  type: z.string(),
});

export type GameEntity = z.infer<typeof GameEntitySchema>;

// Game Location Schema
export const GameLocationSchema = GameEntitySchema.extend({
  type: z.literal("location"),
  musics: z.array(z.string()),
  ambientSounds: z.array(z.string()),
  backgroundImageUrl: z.string().optional(),
});

export type GameLocation = z.infer<typeof GameLocationSchema>;

// Relationship Label Schema
export const RelationshipLabelSchema = GameEntitySchema.extend({
  type: z.literal("relationship_label"),
  name: z
    .string()
    .describe("The unique identifier and display name of the label"),
  description: z
    .string()
    .describe("Explanation of what this label implies about the relationship"),
  exclusionGroup: z
    .string()
    .optional()
    .describe(
      "Mutually exclusive group. Adding a new label of this group removes existing ones."
    ),
});

export type RelationshipLabel = z.infer<typeof RelationshipLabelSchema>;

// Relationship Schema
export const RelationshipSchema = z.object({
  id: z.string(),
  fromCharacterId: z.string(),
  targetCharacterId: z.string(),
  labels: z.array(z.string()),
  dynamic: z.string(),
  history: z.array(z.string()),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

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
});

export type CharacterPortraits = z.infer<typeof CharacterPortraitsSchema>;

// Game Character Schema
export const GameCharacterSchema = GameEntitySchema.extend({
  type: z.literal("character"),
  role: z.string().describe("The character's role in the story"),
  portraits: CharacterPortraitsSchema,
});

export type GameCharacter = z.infer<typeof GameCharacterSchema>;

// Universal Formula Token Schema - handles both basic attributes and role-based conflict formulas
export const UniversalFormulaTokenSchema = z.object({
  type: z.enum([
    "attribute", // Basic: attribute ID
    "role-attribute", // Conflict: "roleId.attributeId"
    "operator", // +, -, *, /
    "number", // Numeric values
    "function", // min, max, floor, ceil
    "parenthesis", // (, )
    "comparison", // =, !=, <, >, <=, >= (for conditions)
    "logical", // and, or, not (for conditions)
    "string", // String literals
  ]),
  value: z.string(), // Attribute ID, operator, number, function name, or "roleId.attributeId"
  target: z.string().optional(), // Optional target: "self", "role:id", or other context
});

export type UniversalFormulaToken = z.infer<typeof UniversalFormulaTokenSchema>;

// Legacy Formula Token Schema (for backward compatibility during migration)
export const FormulaTokenSchema = z.object({
  type: z.enum(["attribute", "operator", "number", "function", "parenthesis"]),
  value: z.string(),
});

export type FormulaToken = z.infer<typeof FormulaTokenSchema>;

// Attribute Display Configuration
export const AttributeDisplayConfigSchema = z.object({
  displayType: z.enum(["number", "bar", "percentage"]).default("number"),
  icon: z.string().default("circle"), // Lucide icon name
  iconColor: z.string().default("text-foreground"), // Tailwind color class
  barColor: z.string().optional(), // For bar type (e.g., "bg-green-500")
  barBackgroundColor: z.string().optional(), // For bar type (e.g., "bg-green-900")
  showPercentage: z.boolean().default(false).optional(), // Show % on bars
  showOnCharacterSheet: z.boolean().default(true), // Whether to display in character sheet
  position: z.number().default(0), // Order in display
  width: z.enum(["full", "half", "third"]).default("full"), // Width on character sheet
});

export type AttributeDisplayConfig = z.infer<
  typeof AttributeDisplayConfigSchema
>;

// Distributable Attribute Config (for attributes like Strength, Intelligence)
export const DistributableConfigSchema = z.object({
  minValue: z.number().default(1),
  maxValue: z.number().default(10),
  benchmarks: z
    .array(
      z.object({
        value: z.number().describe("Reference point value for this benchmark"),
        label: z
          .string()
          .describe("Descriptive title (e.g., 'Novice', 'Legendary')"),
        description: z.string().describe("Capability at this level"),
      })
    )
    .default([]),
});

export type DistributableConfig = z.infer<typeof DistributableConfigSchema>;

// Derived Attribute Config (for attributes like HP, AP, Mana)
export const DerivedConfigSchema = z.object({
  formula: z.array(UniversalFormulaTokenSchema).default([]),
  minValue: z.number().optional(), // Floor value
  maxValue: z.number().optional(), // Ceiling value (optional cap)
});

export type DerivedConfig = z.infer<typeof DerivedConfigSchema>;

// Unified Game Attribute Schema
export const GameAttributeSchema = z.object({
  id: z.string(),
  name: z.string().describe("The name of the attribute"),
  shortName: z
    .string()
    .optional()
    .describe("Short name for display (e.g., 'HP' for 'Health Points')"),
  summary: z
    .string()
    .describe("A brief explanation of what the attribute represents"),
  category: z.enum(["distributable", "derived"]).default("distributable"),
  display: AttributeDisplayConfigSchema.default({}),
  // Category-specific config (only one should be set based on category)
  distributableConfig: DistributableConfigSchema.optional(),
  derivedConfig: DerivedConfigSchema.optional(),
});

export type GameAttribute = z.infer<typeof GameAttributeSchema>;

export const AttributeSystemConfigSchema = z.object({
  startingPoints: z.number().default(20), // Points at character creation
  pointsPerLevelUp: z.number().default(2), // Points gained per level
});

export type AttributeSystemConfig = z.infer<typeof AttributeSystemConfigSchema>;

// Item Attribute Modifier
export const ItemAttributeModifierSchema = z.object({
  attributeId: z.string(),
  modifier: z.number(), // +/- value when equipped/consumed
});

export type ItemAttributeModifier = z.infer<typeof ItemAttributeModifierSchema>;

// Game Item Schema
export const GameItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["equipment", "consumable", "object"]),
  icon: z.string().default("package"), // Lucide icon name
  rarity: z
    .enum(["common", "uncommon", "rare", "epic", "legendary"])
    .default("common"),
  stackable: z.boolean().default(false),
  maxStack: z.number().optional(),
  // Equipment-specific
  slot: z.string().optional(), // Custom slot defined in universe
  // Attribute modifiers (for equipment and consumable)
  attributeModifiers: z.array(ItemAttributeModifierSchema).default([]),
});

export type GameItem = z.infer<typeof GameItemSchema>;

export const GameUniverseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  setting: z.string(),
  thumbnailUrl: z.string().optional(),
  // Attribute system
  attributeConfig: AttributeSystemConfigSchema.default({}),
  attributes: z.array(GameAttributeSchema).default([]),
  // Item system
  equipmentSlots: z
    .array(z.string())
    .default(["Head", "Body", "Main Hand", "Off Hand", "Accessory"]),
  items: z.array(GameItemSchema).default([]),
  conflictEvents: z.array(ConflictEventSchema).default([]),
  // Existing fields
  characters: z.array(GameCharacterSchema),
  locations: z.array(GameLocationSchema),
  relationshipLabels: z.array(RelationshipLabelSchema).optional(),
});

export type GameUniverse = z.infer<typeof GameUniverseSchema>;
