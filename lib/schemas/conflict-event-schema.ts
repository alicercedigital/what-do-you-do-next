import { z } from "zod";

/**
 * Conflict Event System
 *
 * A conflict event is an auto-battle turn-based event that uses attributes.
 * Examples: combat, racing, exams, sports competitions, negotiations, etc.
 *
 * Structure:
 * - Roles: Define participants (e.g., player, combatant, location)
 * - Cycle: Array of steps that run each turn until completion
 * - Each step can modify attributes, check conditions, and trigger outcomes
 */

// Entity types that can be assigned to roles
export const RoleEntityTypeSchema = z.enum(["character", "location", "item"]);
export type RoleEntityType = z.infer<typeof RoleEntityTypeSchema>;

// Role definition - defines a participant in the conflict
export const ConflictRoleSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .describe(
      "Display name for this role (e.g., 'Player', 'Opponent', 'Arena')"
    ),
  description: z
    .string()
    .optional()
    .describe("Explanation of this role's purpose in the conflict"),
  entityType: RoleEntityTypeSchema.describe(
    "What type of entity can fill this role"
  ),
  required: z
    .boolean()
    .default(true)
    .describe("Whether this role must be filled for the conflict to start"),
});

export type ConflictRole = z.infer<typeof ConflictRoleSchema>;

// Extended formula token that can reference role attributes
// e.g., "player.strength" or "opponent.hp" or "arena.difficulty"
// Now uses UniversalFormulaToken for consistency
export const ConflictFormulaTokenSchema = z.object({
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

export type ConflictFormulaToken = z.infer<typeof ConflictFormulaTokenSchema>;

// Action types for cycle steps
export const CycleActionTypeSchema = z.enum([
  "modify-attribute", // Change an attribute value (e.g., reduce HP)
  "check-condition", // Check a condition and branch
  "set-variable", // Set a temporary variable for this conflict
  "log-message", // Display a message to the player
  "trigger-outcome", // End the conflict with a specific outcome
  "roll-dice", // Roll dice and store result
  "compare-attributes", // Compare attributes between roles to determine order/winner
]);

export type CycleActionType = z.infer<typeof CycleActionTypeSchema>;

// Modify Attribute Action - changes a role's attribute
export const ModifyAttributeActionSchema = z.object({
  type: z.literal("modify-attribute"),
  roleId: z.string().describe("Which role's attribute to modify"),
  attributeId: z.string().describe("Which attribute to modify"),
  operation: z
    .enum(["set", "add", "subtract", "multiply", "divide"])
    .default("subtract"),
  formula: z
    .array(ConflictFormulaTokenSchema)
    .describe("Formula to calculate the value"),
});

export type ModifyAttributeAction = z.infer<typeof ModifyAttributeActionSchema>;

// Check Condition Action - evaluates a condition and executes different steps
export const CheckConditionActionSchema = z.object({
  type: z.literal("check-condition"),
  condition: z
    .array(ConflictFormulaTokenSchema)
    .describe("Condition formula that evaluates to true/false"),
  thenSteps: z
    .array(z.string())
    .describe("Step IDs to execute if condition is true"),
  elseSteps: z
    .array(z.string())
    .optional()
    .describe("Step IDs to execute if condition is false"),
});

export type CheckConditionAction = z.infer<typeof CheckConditionActionSchema>;

// Set Variable Action - stores a temporary value during the conflict
export const SetVariableActionSchema = z.object({
  type: z.literal("set-variable"),
  variableName: z.string().describe("Name of the variable to set"),
  formula: z
    .array(ConflictFormulaTokenSchema)
    .describe("Formula to calculate the value"),
});

export type SetVariableAction = z.infer<typeof SetVariableActionSchema>;

// Log Message Action - displays a message with interpolated values
export const LogMessageActionSchema = z.object({
  type: z.literal("log-message"),
  template: z
    .string()
    .describe("Message template with {role.attribute} placeholders"),
});

export type LogMessageAction = z.infer<typeof LogMessageActionSchema>;

// Outcome definition
export const ConflictOutcomeSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .describe("Name of this outcome (e.g., 'Victory', 'Defeat', 'Draw')"),
  description: z
    .string()
    .describe("What happens when this outcome is triggered"),
  type: z.enum(["success", "failure", "neutral"]).default("neutral"),
  // Rewards/consequences
  attributeChanges: z
    .array(
      z.object({
        roleId: z.string(),
        attributeId: z.string(),
        formula: z.array(ConflictFormulaTokenSchema),
      })
    )
    .default([])
    .describe("Attribute changes when this outcome occurs"),
  experienceFormula: z
    .array(ConflictFormulaTokenSchema)
    .optional()
    .describe("Experience points awarded"),
  itemRewards: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number().default(1),
        chance: z.number().min(0).max(1).default(1), // 0-1 probability
      })
    )
    .default([])
    .optional(),
  triggersGameOver: z.boolean().default(false).optional(),
  nextEventId: z
    .string()
    .optional()
    .describe("Story event to trigger after this outcome"),
});

