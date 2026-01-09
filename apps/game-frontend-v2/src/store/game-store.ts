import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Universe = v2.Universe;
type Challenge = v2.Challenge;
import { api, type ChallengeRuntimeState } from "@/shared/lib/api";

// Re-export types for convenience
export type { ChallengeRuntimeState, ChallengeLogEntry } from "@/shared/lib/api";

// Alias for backward compatibility
export type ChallengeState = ChallengeRuntimeState;

/**
 * Game phase
 */
export type GamePhase = "menu" | "loading" | "playing" | "paused";

/**
 * Game store state
 */
interface GameStoreState {
  // Core state
  phase: GamePhase;
  universe: Universe | null;
  gameState: GameState | null;
  challengeState: ChallengeRuntimeState | null;
  challengeDefinition: Challenge | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Cached/derived
  gameId: string | null;
}

/**
 * Game store actions
 */
interface GameStoreActions {
  // Game lifecycle
  createGame: (universeId: string, characterId?: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  saveGame: () => Promise<void>;
  exitGame: () => void;
  reset: () => void;

  // Universe
  loadUniverse: (universeId: string) => Promise<void>;
  registerUniverse: (universe: Universe) => Promise<void>;

  // Moment actions
  selectMoment: (momentInstanceId: string) => Promise<void>;
  completeMoment: () => Promise<void>;

  // Challenge actions
  startChallenge: (roleAssignments: Record<string, string>) => Promise<void>;
  advanceChallenge: () => Promise<void>;
  endChallenge: () => void;

  // State updates
  setPhase: (phase: GamePhase) => void;
  setError: (error: string | null) => void;
  updateGameState: (state: GameState) => void;
}

type GameStore = GameStoreState & GameStoreActions;

const initialState: GameStoreState = {
  phase: "menu",
  universe: null,
  gameState: null,
  challengeState: null,
  challengeDefinition: null,
  isLoading: false,
  error: null,
  gameId: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Game lifecycle
      createGame: async (universeId: string, characterId?: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { gameId, state: gameState } = await api.createGame(
            universeId,
            characterId
          );

          // Load universe if not already loaded
          let universe = get().universe;
          if (!universe || universe.id !== universeId) {
            universe = await api.getUniverse(universeId);
          }

          set((state) => {
            state.gameId = gameId;
            state.gameState = gameState;
            state.universe = universe;
            state.phase = "playing";
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to create game";
            state.isLoading = false;
          });
        }
      },

      loadGame: async (gameId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { state: gameState, universe } = await api.getGame(gameId);

          set((state) => {
            state.gameId = gameId;
            state.gameState = gameState;
            state.universe = universe;
            state.phase = "playing";
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to load game";
            state.isLoading = false;
          });
        }
      },

      saveGame: async () => {
        const { gameId } = get();
        if (!gameId) return;

        try {
          await api.saveGame(gameId);
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to save game";
          });
        }
      },

      exitGame: () => {
        set((state) => {
          state.phase = "menu";
          state.gameState = null;
          state.gameId = null;
          state.challengeState = null;
          state.challengeDefinition = null;
        });
      },

      reset: () => {
        set(initialState);
      },

      // Universe
      loadUniverse: async (universeId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const universe = await api.getUniverse(universeId);
          set((state) => {
            state.universe = universe;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to load universe";
            state.isLoading = false;
          });
        }
      },

      registerUniverse: async (universe: Universe) => {
        try {
          await api.registerUniverse(universe);
          set((state) => {
            state.universe = universe;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to register universe";
          });
        }
      },

      // Moment actions
      selectMoment: async (momentInstanceId: string) => {
        const { gameId } = get();
        if (!gameId) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { state: gameState } = await api.selectMoment(
            gameId,
            momentInstanceId
          );

          set((state) => {
            state.gameState = gameState;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to select moment";
            state.isLoading = false;
          });
        }
      },

      completeMoment: async () => {
        const { gameId } = get();
        if (!gameId) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { state: gameState } = await api.completeMoment(gameId);

          set((state) => {
            state.gameState = gameState;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to complete moment";
            state.isLoading = false;
          });
        }
      },

      // Challenge actions
      startChallenge: async (roleAssignments: Record<string, string>) => {
        const { gameId, gameState } = get();
        if (!gameId || !gameState) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await api.startChallenge(gameId, roleAssignments);

          // Get challenge definition from the active moment
          const activeMoment = result.state.moments.find(
            (m) => m.id === result.challengeState.momentId
          );

          set((state) => {
            state.gameState = result.state;
            state.challengeState = result.challengeState;
            state.challengeDefinition = activeMoment?.challenge ?? null;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to start challenge";
            state.isLoading = false;
          });
        }
      },

      advanceChallenge: async () => {
        const { gameId, challengeState } = get();
        if (!gameId || !challengeState) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const result = await api.advanceChallenge(gameId);

          set((state) => {
            state.gameState = result.state;
            state.challengeState = result.challengeState.completed
              ? null
              : result.challengeState;
            if (result.challengeState.completed) {
              state.challengeDefinition = null;
            }
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to advance challenge";
            state.isLoading = false;
          });
        }
      },

      endChallenge: () => {
        const { gameId } = get();
        if (gameId) {
          api.endChallenge(gameId).catch(console.error);
        }
        set((state) => {
          state.challengeState = null;
          state.challengeDefinition = null;
        });
      },

      // State updates
      setPhase: (phase: GamePhase) => {
        set((state) => {
          state.phase = phase;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      updateGameState: (gameState: GameState) => {
        set((state) => {
          state.gameState = gameState;
        });
      },
    })),
    {
      name: "wdydn-game-v2",
      partialize: (state) => ({
        // Only persist these fields
        gameId: state.gameId,
        phase: state.phase,
      }),
    }
  )
);
