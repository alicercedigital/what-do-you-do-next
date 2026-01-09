import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Universe = v2.Universe;
import type { ChallengeRuntimeState } from "./engine/challenge-processor";

/**
 * In-memory storage for games and universes
 *
 * In production, replace this with a database implementation
 */

export interface StoredGame {
  state: GameState;
  universe: Universe;
}

// Game sessions storage
export const games = new Map<string, StoredGame>();

// Universe templates storage
export const universes = new Map<string, Universe>();

// Challenge state storage (separate from game state)
export const challengeStates = new Map<string, ChallengeRuntimeState>();

/**
 * Get a game by ID
 */
export function getGame(gameId: string): StoredGame | undefined {
  return games.get(gameId);
}

/**
 * Save a game
 */
export function saveGame(game: StoredGame): void {
  games.set(game.state.id, game);
}

/**
 * Delete a game
 */
export function deleteGame(gameId: string): boolean {
  return games.delete(gameId);
}

/**
 * Get all games
 */
export function getAllGames(): StoredGame[] {
  return Array.from(games.values());
}

/**
 * Get a universe by ID
 */
export function getUniverse(universeId: string): Universe | undefined {
  return universes.get(universeId);
}

/**
 * Save a universe
 */
export function saveUniverse(universe: Universe): void {
  universes.set(universe.id, universe);
}

/**
 * Delete a universe
 */
export function deleteUniverse(universeId: string): boolean {
  return universes.delete(universeId);
}

/**
 * Get all universes
 */
export function getAllUniverses(): Universe[] {
  return Array.from(universes.values());
}

/**
 * Clear all storage (for testing)
 */
export function clearAll(): void {
  games.clear();
  universes.clear();
  challengeStates.clear();
}

/**
 * Get challenge state for a game
 */
export function getChallengeState(gameId: string): ChallengeRuntimeState | undefined {
  return challengeStates.get(gameId);
}

/**
 * Save challenge state for a game
 */
export function saveChallengeState(gameId: string, state: ChallengeRuntimeState): void {
  challengeStates.set(gameId, state);
}

/**
 * Delete challenge state for a game
 */
export function deleteChallengeState(gameId: string): boolean {
  return challengeStates.delete(gameId);
}
