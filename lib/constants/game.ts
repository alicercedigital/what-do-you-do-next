/**
 * Shared constants and types for the game system
 */

// Card dimensions
export const CARD_DIMENSIONS = {
  event: { width: 320, height: 420 },
  option: { width: 288, height: 180 },
  diceRoll: { width: 320, height: 420 },
  conflict: { width: 380, height: 500 },
} as const;

export type CardType = keyof typeof CARD_DIMENSIONS;

// Positioning constants
export const POSITIONING = {
  eventOffset: 400,
  optionSpacing: 200,
  optionOffset: 400,
  padding: 150,
  centerZoom: 0.75,
  minZoom: 0.3,
  maxZoom: 2,
} as const;

// Animation constants
export const ANIMATION = {
  spring: {
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  fade: {
    duration: 0.4,
  },
  delay: {
    short: 100,
    medium: 300,
    long: 500,
    veryLong: 1000,
  },
  scale: {
    new: 0.5,
    normal: 1,
  },
  opacity: {
    hidden: 0,
    visible: 1,
  },
  y: {
    offset: 20,
  },
} as const;

// Color constants
export const COLORS = {
  primary: "#d4a574",
  secondary: "#6b7280",
  success: "#10b981",
  failure: "#ef4444",
  danger: "#dc2626",
  muted: "#6b7280",
} as const;

// Timing constants
export const TIMING = {
  autoSave: 30000,
  newFlagClear: 1000,
  storyGenerationDelay: 100,
  conflictCycleDelay: 1500,
  optionClickDelay: 800,
  diceRollDelay: 3000,
  continueDelay: 500,
  scrollDuration: 600,
  centerDuration: 800,
} as const;

// Hero journey steps (shared constant)
export const HERO_JOURNEY_STEPS = [
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
] as const;

export type HeroJourneyStep = (typeof HERO_JOURNEY_STEPS)[number];

// Event types
export const EVENT_TYPES = [
  "narrative",
  "dialogue",
  "action",
  "audio",
  "image",
  "dice-roll",
  "conflict",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// Node types
export const NODE_TYPES = {
  event: "event",
  option: "option",
  diceRoll: "diceRoll",
  conflict: "conflict",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

// Edge types
export const EDGE_TYPES = {
  animated: "animated",
} as const;

// Storage keys
export const STORAGE_KEYS = {
  savedGames: "game-story-generator-saved-games",
  currentGame: "game-story-generator-current-game",
  autoSave: "game-story-generator-auto-save",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  storyGenerate: "/api/story/generate",
  attributesGenerate: "/api/attributes/generate",
  attributesBenchmarks: "/api/attributes/generate-benchmarks",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  failedToGenerate: "Failed to generate story",
  missingGameData: "Cannot save: missing game data",
  gameNotFound: "Cannot load: game not found",
  conflictNotFound: "Conflict event not found",
  formulaEvaluation: "Formula evaluation error",
} as const;

// UI constants
export const UI = {
  maxContentLength: 320,
  truncatedLength: 317,
  sidebarWidth: 72,
  headerHeight: 16,
  scrollbarWidth: 80,
  attributeTestDifficulty: 20,
} as const;

// Game state defaults
export const GAME_DEFAULTS = {
  heroStep: "ordinary-world" as HeroJourneyStep,
  startingPoints: 20,
  characterLevel: 1,
  role: "protagonist",
  conflictMaxCycles: 10,
} as const;
