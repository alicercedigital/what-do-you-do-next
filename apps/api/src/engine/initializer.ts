import type { v2 } from "@wdydn/shared";
type Universe = v2.Universe;
type GameState = v2.GameState;
type Character = v2.Character;
type Moment = v2.Moment;

/**
 * Options for initializing a new game
 */
export interface InitializeOptions {
  universe: Universe;
  playerId?: string; // Which playable character to use (if multiple)
  seed?: number; // For deterministic randomness
}

/**
 * Initialize a new GameState from a Universe template
 *
 * This:
 * 1. Deep clones all entities from the Universe
 * 2. Selects the player character
 * 3. Creates moment instances from templates
 * 4. Sets up initial game state
 */
export function initializeGame(options: InitializeOptions): GameState {
  const { universe, playerId, seed } = options;

  // Generate unique game ID
  const gameId = generateId();

  // Deep clone characters
  const characters = structuredClone(universe.characters);

  // Find and mark the player character
  let playerFound = false;
  for (const char of characters) {
    if (playerId) {
      // Use specified player
      char.isPlayer = char.id === playerId;
    } else if (char.playable && !playerFound) {
      // Use first playable character
      char.isPlayer = true;
      playerFound = true;
    } else {
      char.isPlayer = false;
    }

    if (char.isPlayer) {
      playerFound = true;
    }
  }

  if (!playerFound && characters.length > 0) {
    // No playable character found, use first character
    characters[0].isPlayer = true;
  }

  // Create moment instances from templates
  const moments = createMomentInstances(universe.moments);

  // Initialize global stats
  const globalStats: Record<string, number | boolean | string> = {
    turn: 0,
  };

  const now = Date.now();

  return {
    id: gameId,
    universeId: universe.id,
    createdAt: now,
    savedAt: now,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
    characters,
    globalStats,
    moments,
  };
}

/**
 * Create moment instances from templates
 *
 * Templates have simple IDs like "tavern_fight"
 * Instances get suffixed IDs like "tavern_fight-0"
 */
function createMomentInstances(templates: Moment[]): Moment[] {
  const instances: Moment[] = [];
  const instanceCounts: Record<string, number> = {};

  for (const template of templates) {
    // Get next instance number for this template
    const count = instanceCounts[template.id] ?? 0;
    instanceCounts[template.id] = count + 1;

    // Create instance with suffixed ID
    const instance: Moment = structuredClone(template);
    instance.id = `${template.id}-${count}`;

    // Ensure status is set
    if (!instance.status) {
      instance.status = "hidden";
    }

    instances.push(instance);
  }

  return instances;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Add a new moment instance to the game state
 */
export function addMomentInstance(
  state: GameState,
  templateId: string,
  universe: Universe,
  initialStatus: Moment["status"] = "hidden"
): { state: GameState; momentInstanceId: string } {
  const template = universe.moments.find((m) => m.id === templateId);
  if (!template) {
    throw new Error(`Moment template not found: ${templateId}`);
  }

  // Count existing instances of this template
  const existingCount = state.moments.filter((m) =>
    m.id.startsWith(`${templateId}-`)
  ).length;

  // Create new instance
  const instance: Moment = structuredClone(template);
  instance.id = `${templateId}-${existingCount}`;
  instance.status = initialStatus;

  // Add to state
  const newState = structuredClone(state);
  newState.moments.push(instance);

  return {
    state: newState,
    momentInstanceId: instance.id,
  };
}

/**
 * Get the player character from game state
 */
export function getPlayer(state: GameState): Character | undefined {
  return state.characters.find((c) => c.isPlayer);
}

/**
 * Get available moments (choices the player can make)
 */
export function getAvailableMoments(state: GameState): Moment[] {
  return state.moments.filter((m) => m.status === "available");
}

/**
 * Get the active moment (currently being experienced)
 */
export function getActiveMoment(state: GameState): Moment | undefined {
  return state.moments.find((m) => m.status === "active");
}

/**
 * Get lived moments (history) in chronological order
 */
export function getLivedMoments(state: GameState): Moment[] {
  return state.moments.filter((m) => m.status === "lived");
}
