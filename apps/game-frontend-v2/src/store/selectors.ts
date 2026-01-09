import type { v2 } from "@wdydn/shared";
type Character = v2.Character;
type Moment = v2.Moment;
type Location = v2.Location;
type Stat = v2.Stat;
import { useGameStore } from "./game-store";

/**
 * Select available moments (choices the player can make)
 */
export const selectAvailableMoments = (): Moment[] => {
  const gameState = useGameStore((state) => state.gameState);
  return gameState?.moments.filter((m) => m.status === "available") ?? [];
};

/**
 * Select the active moment (currently being experienced)
 */
export const selectActiveMoment = (): Moment | undefined => {
  const gameState = useGameStore((state) => state.gameState);
  return gameState?.moments.find((m) => m.status === "active");
};

/**
 * Select lived moments (history) in chronological order
 */
export const selectLivedMoments = (): Moment[] => {
  const gameState = useGameStore((state) => state.gameState);
  return gameState?.moments.filter((m) => m.status === "lived") ?? [];
};

/**
 * Select the player character
 */
export const selectPlayerCharacter = (): Character | undefined => {
  const gameState = useGameStore((state) => state.gameState);
  return gameState?.characters.find((c) => c.isPlayer);
};

/**
 * Select the current location from active moment
 */
export const selectCurrentLocation = (): Location | undefined => {
  const gameState = useGameStore((state) => state.gameState);
  const universe = useGameStore((state) => state.universe);
  const activeMoment = gameState?.moments.find((m) => m.status === "active");

  if (!activeMoment?.locationId || !universe) return undefined;

  return universe.locations.find((l) => l.id === activeMoment.locationId);
};

/**
 * Select a character by ID
 */
export const selectCharacterById = (
  characterId: string
): Character | undefined => {
  const gameState = useGameStore((state) => state.gameState);
  const universe = useGameStore((state) => state.universe);

  // First check game state (for runtime characters)
  const runtimeChar = gameState?.characters.find((c) => c.id === characterId);
  if (runtimeChar) return runtimeChar;

  // Fall back to universe template
  return universe?.characters.find((c) => c.id === characterId);
};

/**
 * Compute resolved stats for a character
 * This is a simplified version - full resolution happens on backend
 */
export const selectResolvedStats = (
  character: Character
): Record<string, number | boolean | string> => {
  const universe = useGameStore((state) => state.universe);
  if (!universe) return character.stats;

  const resolved = { ...character.stats };

  // Apply equipment bonuses
  if (character.equipment) {
    for (const [_slot, itemId] of Object.entries(character.equipment)) {
      if (!itemId) continue;

      const item = universe.items.find((i) => i.id === itemId);
      if (!item?.whileEquipped) continue;

      for (const bonus of item.whileEquipped) {
        const current = resolved[bonus.statId];
        if (typeof current === "number") {
          resolved[bonus.statId] = current + bonus.amount;
        }
      }
    }
  }

  // Evaluate formulas (simplified - real evaluation on backend)
  // Just return the stats with equipment bonuses for now
  return resolved;
};

/**
 * Select stat definitions from universe
 */
export const selectStatDefinitions = (): Stat[] => {
  const universe = useGameStore((state) => state.universe);
  return universe?.stats ?? [];
};

/**
 * Select visible stats for display
 */
export const selectVisibleStats = (): Stat[] => {
  const universe = useGameStore((state) => state.universe);
  return (
    universe?.stats.filter((s) => s.display?.style !== "hidden") ?? []
  );
};

/**
 * Check if game is in a waiting state (needs player input)
 */
export const selectIsWaitingForChoice = (): boolean => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return false;

  const hasActive = gameState.moments.some((m) => m.status === "active");
  const hasAvailable = gameState.moments.some((m) => m.status === "available");

  return !hasActive && hasAvailable;
};

/**
 * Check if game needs content (no moments available)
 */
export const selectNeedsContent = (): boolean => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return false;

  const hasActive = gameState.moments.some((m) => m.status === "active");
  const hasAvailable = gameState.moments.some((m) => m.status === "available");

  return !hasActive && !hasAvailable;
};

/**
 * Select current turn number
 */
export const selectCurrentTurn = (): number => {
  const gameState = useGameStore((state) => state.gameState);
  return (gameState?.globalStats.turn as number) ?? 0;
};

/**
 * Select a global stat value
 */
export const selectGlobalStat = (
  statId: string
): number | boolean | string | undefined => {
  const gameState = useGameStore((state) => state.gameState);
  return gameState?.globalStats[statId];
};

// Hooks that use the selectors (for components)
export const useAvailableMoments = () =>
  useGameStore((state) =>
    state.gameState?.moments.filter((m) => m.status === "available") ?? []
  );

export const useActiveMoment = () =>
  useGameStore((state) =>
    state.gameState?.moments.find((m) => m.status === "active")
  );

export const useLivedMoments = () =>
  useGameStore((state) =>
    state.gameState?.moments.filter((m) => m.status === "lived") ?? []
  );

export const usePlayerCharacter = () =>
  useGameStore((state) =>
    state.gameState?.characters.find((c) => c.isPlayer)
  );

export const useCurrentLocation = () => {
  const activeMoment = useActiveMoment();
  const universe = useGameStore((state) => state.universe);

  if (!activeMoment?.locationId || !universe) return undefined;
  return universe.locations.find((l) => l.id === activeMoment.locationId);
};

export const useIsPlaying = () =>
  useGameStore((state) => state.phase === "playing" && state.gameState !== null);

export const useIsLoading = () => useGameStore((state) => state.isLoading);

export const useError = () => useGameStore((state) => state.error);