export type ConflictOutcome = z.infer<typeof ConflictOutcomeSchema>;

// Trigger Outcome Action - ends the conflict with a specific outcome
export const TriggerOutcomeActionSchema = z.object({
  type: z.literal("trigger-outcome"),
  outcomeId: z.string().describe("ID of the outcome to trigger"),
});

export type TriggerOutcomeAction = z.infer<typeof TriggerOutcomeActionSchema>;

// Roll Dice Action
export const RollDiceActionSchema = z.object({
  type: z.literal("roll-dice"),
  variableName: z.string().describe("Variable to store the roll result"),
  diceCount: z.number().default(1),
  diceSides: z.number().default(20), // d20 by default
  modifier: z
    .array(ConflictFormulaTokenSchema)
    .optional()
    .describe("Bonus to add to the roll"),
});

export type RollDiceAction = z.infer<typeof RollDiceActionSchema>;

// Compare Attributes Action - compares values between roles
export const CompareAttributesActionSchema = z.object({
  type: z.literal("compare-attributes"),
  comparisons: z
    .array(
      z.object({
        roleId: z.string(),
        formula: z.array(ConflictFormulaTokenSchema),
      })
    )
    .describe("Formulas to compare for each role"),
  resultVariable: z.string().describe("Variable to store the winning role ID"),
  orderVariable: z
    .string()
    .optional()
    .describe("Variable to store the ordered list of role IDs"),
});

export type CompareAttributesAction = z.infer<
  typeof CompareAttributesActionSchema
>;

// Union of all action types
export const CycleStepActionSchema = z.discriminatedUnion("type", [
  ModifyAttributeActionSchema,
  CheckConditionActionSchema,
  SetVariableActionSchema,
  LogMessageActionSchema,
  TriggerOutcomeActionSchema,
  RollDiceActionSchema,
  CompareAttributesActionSchema,
]);

export type CycleStepAction = z.infer<typeof CycleStepActionSchema>;

// A single step in the cycle
export const CycleStepSchema = z.object({
  id: z.string(),
  name: z.string().describe("Display name for this step"),
  description: z
    .string()
    .optional()
    .describe("Explanation of what this step does"),
  action: CycleStepActionSchema,
  // Execution control
  executeFor: z
    .enum(["once", "each-role"])
    .default("once")
    .optional()
    .describe("Execute once or for each role of a type"),
  roleTypeFilter: z
    .string()
    .optional()
    .describe("If executeFor is 'each-role', filter by this role type"),
});

export type CycleStep = z.infer<typeof CycleStepSchema>;

