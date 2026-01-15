// ============================================================================
// WDYDN Type System v2.2
// ============================================================================

// ============================================================================
// EXPRESSION SYSTEM
// ============================================================================

/**
 * Expression string evaluated at runtime.
 *
 * Access paths:
 *   character.$player.stats.X           - player character stats
 *   character.elena.stats.Y             - NPC by ID
 *   character.$player.disposition.elena - player's disposition toward elena
 *   moment.tavern_fight-0.status        - specific moment instance by instanceId
 *   moment.tavern_fight-*.status        - wildcard for all instances of template
 *   globalStats.X                       - global stats
 *
 * Special vars:
 *   $player - resolves to player character ID (character with isPlayer: true)
 *   $self   - reference to the moment this expression belongs to (in transitions)
 *   $roll   - dice roll result (in challenges)
 *   $round  - current challenge round (in challenges)
 *   $turn   - current game turn
 *
 * In stat formulas only:
 *   $base   - base value of the stat being calculated
 *   stats.X - shorthand for other stats of the same character
 *
 * Conditions:
 *   expression when condition
 *   expression when ai(natural language hint for AI to evaluate)
 *
 * Examples:
 *   'character.$player.stats.gold += 100'
 *   '$self.status = available when character.$player.stats.gold >= 10'
 *   '$self.status = available when ai(player visits a place that sells lottery tickets)'
 *   'moment.tavern_fight-0.status = available'
 *   'moment.tavern_fight-*.status = passed'
 */
export type Expression = string;

/**
 * A consequence is an expression that modifies game state.
 */
export type Consequence = Expression;

// ============================================================================
// STAT SYSTEM
// ============================================================================

export type StatType = "number" | "boolean" | "text";

/**
 * Stat definition for a universe.
 *
 * Formulas are evaluated in context of the character that owns the stat.
 * Use shorthand paths (no character prefix needed):
 *   "$base + stats.strength / 2"
 *   "stats.strength * 10"
 *
 * Special vars in stat formulas:
 *   $base - the base value of THIS stat
 *   stats.X - other stats of the same character (shorthand)
 *
 * Common stats to define: level, experience, availablePoints
 */
export interface Stat {
  id: string;
  name: string;
  short?: string;
  description?: string;
  type: StatType;
  base?: number | boolean | string;
  formula?: Expression; // e.g., "$base + stats.strength / 2"
  range?: { min: number; max: number };
  display?: {
    icon?: string;
    color?: string;
    style?: "number" | "bar" | "badge" | "hidden";
    showInCreator?: boolean;
    showInSheet?: boolean;
    order?: number;
  };
}

// ============================================================================
// ENTITIES
// ============================================================================

export type Emotion =
  | "neutral"
  | "happy"
  | "joy"
  | "anger"
  | "sad"
  | "fear"
  | "thinking"
  | "confused"
  | "embarrassed"
  | "confident";

/**
 * A Character is any person/being in the universe.
 * The player character has isPlayer: true.
 *
 * Level, points, and other progression are tracked as stats:
 *   stats: { level: 1, experience: 0, availablePoints: 5, ... }
 */
export interface Character {
  id: string;
  name: string;
  description?: string;
  isPlayer?: boolean;   // true for the player character
  playable?: boolean;   // true if selectable at game start
  stats: Record<string, number | boolean | string>;
  disposition: Record<string, number>;
  memories: string[];
  personality: {
    traits: string[];
    values: string[];
    fears: string[];
    desires: string[];
  };
  images?: Partial<Record<Emotion, string>>;
  equipment?: Record<string, string | null>;
  inventory?: Array<{ itemId: string; quantity: number }>;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  background?: string;
  music?: string;
  ambientSound?: string;
  requirements?: Expression[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  kind: "equipment" | "consumable" | "object";
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  slot?: string;
  whileEquipped?: Array<{ statId: string; amount: number }>;
  onUse?: Consequence[];
  stackable?: boolean;
  maxStack?: number;
  icon?: string;
}

// ============================================================================
// MOMENT SYSTEM
// ============================================================================

/**
 * Status of a moment in the game.
 *
 * - available: Can be chosen by player (appears as choice)
 * - active: Currently being experienced (only one at a time)
 * - lived: Was chosen and experienced
 * - passed: Was available but opportunity expired (urgent moments not chosen)
 * - hidden: Exists but not shown to player
 * - locked: Shown but cannot be chosen
 */
export type MomentStatus =
  | "available"
  | "active"
  | "lived"
  | "passed"
  | "hidden"
  | "locked";

/**
 * Transitions define expressions that run based on the moment's current status.
 * The key is the status the moment must be in for those expressions to evaluate.
 *
 * Example:
 * ```
 * transitions: {
 *   locked: ['$self.status = available when character.$player.stats.gold >= 10'],
 *   available: ['$self.status = passed when $turn > 3'],
 *   active: ['character.$player.stats.reputation += 5', '$self.status = lived']
 * }
 * ```
 */
export type MomentTransitions = Partial<Record<MomentStatus, Expression[]>>;

/**
 * A Moment is a discrete unit of narrative experience.
 * Moments serve as both content AND choices - there is no separate Choice type.
 *
 * In Universe.moments (templates): id is simple, e.g., "tavern_fight"
 * In GameState.moments (instances): id has suffix, e.g., "tavern_fight-0", "tavern_fight-1"
 *
 * Expression paths reference instances: moment.tavern_fight-0.status
 * Wildcard references all instances: moment.tavern_fight-*.status
 */
export interface Moment {
  id: string; // Template: "tavern_fight", Instance: "tavern_fight-0"

