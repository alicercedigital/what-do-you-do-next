// ============================================
// UNIVERSE - Defines the rules of your world
// ============================================

export interface Universe {
  id: string
  name: string
  description: string
  theme: string // "dark fantasy", "sci-fi", etc.

  stats: Stat[]
  items: Item[]
  challenges: ChallengeTemplate[]
  npcs: NPC[]
  locations: Location[]

  config: {
    startingPoints: number // Points to distribute at creation
    pointsPerLevel: number
    equipmentSlots: string[] // ["head", "body", "weapon", "accessory"]
  }
}

// ============================================
// STATS - Character attributes
// ============================================

export interface Stat {
  id: string
  name: string
  short?: string // "STR", "HP", etc.
  description: string

  type: "core" | "computed" // core = player assigns, computed = calculated

  // Display configuration
  display: {
    icon: string // Lucide icon name
    color: string // Tailwind color class
    style: "number" | "bar" // How to show it
    barColor?: string // For bar style
    showInCreator?: boolean // Show during character creation
    showInSheet?: boolean // Show in character sheet
    order?: number // Display order
  }

  // For 'core' stats
  range?: {
    min: number
    max: number
  }

  // For 'computed' stats
  calculation?: Token[]
  clamp?: {
    // Optional min/max for computed values
    min?: number
    max?: number
  }
}

// Calculation tokens - simple and clear
export type Token =
  | { type: "stat"; id: string } // Reference another stat
  | { type: "number"; value: number } // Literal number
  | { type: "op"; value: "+" | "-" | "*" | "/" } // Operator
  | { type: "paren"; value: "(" | ")" } // Grouping
  | { type: "fn"; name: "min" | "max" | "floor" } // Functions
  | { type: "role"; role: string; stat: string } // For challenges: "attacker.strength"

// ============================================
// ITEMS - Things characters can have
// ============================================

export interface Item {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"

  kind: "equipment" | "consumable" | "key"

  // For equipment
  slot?: string
  bonuses?: { statId: string; amount: number }[]

  // For consumables
  stackable?: boolean
  maxStack?: number
  effect?: { statId: string; amount: number }[] // Permanent changes when used
}

// ============================================
// CHALLENGES - Timed events (battles, races, exams, etc.)
// ============================================

export interface ChallengeTemplate {
  id: string
  name: string // "Combat", "Race", "Exam"
  description: string
  icon: string

  // Who participates
  roles: {
    id: string // "player", "enemy", "opponent"
    name: string // Display name
    required: boolean
  }[]

  // What stats matter in this challenge (for display)
  trackedStats: {
    statId: string
    showAs: "bar" | "number"
    label?: string // Override display name
  }[]

  // What happens each round
  rounds: RoundAction[]

  // How it can end
  outcomes: Outcome[]

  // Safety limits
  maxRounds: number
  defaultOutcome?: string // If max rounds hit

  // UI customization
  display: {
    roundDelay: number // ms between rounds
    showLog: boolean
    theme?: "combat" | "race" | "academic" | "social"
  }
}

export type RoundAction =
  | {
      type: "damage"
      target: string // Role ID
      stat: string // Which stat to reduce
      amount: Token[] // Calculation for damage
      message?: string // "{attacker} hits {target} for {amount}!"
    }
  | {
      type: "check"
      condition: Token[] // Must evaluate to truthy
      onTrue?: string // Outcome ID to trigger
      onFalse?: string
    }
  | {
      type: "log"
      message: string // Template with {role.stat} placeholders
    }
  | {
      type: "roll"
      dice: string // "1d20", "2d6"
      saveAs: string // Variable name to store result
      modifier?: Token[]
    }

export interface Outcome {
  id: string
  name: string // "Victory", "Defeat", "First Place"
  description: string
  result: "win" | "lose" | "draw"

  // Rewards/consequences
  rewards?: {
    experience?: number
    items?: { itemId: string; chance: number }[]
    statChanges?: { statId: string; amount: number }[]
  }

  gameOver?: boolean
}

// ============================================
// TEMPLATES - NPCs and Locations
// ============================================

export interface NPC {
  id: string
  name: string
  description: string
  role: string // "mentor", "villain", "ally"
  stats: Record<string, number>
  portrait?: string
}

export interface Location {
  id: string
  name: string
  description: string
  image?: string
}

// ============================================
// GAME STATE - Active playthrough
// ============================================

export interface GameState {
  id: string
  universeId: string

  character: Character

  // Story is just a stack of cards
  story: Card[]

  // Current story phase (0-11 for hero's journey)
  phase: number

  // If we're in a challenge
  challenge: ActiveChallenge | null
}

export interface Character {
  id: string
  name: string
  level: number

  // Core stats (what player assigned + permanent bonuses)
  baseStats: Record<string, number>

  // Equipment slots -> item IDs
  equipment: Record<string, string | null>

  // Inventory
  inventory: { itemId: string; quantity: number }[]

  // Points tracking
  points: {
    total: number
    used: number
  }
}

// ============================================
// CARDS - What appears in the story stack
// ============================================

export type Card = StoryCard | ChoiceCard | DiceCard | ChallengeCard | OutcomeCard

interface BaseCard {
  id: string
  timestamp: number
}

export interface StoryCard extends BaseCard {
  type: "story"
  title: string
  content: string
  image?: string
}

export interface ChoiceCard extends BaseCard {
  type: "choice"
  prompt: string
  options: {
    id: string
    text: string
    description?: string
    skillCheck?: {
      statId: string
      difficulty: number
    }
    selected?: boolean
    disabled?: boolean
  }[]
}

export interface DiceCard extends BaseCard {
  type: "dice"
  stat: string
  statValue: number
  roll: number
  target: number
  success: boolean
}

export interface ChallengeCard extends BaseCard {
  type: "challenge"
  challengeId: string
  status: "active" | "complete"
  outcomeId?: string
}

export interface OutcomeCard extends BaseCard {
  type: "outcome"
  title: string
  description: string
  result: "win" | "lose" | "draw"
  rewards?: string[]
}

// ============================================
// ACTIVE CHALLENGE - Running challenge state
// ============================================

export interface ActiveChallenge {
  templateId: string
  round: number

  participants: Record<
    string,
    {
      name: string
      portrait?: string
      stats: Record<string, number>
      maxStats: Record<string, number>
    }
  >

  variables: Record<string, number>
  log: LogEntry[]

  outcome: Outcome | null
}

export interface LogEntry {
  id: string
  message: string
  type: "action" | "damage" | "heal" | "info" | "result"
  timestamp: number
}
