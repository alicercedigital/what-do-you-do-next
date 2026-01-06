import {
    ANIMATION, GAME_DEFAULTS, TIMING
} from "@/lib/constants/game";
import {
    executeCycle, startConflict as startConflictUtil, type ConflictExecutionState
} from "@/lib/game-engine/conflict-system";
import type { GameUniverse } from "@/lib/schemas/game-entity-schema";
import type {
    CanvasConnection, CanvasNode, GameEvent,
    GameOption, GameState,
    PlayerCharacter
} from "@/lib/schemas/game-schema";
import {
    calculateNextNodes,
    calculateOptionNodes, createConnection, delay, generateId
} from "@/lib/utils/game-helpers";
import { gamePersistence, type SavedGame } from "@/lib/utils/game-persistence";
import { create } from "zustand";

interface GameStore {
  // Game setup state
  currentStep: "menu" | "universe-select" | "character" | "playing";
  selectedUniverse: GameUniverse | null;
  character: PlayerCharacter | null;

  // Canvas state
  gameState: GameState | null;
  viewport: { x: number; y: number; scale: number };
  isGenerating: boolean;
  newNodeIds: Set<string>;
  newConnectionIds: Set<string>;

  // Conflict state
  activeConflictState: ConflictExecutionState | null;
  isConflictRunning: boolean;

  // Actions
  setCurrentStep: (
    step: "menu" | "universe-select" | "character" | "playing"
  ) => void;
  selectUniverse: (universe: GameUniverse) => void;
  createCharacter: (character: PlayerCharacter) => void;
  startGame: () => void;

