import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Universe = v2.Universe;
type Moment = v2.Moment;
type Character = v2.Character;
import { initializeGame, addMomentInstance, getPlayer } from "./initializer";
import type { InitializeOptions } from "./initializer";
import {
  selectMoment,
  completeMoment,
  getMomentsByStatus,
  hasAvailableMoments,
  hasActiveMoment,
} from "./moment-processor";
import { runTransitionCycle } from "./transition-processor";
import type { TransitionResult } from "./transition-processor";
import { resolveCharacterStats } from "./stat-resolver";

/**
 * Main game engine that coordinates all game operations
 */
export class GameEngine {
  private state: GameState;
  private universe: Universe;

  constructor(state: GameState, universe: Universe) {
    this.state = state;
    this.universe = universe;
  }

  /**
   * Create a new game from a universe
   */
  static createGame(options: InitializeOptions): GameEngine {
    const state = initializeGame(options);

    // Run initial transition cycle to activate starting moments
    const result = runTransitionCycle(state, options.universe);

    return new GameEngine(result.state, options.universe);
  }

  /**
   * Load an existing game
   */
  static loadGame(state: GameState, universe: Universe): GameEngine {
    return new GameEngine(state, universe);
  }

  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Get the universe
   */
  getUniverse(): Universe {
    return this.universe;
  }

  /**
   * Save the current state (update savedAt timestamp)
   */
  save(): GameState {
    this.state = {
      ...this.state,
      savedAt: Date.now(),
    };
    return this.state;
  }

  /**
   * Get the player character
   */
  getPlayer(): Character | undefined {
    return getPlayer(this.state);
  }

  /**
   * Get player with resolved stats
   */
  getPlayerWithResolvedStats(): {
    character: Character;
    resolvedStats: Record<string, number | boolean | string>;
  } | undefined {
    const player = this.getPlayer();
    if (!player) return undefined;

    const resolvedStats = resolveCharacterStats(player, this.universe);
    return { character: player, resolvedStats };
  }

  /**
   * Get available moments (choices)
   */
  getAvailableMoments(): Moment[] {
    return getMomentsByStatus(this.state, "available");
  }

  /**
   * Get the active moment
   */
  getActiveMoment(): Moment | undefined {
    const active = getMomentsByStatus(this.state, "active");
    return active[0];
  }

  /**
   * Get lived moments (history)
   */
  getLivedMoments(): Moment[] {
    return getMomentsByStatus(this.state, "lived");
  }

  /**
   * Check if the game is waiting for a choice
   */
  isWaitingForChoice(): boolean {
    return !hasActiveMoment(this.state) && hasAvailableMoments(this.state);
  }

  /**
   * Check if the game needs content (no available moments and no active moment)
   */
  needsContent(): boolean {
    return !hasActiveMoment(this.state) && !hasAvailableMoments(this.state);
  }

  /**
   * Select a moment to experience
   */
  selectMoment(momentInstanceId: string): TransitionResult {
    const result = selectMoment(this.state, momentInstanceId, this.universe);
    this.state = result.state;
    return result;
  }

  /**
   * Complete the active moment
   */
  completeMoment(): TransitionResult {
    const result = completeMoment(this.state, this.universe);
    this.state = result.state;
    return result;
  }

  /**
   * Add a new moment instance to the game
   */
  addMoment(
    templateId: string,
    initialStatus: Moment["status"] = "hidden"
  ): { momentInstanceId: string } {
    const { state, momentInstanceId } = addMomentInstance(
      this.state,
      templateId,
      this.universe,
      initialStatus
    );
    this.state = state;

    // Run transitions in case the new moment should immediately change status
    const result = runTransitionCycle(this.state, this.universe);
    this.state = result.state;

    return { momentInstanceId };
  }

  /**
   * Run transitions manually (e.g., after AI conditions are resolved)
   */
  runTransitions(): TransitionResult {
    const result = runTransitionCycle(this.state, this.universe);
    this.state = result.state;
    return result;
  }

  /**
   * Get current location from active moment
   */
  getCurrentLocation() {
    const active = this.getActiveMoment();
    if (!active?.locationId) return undefined;

    return this.universe.locations.find((l) => l.id === active.locationId);
  }

  /**
   * Get a character by ID
   */
  getCharacter(characterId: string): Character | undefined {
    return this.state.characters.find((c) => c.id === characterId);
  }

  /**
   * Get character with resolved stats
   */
  getCharacterWithResolvedStats(characterId: string): {
    character: Character;
    resolvedStats: Record<string, number | boolean | string>;
  } | undefined {
    const character = this.getCharacter(characterId);
    if (!character) return undefined;

    const resolvedStats = resolveCharacterStats(character, this.universe);
    return { character, resolvedStats };
  }

  /**
   * Get global stat value
   */
  getGlobalStat(statId: string): number | boolean | string | undefined {
    return this.state.globalStats[statId];
  }

  /**
   * Set global stat value
   */
  setGlobalStat(statId: string, value: number | boolean | string): void {
    this.state = {
      ...this.state,
      globalStats: {
        ...this.state.globalStats,
        [statId]: value,
      },
    };
  }

  /**
   * Get the current turn number
   */
  getCurrentTurn(): number {
    return (this.state.globalStats.turn as number) ?? 0;
  }
}

// Re-export for convenience
export { initializeGame } from "./initializer";
export type { InitializeOptions } from "./initializer";
export { resolveCharacterStats } from "./stat-resolver";
export type { TransitionResult } from "./transition-processor";