  // Display
  title?: string; // Full title when viewing the moment
  text?: string; // Narrative text content
  preview?: string; // Short text shown as choice button when available

  // Status (single source of truth)
  status?: MomentStatus;

  // Location and stage presentation
  locationId?: string;
  stage?: Record<
    "left" | "center" | "right",
    { characterId: string; emotion?: Emotion; speaking?: boolean } | undefined
  >;

  // Status transitions and consequences
  transitions?: MomentTransitions;

  // Challenge (if this moment triggers one)
  // Copied from Universe.challenges template, not a reference
  challenge?: Challenge;

  // Metadata
  tags?: string[];
  urgent?: boolean; // If true and not selected, can transition to 'passed'
}

// ============================================================================
// CHALLENGE SYSTEM
// ============================================================================

export interface ChallengeRole {
  id: string;
  name: string;
  required: boolean;
}

export interface ChallengeOutcome {
  id: string;
  name: string;
  condition: Expression;
  consequences?: Consequence[];
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  roles: ChallengeRole[];
  roundActions: Consequence[];
  outcomes: ChallengeOutcome[];
  maxRounds?: number;
  trackedStats?: Array<{
    statId: string;
    showAs: "bar" | "number";
    label?: string;
  }>;
  display?: {
    theme?: string;
    roundDelay?: number;
  };
}

// ============================================================================
// UNIVERSE
// ============================================================================

/**
 * Universe configuration for game rules.
 *
 * Progression system:
 *   - Characters have stats: level, experience, availablePoints
 *   - When experience >= experiencePerLevel * level, character levels up
 *   - On level up: level += 1, availablePoints += pointsPerLevel
 */
export interface UniverseConfig {
  startingPoints: number;      // Initial availablePoints for new characters
  pointsPerLevel: number;      // Points gained per level up
  experiencePerLevel: number;  // Experience needed per level (multiplied by current level)
  equipmentSlots: string[];    // Available equipment slots (e.g., ["weapon", "armor", "accessory"])
}

/**
 * A Universe is a complete game package containing rules, entities, and content.
 *
 * Moments with status: 'available' in the template are starting moments.
 * No separate startingMomentIds needed.
 */
export interface Universe {
  id: string;
  name: string;
  description: string;
  theme: string;
  version: number;
  config: UniverseConfig;
  stats: Stat[];
  items: Item[];
  characters: Character[];
  locations: Location[];
  challenges: Challenge[];  // Template palette - copied to moments when authoring
  moments: Moment[];        // Templates - moments with status:'available' are starting moments
}

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * GameState is the single source of truth for a game session.
 *
 * Characters array includes the player (isPlayer: true).
 * Find player: characters.find(c => c.isPlayer)
 *
 * The moments array holds all runtime moment instances.
 * - Filter by status === 'available' to get chooseable moments
 * - Filter by status === 'active' to get current moment
 * - Filter by status === 'lived' to get history (in order)
 * - Array order is chronological (when moments entered play)
 *
 * Moments are deep-copied from Universe templates when they enter play.
 * Instance IDs follow pattern: "momentId-0", "momentId-1", etc.
 */
export interface GameState {
  id: string;
  universeId: string;
  createdAt: number;
  savedAt: number;
  seed: number; // For deterministic randomness

  // Entities (copied from templates, mutated during play)
  // Player character has isPlayer: true
  characters: Character[];

  // Global state (includes boolean flags)
  globalStats: Record<string, number | boolean | string>;

  // Moments - THE source of truth for narrative state
  moments: Moment[];
}