  // Canvas actions
  setViewport: (viewport: { x: number; y: number; scale: number }) => void;
  addNode: (node: CanvasNode) => void;
  addConnection: (connection: CanvasConnection) => void;
  selectOption: (optionId: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  clearNewFlags: () => void;
  setPendingContent: (events: GameEvent[], options: GameOption[]) => void;
  showNextEvent: () => void;

  // Conflict actions
  startConflict: (
    conflictEventId: string,
    enemyName: string,
    enemyPortrait: string | undefined,
    enemyAttributes: Record<string, number>
  ) => void;
  runConflictCycle: () => void;
  endConflict: () => void;

  // Save/Load actions
  saveGame: (name: string) => SavedGame | null;
  loadGame: (gameId: string) => boolean;
  getSavedGames: () => SavedGame[];
  deleteGame: (gameId: string) => void;
  autoSave: () => void;

  // Reset
  resetGame: () => void;
  goToMainMenu: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentStep: "menu",
  selectedUniverse: null,
  character: null,
  gameState: null,
  viewport: { x: 0, y: 0, scale: 1 },
  isGenerating: false,
  newNodeIds: new Set(),
  newConnectionIds: new Set(),
  activeConflictState: null,
  isConflictRunning: false,

  setCurrentStep: (step) => set({ currentStep: step }),

  selectUniverse: (universe) =>
    set({ selectedUniverse: universe, currentStep: "character" }),

  createCharacter: (character) => set({ character }),

  startGame: () => {
    const { selectedUniverse, character } = get();
    if (!selectedUniverse || !character) return;

    const initialState: GameState = {
      id: generateId("game"),
      universeId: selectedUniverse.id,
      character,
      currentHeroStep: GAME_DEFAULTS.heroStep,
      nodes: [],
      connections: [],
      currentEventId: null,
      isWaitingForChoice: false,
      storyHistory: [],
      pendingEvents: [],
      pendingOptions: [],
      lastSelectedOptionId: null,
      isWaitingForContinue: false,
      activeConflict: null,
    };

    set({
      gameState: initialState,
      currentStep: "playing",
      newNodeIds: new Set(),
      newConnectionIds: new Set(),
      viewport: { x: 0, y: 0, scale: 1 },
      isGenerating: false,
      activeConflictState: null,
      isConflictRunning: false,
    });
  },

  setViewport: (viewport) => set({ viewport }),

  addNode: (node) => {
    const { gameState, newNodeIds } = get();
    if (!gameState) return;
    const updatedNewNodeIds = new Set(newNodeIds);
    updatedNewNodeIds.add(node.id);
    set({
      gameState: {
        ...gameState,
        nodes: [...gameState.nodes, node],
      },
      newNodeIds: updatedNewNodeIds,
    });
  },

  addConnection: (connection) => {
    const { gameState, newConnectionIds } = get();
    if (!gameState) return;
    const updatedNewConnectionIds = new Set(newConnectionIds);
    updatedNewConnectionIds.add(connection.id);
    set({
      gameState: {
        ...gameState,
        connections: [...gameState.connections, connection],
      },
      newConnectionIds: updatedNewConnectionIds,
    });
  },

  selectOption: (optionId) => {
    const { gameState } = get();
    if (!gameState) return;

    const updatedNodes = gameState.nodes.map((node) => {
      if (node.type === "option") {
        if (node.id === optionId) {
          return { ...node, selected: true };
        } else if (!node.selected) {
          return { ...node, greyedOut: true };
        }
      }
      return node;
    });

    const updatedConnections = gameState.connections.map((conn) => {
      if (conn.toNodeId === optionId) {
        return { ...conn, active: true };
      }
      return conn;
    });

    set({
      gameState: {
        ...gameState,
        nodes: updatedNodes,
        connections: updatedConnections,
        isWaitingForChoice: false,
        lastSelectedOptionId: optionId,
      },
    });
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  updateGameState: (updates) => {
    const { gameState } = get();
    if (!gameState) return;
    set({ gameState: { ...gameState, ...updates } });
  },

  clearNewFlags: () =>
    set({ newNodeIds: new Set(), newConnectionIds: new Set() }),

  setPendingContent: (events, options) => {
    const { gameState } = get();
    if (!gameState) return;
    set({
      gameState: {
        ...gameState,
        pendingEvents: events,
        pendingOptions: options,
        isWaitingForContinue: events.length > 0,
      },
    });
  },

  showNextEvent: () => {
    const { gameState, newNodeIds, newConnectionIds } = get();
    if (!gameState) return;

    const pendingEvents = gameState.pendingEvents || [];
    const pendingOptions = gameState.pendingOptions || [];

    const result = calculateNextNodes(gameState, pendingEvents, pendingOptions);
    if (!result) return;

    const {
      newNode,
      fromNodeId,
      position,
      hasMoreEvents,
      shouldShowOptions,
      remainingEvents,
      batchId,
      nodeId,
    } = result;

    const updatedNewNodeIds = new Set(newNodeIds);
    updatedNewNodeIds.add(nodeId);
    const updatedConnections = [...gameState.connections];
    const updatedNewConnectionIds = new Set(newConnectionIds);

    if (fromNodeId) {
      const connection = createConnection(fromNodeId, nodeId, true);
      updatedConnections.push(connection);
      updatedNewConnectionIds.add(connection.id);
    }

    set({
      gameState: {
        ...gameState,
        nodes: [...gameState.nodes, newNode],
        connections: updatedConnections,
        pendingEvents: remainingEvents,
        isWaitingForContinue: hasMoreEvents,
        isWaitingForChoice: shouldShowOptions,
        lastSelectedOptionId: nodeId,
        currentEventId: nodeId,
      },
      newNodeIds: updatedNewNodeIds,
      newConnectionIds: updatedNewConnectionIds,
    });

    if (shouldShowOptions) {
      const optionResults = calculateOptionNodes(
        position,
        pendingOptions,
        batchId,
        nodeId
      );

      optionResults.forEach(
        ({ optionNode, optionConnection, optionNodeId, optConnId }, index) => {
          setTimeout(() => {
            const {
              gameState: currentState,
              newNodeIds: currentNewNodeIds,
              newConnectionIds: currentNewConnIds,
            } = get();
            if (!currentState) return;

            const updatedOptNewNodeIds = new Set(currentNewNodeIds);
            updatedOptNewNodeIds.add(optionNodeId);
            const updatedOptNewConnIds = new Set(currentNewConnIds);
            updatedOptNewConnIds.add(optConnId);

            set({
              gameState: {
                ...currentState,
                nodes: [...currentState.nodes, optionNode],
                connections: [...currentState.connections, optionConnection],
                pendingOptions: [],
                lastSelectedOptionId: null,
              },
              newNodeIds: updatedOptNewNodeIds,
              newConnectionIds: updatedOptNewConnIds,
            });
          }, TIMING.optionClickDelay + index * ANIMATION.delay.medium);
        }
      );
    }
  },

  startConflict: (
    conflictEventId,
    enemyName,
    enemyPortrait,
    enemyAttributes
  ) => {
    const { selectedUniverse, character } = get();

    const conflictState = startConflictUtil(
      conflictEventId,
      enemyName,
      enemyPortrait,
      enemyAttributes,
      selectedUniverse,
      character
    );

    if (!conflictState) return;

    set({
      activeConflictState: conflictState,
      isConflictRunning: true,
    });

    const runCycles = async () => {
      let state = get().activeConflictState;
      while (state && !state.isComplete && get().isConflictRunning) {
        await delay(TIMING.conflictCycleDelay);
        const currentState = get().activeConflictState;
        if (!currentState || currentState.isComplete) break;

        const newState = executeCycle(currentState);
        set({ activeConflictState: newState });
        state = newState;
      }

      set({ isConflictRunning: false });
    };

    runCycles();
  },

  runConflictCycle: () => {
    const { activeConflictState } = get();
    if (!activeConflictState || activeConflictState.isComplete) return;

    const newState = executeCycle(activeConflictState);
    set({ activeConflictState: newState });
  },

  endConflict: () => {
    const { activeConflictState, gameState, character } = get();
    if (!activeConflictState || !gameState || !character) return;

    if (activeConflictState.outcome) {
      const playerRole = activeConflictState.roleStates.find(
        (r) => r.roleId === "player"
      );
      if (playerRole) {
        const updatedCharacter = {
          ...character,
          baseAttributes: {
            ...character.baseAttributes,
            ...playerRole.attributes,
          },
        };
        set({
          character: updatedCharacter,
          gameState: {
            ...gameState,
            character: updatedCharacter,
          },
        });
      }
    }

    set({
      activeConflictState: null,
      isConflictRunning: false,
    });
  },

  saveGame: (name: string) => {
    const { selectedUniverse, character, gameState, currentStep } = get();
    if (!selectedUniverse || !character || !gameState) {
      console.error("Cannot save: missing game data");
      return null;
    }

    const savedGame = gamePersistence.saveGame(name, {
      universe: selectedUniverse,
      character,
      gameState,
      currentStep,
    });

    return savedGame;
  },

  loadGame: (gameId: string) => {
    const savedGame = gamePersistence.loadGame(gameId);
    if (!savedGame) {
      console.error("Cannot load: game not found");
      return false;
    }

    const newNodeIds = new Set<string>();
    const newConnectionIds = new Set<string>();

    set({
      selectedUniverse: savedGame.universe,
      character: savedGame.character,
      gameState: savedGame.gameState,
      currentStep: savedGame.currentStep,
      newNodeIds,
      newConnectionIds,
      viewport: { x: 0, y: 0, scale: 1 },
      isGenerating: false,
      activeConflictState: null,
      isConflictRunning: false,
    });

    return true;
  },

  getSavedGames: () => {
    return gamePersistence.getSavedGames();
  },

  deleteGame: (gameId: string) => {
    gamePersistence.deleteGame(gameId);
  },

  autoSave: () => {
    const { selectedUniverse, character, gameState, currentStep } = get();
    if (!selectedUniverse || !character || !gameState) return;

    gamePersistence.autoSave({
      universe: selectedUniverse,
      character,
      gameState,
      currentStep,
    });
  },

  resetGame: () =>
    set({
      currentStep: "menu",
      selectedUniverse: null,
      character: null,
      gameState: null,
      viewport: { x: 0, y: 0, scale: 1 },
      isGenerating: false,
      newNodeIds: new Set(),
      newConnectionIds: new Set(),
      activeConflictState: null,
      isConflictRunning: false,
    }),

  goToMainMenu: () =>
    set({
      currentStep: "menu",
    }),
}));
