// ============================================================================
// WDYDN Type System v2
// ============================================================================

// ============================================================================
// EXPRESSION SYSTEM
// ============================================================================

/**
 * Expression string evaluated at runtime.
 * Access paths: player.stats.X, character.X.stats.Y, character.X.disposition.Y
 * Special vars: $roll, $round
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

export interface Stat {
  id: string;
  name: string;
  short?: string;
  description?: string;
  type: StatType;
  base?: number | boolean | string;
  assignable?: boolean;
  formula?: Expression;
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

export interface Character {
  id: string;
  name: string;
  description?: string;
  playable?: boolean;
  role?: string;
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

export interface PlayerCharacter extends Character {
  templateId: string;
  level: number;
  assignedPoints: Record<string, number>;
  points: { total: number; used: number };
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
// NARRATIVE SYSTEM
// ============================================================================

export interface Choice {
  id: string;
  text: string;
  description?: string;
  visible?: Expression;
  enabled?: Expression;
}

export interface Moment {
  id: string;
  title?: string;
  text?: string;
  locationId?: string;
  stage?: Record<
    "left" | "center" | "right",
    { characterId: string; emotion?: Emotion; speaking?: boolean } | undefined
  >;
  consequences?: Consequence[];
  choices?: Choice[];
  challengeId?: string;
  tags?: string[];
  urgent?: boolean;
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

export interface UniverseConfig {
  startingPoints: number;
  pointsPerLevel: number;
  equipmentSlots: string[];
}

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
  challenges: Challenge[];
  moments: Moment[];
  startingMomentIds: string[];
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface PooledMoment {
  momentId: string;
  addedAt: number;
}

export interface GameState {
  id: string;
  universeId: string;
  createdAt: number;
  savedAt: number;
  seed: number;
  player: PlayerCharacter;
  characters: Character[];
  globalStats: Record<string, number | boolean | string>;
  momentPool: PooledMoment[];
  storyPath: {
    momentId: string;
    choiceId?: string;
    timestamp: number;
  }[];
  currentMomentId: string | null;
}