// The main conflict event definition
export const ConflictEventSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .describe("Name of this conflict type (e.g., 'Combat', 'Race', 'Exam')"),
  description: z.string().describe("Description of how this conflict works"),
  icon: z.string().default("swords"), // Lucide icon name
  // Roles that participate in this conflict
  roles: z
    .array(ConflictRoleSchema)
    .min(1)
    .describe("Roles that can participate in this conflict"),
  // The cycle of steps that runs each turn
  cycleSteps: z
    .array(CycleStepSchema)
    .describe("Steps that execute in order each cycle"),
  // Possible outcomes
  outcomes: z
    .array(ConflictOutcomeSchema)
    .describe("Possible outcomes of this conflict"),
  // Maximum cycles before forced end (safety)
  maxCycles: z
    .number()
    .default(100)
    .describe("Maximum cycles before forcing an outcome"),
  // Default outcome if max cycles reached
  defaultOutcomeId: z
    .string()
    .optional()
    .describe("Outcome to trigger if max cycles reached"),
  // UI configuration
  showTurnLog: z
    .boolean()
    .default(true)
    .describe("Whether to show a log of each turn"),
  animationSpeed: z
    .enum(["slow", "normal", "fast", "instant"])
    .default("normal"),
});

export type ConflictEvent = z.infer<typeof ConflictEventSchema>;

// Template for common conflict types
export const CONFLICT_TEMPLATES: Record<string, Partial<ConflictEvent>> = {
  combat: {
    name: "Combat",
    description:
      "A battle between characters using physical or magical attacks",
    icon: "swords",
    roles: [
      {
        id: "player",
        name: "Player",
        description: "The player character",
        entityType: "character",
        required: true,
      },
      {
        id: "enemy",
        name: "Enemy",
        description: "The opponent in battle",
        entityType: "character",
        required: true,
      },
    ],
    outcomes: [
      {
        id: "victory",
        name: "Victory",
        description: "Player defeats the enemy",
        type: "success",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
      {
        id: "defeat",
        name: "Defeat",
        description: "Player is defeated",
        type: "failure",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: true,
      },
    ],
  },
  race: {
    name: "Race",
    description: "A competition of speed between participants",
    icon: "timer",
    roles: [
      {
        id: "player",
        name: "Player",
        description: "The player character",
        entityType: "character",
        required: true,
      },
      {
        id: "opponent",
        name: "Opponent",
        description: "Racing opponent",
        entityType: "character",
        required: true,
      },
      {
        id: "track",
        name: "Track",
        description: "The race location",
        entityType: "location",
        required: false,
      },
    ],
    outcomes: [
      {
        id: "first-place",
        name: "First Place",
        description: "Player wins the race",
        type: "success",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
      {
        id: "lost",
        name: "Lost Race",
        description: "Player loses the race",
        type: "failure",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
    ],
  },
  exam: {
    name: "Exam",
    description: "A test of knowledge or skill",
    icon: "graduation-cap",
    roles: [
      {
        id: "student",
        name: "Student",
        description: "The character taking the exam",
        entityType: "character",
        required: true,
      },
      {
        id: "institution",
        name: "Institution",
        description: "The school or organization",
        entityType: "location",
        required: false,
      },
    ],
    outcomes: [
      {
        id: "passed",
        name: "Passed",
        description: "Successfully passed the exam",
        type: "success",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
      {
        id: "failed",
        name: "Failed",
        description: "Failed the exam",
        type: "failure",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
    ],
  },
  negotiation: {
    name: "Negotiation",
    description: "A social conflict using persuasion and charisma",
    icon: "message-square",
    roles: [
      {
        id: "negotiator",
        name: "Negotiator",
        description: "The character leading the negotiation",
        entityType: "character",
        required: true,
      },
      {
        id: "target",
        name: "Target",
        description: "The character being negotiated with",
        entityType: "character",
        required: true,
      },
    ],
    outcomes: [
      {
        id: "success",
        name: "Agreement",
        description: "Reached a favorable agreement",
        type: "success",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
      {
        id: "partial",
        name: "Compromise",
        description: "Reached a partial agreement",
        type: "neutral",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
      {
        id: "failure",
        name: "Failed",
        description: "Negotiation broke down",
        type: "failure",
        attributeChanges: [],
        itemRewards: [],
        triggersGameOver: false,
      },
    ],
  },
};
