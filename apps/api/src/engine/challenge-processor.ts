import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Challenge = v2.Challenge;
type ChallengeOutcome = v2.ChallengeOutcome;
type Character = v2.Character;
type Consequence = v2.Consequence;
import { evaluate, evaluateAndApply, checkCondition } from "./expression";
import type { AiConditionRequest, EvaluationContext, EvaluationResult } from "./expression";

/**
 * Runtime state for an active challenge
 */
export interface ChallengeRuntimeState {
  challengeId: string;
  momentId: string;
  round: number;
  maxRounds: number;
  roleAssignments: Record<string, string>; // roleId -> characterId
  roundLog: ChallengeLogEntry[];
  variables: Record<string, number>;
  completed: boolean;
  outcome: { id: string; name: string } | null;
}

export interface ChallengeLogEntry {
  round: number;
  message: string;
  type: "action" | "roll" | "effect" | "outcome";
  data?: Record<string, unknown>;
}

/**
 * Result from processing a challenge round
 */
export interface ChallengeRoundResult {
  state: GameState;
  challengeState: ChallengeRuntimeState;
  aiConditions: AiConditionRequest[];
  logEntries: ChallengeLogEntry[];
}

/**
 * Challenge Processor
 *
 * Handles the round-based challenge system:
 * - Role assignment
 * - Round action execution
 * - Outcome evaluation
 */
export class ChallengeProcessor {
  private gameState: GameState;
  private challenge: Challenge;
  private runtimeState: ChallengeRuntimeState;

  constructor(
    gameState: GameState,
    challenge: Challenge,
    momentId: string,
    existingState?: ChallengeRuntimeState
  ) {
    this.gameState = { ...gameState };
    this.challenge = challenge;

    if (existingState) {
      this.runtimeState = { ...existingState };
    } else {
      this.runtimeState = {
        challengeId: challenge.id,
        momentId,
        round: 0,
        maxRounds: challenge.maxRounds ?? 10,
        roleAssignments: {},
        roundLog: [],
        variables: {},
        completed: false,
        outcome: null,
      };
    }
  }

  /**
   * Start the challenge with role assignments
   */
  start(roleAssignments: Record<string, string>): ChallengeRoundResult {
    // Validate role assignments
    for (const role of this.challenge.roles) {
      if (role.required && !roleAssignments[role.id]) {
        throw new Error(`Required role '${role.name}' not assigned`);
      }
    }

    this.runtimeState.roleAssignments = roleAssignments;
    this.runtimeState.round = 1;

    const logEntry: ChallengeLogEntry = {
      round: 0,
      message: `${this.challenge.name} begins!`,
      type: "action",
    };
    this.runtimeState.roundLog.push(logEntry);

    // Run the first round
    return this.advanceRound();
  }

  /**
   * Advance to next round, execute actions, check outcomes
   */
  advanceRound(): ChallengeRoundResult {
    const collectedAiConditions: AiConditionRequest[] = [];
    const logEntries: ChallengeLogEntry[] = [];

    // Build evaluation context
    const context = this.buildContext();

    // Execute round actions
    for (const action of this.challenge.roundActions) {
      const result = this.executeConsequence(action, context);

      if (result.aiConditions.length > 0) {
        collectedAiConditions.push(...result.aiConditions);
      }

      // Apply mutations
      for (const mutation of result.mutations) {
        this.applyMutation(mutation);
      }

      // Log the action
      if (result.value !== undefined) {
        const entry: ChallengeLogEntry = {
          round: this.runtimeState.round,
          message: `Executed: ${action}`,
          type: "effect",
          data: { value: result.value },
        };
        logEntries.push(entry);
        this.runtimeState.roundLog.push(entry);
      }
    }

    // Check outcomes
    const outcome = this.checkOutcomes(context);
    if (outcome) {
      this.runtimeState.completed = true;
      this.runtimeState.outcome = { id: outcome.id, name: outcome.name };

      const outcomeEntry: ChallengeLogEntry = {
        round: this.runtimeState.round,
        message: `Outcome: ${outcome.name}`,
        type: "outcome",
      };
      logEntries.push(outcomeEntry);
      this.runtimeState.roundLog.push(outcomeEntry);

      // Execute outcome consequences
      if (outcome.consequences) {
        for (const consequence of outcome.consequences) {
          const result = this.executeConsequence(consequence, context);
          for (const mutation of result.mutations) {
            this.applyMutation(mutation);
          }
        }
      }
    } else if (this.runtimeState.round >= this.runtimeState.maxRounds) {
      // Max rounds reached without outcome
      this.runtimeState.completed = true;
      const timeoutEntry: ChallengeLogEntry = {
        round: this.runtimeState.round,
        message: "Challenge ended: maximum rounds reached",
        type: "outcome",
      };
      logEntries.push(timeoutEntry);
      this.runtimeState.roundLog.push(timeoutEntry);
    } else {
      // Advance to next round
      this.runtimeState.round++;
    }

    return {
      state: this.gameState,
      challengeState: this.runtimeState,
      aiConditions: collectedAiConditions,
      logEntries,
    };
  }

