import type { ChallengeTemplate } from "@/core/types"

export const COMBAT_TEMPLATE: ChallengeTemplate = {
  id: "combat",
  name: "Combat",
  description: "A battle to the death",
  icon: "swords",

  roles: [
    { id: "player", name: "Player", required: true },
    { id: "enemy", name: "Enemy", required: true },
  ],

  trackedStats: [{ statId: "hp", showAs: "bar", label: "Health" }],

  rounds: [
    // Player attacks
    {
      type: "damage",
      target: "enemy",
      stat: "hp",
      amount: [
        { type: "role", role: "player", stat: "strength" },
        { type: "op", value: "*" },
        { type: "number", value: 2 },
      ],
      message: "{player.name} attacks for {amount} damage!",
    },
    // Check enemy death
    {
      type: "check",
      condition: [{ type: "role", role: "enemy", stat: "hp" }],
      onTrue: "victory",
    },
    // Enemy attacks
    {
      type: "damage",
      target: "player",
      stat: "hp",
      amount: [
        { type: "role", role: "enemy", stat: "strength" },
        { type: "op", value: "*" },
        { type: "number", value: 2 },
      ],
      message: "{enemy.name} strikes back for {amount} damage!",
    },
    // Check player death
    {
      type: "check",
      condition: [{ type: "role", role: "player", stat: "hp" }],
      onTrue: "defeat",
    },
  ],

  outcomes: [
    {
      id: "victory",
      name: "Victory!",
      description: "You defeated your enemy.",
      result: "win",
      rewards: { experience: 50 },
    },
    {
      id: "defeat",
      name: "Defeated",
      description: "You have fallen in battle.",
      result: "lose",
      gameOver: true,
    },
  ],

  maxRounds: 50,
  defaultOutcome: "defeat",

  display: {
    roundDelay: 1000,
    showLog: true,
    theme: "combat",
  },
}

export const RACE_TEMPLATE: ChallengeTemplate = {
  id: "race",
  name: "Race",
  description: "A test of speed",
  icon: "timer",

  roles: [
    { id: "player", name: "You", required: true },
    { id: "opponent", name: "Opponent", required: true },
  ],

  trackedStats: [{ statId: "distance", showAs: "bar", label: "Progress" }],

  rounds: [
    {
      type: "roll",
      dice: "1d6",
      saveAs: "playerRoll",
      modifier: [
        { type: "role", role: "player", stat: "speed" },
        { type: "op", value: "/" },
        { type: "number", value: 5 },
      ],
    },
    {
      type: "roll",
      dice: "1d6",
      saveAs: "opponentRoll",
      modifier: [
        { type: "role", role: "opponent", stat: "speed" },
        { type: "op", value: "/" },
        { type: "number", value: 5 },
      ],
    },
    {
      type: "log",
      message: "You advance {playerRoll} steps, opponent advances {opponentRoll} steps!",
    },
  ],

  outcomes: [
    { id: "first", name: "First Place!", description: "You won the race!", result: "win" },
    { id: "second", name: "Second Place", description: "Close, but not enough.", result: "lose" },
  ],

  maxRounds: 10,
  defaultOutcome: "second",

  display: {
    roundDelay: 800,
    showLog: true,
    theme: "race",
  },
}

export const EXAM_TEMPLATE: ChallengeTemplate = {
  id: "exam",
  name: "Exam",
  description: "A test of knowledge",
  icon: "graduation-cap",

  roles: [{ id: "student", name: "You", required: true }],

  trackedStats: [
    { statId: "score", showAs: "number", label: "Score" },
    { statId: "questions", showAs: "number", label: "Questions Left" },
  ],

  rounds: [
    {
      type: "roll",
      dice: "1d20",
      saveAs: "attempt",
      modifier: [{ type: "role", role: "student", stat: "intelligence" }],
    },
    {
      type: "log",
      message: "You rolled {attempt} on the question...",
    },
  ],

  outcomes: [
    { id: "passed", name: "Passed!", description: "You passed the exam.", result: "win" },
    { id: "failed", name: "Failed", description: "Better luck next time.", result: "lose" },
  ],

  maxRounds: 5,
  defaultOutcome: "failed",

  display: {
    roundDelay: 1500,
    showLog: true,
    theme: "academic",
  },
}

export const DEFAULT_TEMPLATES = [COMBAT_TEMPLATE, RACE_TEMPLATE, EXAM_TEMPLATE]