  /**
   * Get the current runtime state
   */
  getRuntimeState(): ChallengeRuntimeState {
    return { ...this.runtimeState };
  }

  /**
   * Get the updated game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Check if challenge is completed
   */
  isCompleted(): boolean {
    return this.runtimeState.completed;
  }

  /**
   * Build evaluation context for expressions
   */
  private buildContext(): EvaluationContext {
    // Find self moment
    const selfMoment = this.gameState.moments.find(
      (m) => m.id === this.runtimeState.momentId
    );

    return {
      characters: this.gameState.characters.map((c) => ({
        id: c.id,
        isPlayer: c.isPlayer,
        stats: c.stats,
        disposition: c.disposition ?? {},
      })),
      moments: this.gameState.moments.map((m) => ({
        id: m.id,
        status: m.status,
      })),
      globalStats: this.gameState.globalStats,
      self: selfMoment ? { id: selfMoment.id, status: selfMoment.status } : undefined,
      round: this.runtimeState.round,
      turn: (this.gameState.globalStats.turn as number) ?? 0,
    };
  }

  /**
   * Execute a consequence expression
   * Note: Consequence is just a string (Expression alias)
   */
  private executeConsequence(
    consequence: Consequence,
    context: EvaluationContext
  ): EvaluationResult {
    const { result } = evaluateAndApply(consequence, context);
    return result;
  }

  /**
   * Check if any outcome conditions are met
   */
  private checkOutcomes(
    context: EvaluationContext
  ): ChallengeOutcome | undefined {
    for (const outcome of this.challenge.outcomes) {
      const result = checkCondition(outcome.condition, context);
      if (result) {
        return outcome;
      }
    }
    return undefined;
  }

  /**
   * Apply a mutation to the game state
   */
  private applyMutation(mutation: {
    path: string[];
    value: unknown;
  }): void {
    const parts = mutation.path;

    if (parts[0] === "character") {
      // Character stat mutation
      const charId = parts[1];
      const charIndex = this.gameState.characters.findIndex(
        (c) => c.id === charId
      );
      if (charIndex !== -1 && parts[2] === "stats" && parts[3]) {
        this.gameState.characters[charIndex].stats[parts[3]] = mutation.value as
          | number
          | boolean
          | string;
      }
    } else if (parts[0] === "globalStats" && parts[1]) {
      // Global stat mutation
      this.gameState.globalStats[parts[1]] = mutation.value as
        | number
        | boolean
        | string;
    } else if (parts[0] === "$challenge" && parts[1]) {
      // Challenge variable mutation
      this.runtimeState.variables[parts[1]] = mutation.value as number;
    }
  }
}

/**
 * Create a challenge processor from game state
 */
export function createChallengeProcessor(
  gameState: GameState,
  challenge: Challenge,
  momentId: string,
  existingState?: ChallengeRuntimeState
): ChallengeProcessor {
  return new ChallengeProcessor(gameState, challenge, momentId, existingState);
}
