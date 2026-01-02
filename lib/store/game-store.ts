import { create } from "zustand"
import type {
  GameState,
  PlayerCharacter,
  CanvasNode,
  CanvasConnection,
  GameEvent,
  GameOption,
} from "@/lib/schemas/game-schema"
import type { GameUniverse } from "@/lib/schemas/game-entity-schema"
import { gamePersistence, type SavedGame } from "@/lib/utils/game-persistence"

interface GameStore {
  // Game setup state
  currentStep: "menu" | "universe-select" | "character" | "playing"
  selectedUniverse: GameUniverse | null
  character: PlayerCharacter | null

  // Canvas state
  gameState: GameState | null
  viewport: { x: number; y: number; scale: number }
  isGenerating: boolean
  newNodeIds: Set<string>
  newConnectionIds: Set<string>

  // Actions
  setCurrentStep: (step: "menu" | "universe-select" | "character" | "playing") => void
  selectUniverse: (universe: GameUniverse) => void
  createCharacter: (character: PlayerCharacter) => void
  startGame: () => void

  // Canvas actions
  setViewport: (viewport: { x: number; y: number; scale: number }) => void
  addNode: (node: CanvasNode) => void
  addConnection: (connection: CanvasConnection) => void
  selectOption: (optionId: string) => void
  setIsGenerating: (isGenerating: boolean) => void
  updateGameState: (updates: Partial<GameState>) => void
  clearNewFlags: () => void
  setPendingContent: (events: GameEvent[], options: GameOption[]) => void
  showNextEvent: () => void

  // Save/Load actions
  saveGame: (name: string) => SavedGame | null
  loadGame: (gameId: string) => boolean
  getSavedGames: () => SavedGame[]
  deleteGame: (gameId: string) => void
  autoSave: () => void

  // Reset
  resetGame: () => void
  goToMainMenu: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentStep: "menu", // Start at menu
  selectedUniverse: null,
  character: null,
  gameState: null,
  viewport: { x: 0, y: 0, scale: 1 },
  isGenerating: false,
  newNodeIds: new Set(),
  newConnectionIds: new Set(),

  setCurrentStep: (step) => set({ currentStep: step }),

  selectUniverse: (universe) => set({ selectedUniverse: universe, currentStep: "character" }),

  createCharacter: (character) => set({ character }),

  startGame: () => {
    const { selectedUniverse, character } = get()
    if (!selectedUniverse || !character) return

    const initialState: GameState = {
      id: crypto.randomUUID(),
      universeId: selectedUniverse.id, // Use universeId
      character,
      currentHeroStep: "ordinary-world",
      nodes: [],
      connections: [],
      currentEventId: null,
      isWaitingForChoice: false,
      storyHistory: [],
      pendingEvents: [],
      pendingOptions: [],
      lastSelectedOptionId: null,
      isWaitingForContinue: false,
    }

    set({
      gameState: initialState,
      currentStep: "playing",
      newNodeIds: new Set(),
      newConnectionIds: new Set(),
      viewport: { x: 0, y: 0, scale: 1 },
      isGenerating: false,
    })
  },

  setViewport: (viewport) => set({ viewport }),

  addNode: (node) => {
    const { gameState, newNodeIds } = get()
    if (!gameState) return
    const updatedNewNodeIds = new Set(newNodeIds)
    updatedNewNodeIds.add(node.id)
    set({
      gameState: {
        ...gameState,
        nodes: [...gameState.nodes, node],
      },
      newNodeIds: updatedNewNodeIds,
    })
  },

  addConnection: (connection) => {
    const { gameState, newConnectionIds } = get()
    if (!gameState) return
    const updatedNewConnectionIds = new Set(newConnectionIds)
    updatedNewConnectionIds.add(connection.id)
    set({
      gameState: {
        ...gameState,
        connections: [...gameState.connections, connection],
      },
      newConnectionIds: updatedNewConnectionIds,
    })
  },

  selectOption: (optionId) => {
    const { gameState } = get()
    if (!gameState) return

    const updatedNodes = gameState.nodes.map((node) => {
      if (node.type === "option") {
        if (node.id === optionId) {
          return { ...node, selected: true }
        } else if (!node.selected) {
          return { ...node, greyedOut: true }
        }
      }
      return node
    })

    const updatedConnections = gameState.connections.map((conn) => {
      if (conn.toNodeId === optionId) {
        return { ...conn, active: true }
      }
      return conn
    })

    set({
      gameState: {
        ...gameState,
        nodes: updatedNodes,
        connections: updatedConnections,
        isWaitingForChoice: false,
        lastSelectedOptionId: optionId,
      },
    })
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  updateGameState: (updates) => {
    const { gameState } = get()
    if (!gameState) return
    set({ gameState: { ...gameState, ...updates } })
  },

  clearNewFlags: () => set({ newNodeIds: new Set(), newConnectionIds: new Set() }),

  setPendingContent: (events, options) => {
    const { gameState } = get()
    if (!gameState) return
    set({
      gameState: {
        ...gameState,
        pendingEvents: events,
        pendingOptions: options,
        isWaitingForContinue: events.length > 0,
      },
    })
  },

  showNextEvent: () => {
    const { gameState, newNodeIds, newConnectionIds } = get()
    if (!gameState) return

    const pendingEvents = gameState.pendingEvents || []
    const pendingOptions = gameState.pendingOptions || []

    if (pendingEvents.length === 0) return

    const [nextEvent, ...remainingEvents] = pendingEvents
    const batchId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const nodeId = `event-${batchId}`

    let xOffset = 100
    let yPosition = 200
    let fromNodeId: string | null = null

    const eventNodes = gameState.nodes.filter((n) => n.type === "event")
    const selectedOptionNode = gameState.lastSelectedOptionId
      ? gameState.nodes.find((n) => n.id === gameState.lastSelectedOptionId)
      : null

    if (selectedOptionNode) {
      fromNodeId = selectedOptionNode.id
      xOffset = selectedOptionNode.position.x + 400
      yPosition = selectedOptionNode.position.y
    } else if (eventNodes.length > 0) {
      const lastEventNode = eventNodes.reduce(
        (rightmost, node) => (node.position.x > rightmost.position.x ? node : rightmost),
        eventNodes[0],
      )
      fromNodeId = lastEventNode.id
      xOffset = lastEventNode.position.x + 400
      yPosition = lastEventNode.position.y
    }

    const newNode: CanvasNode = {
      id: nodeId,
      type: "event",
      data: nextEvent,
      position: { x: xOffset, y: yPosition },
    }

    const updatedNewNodeIds = new Set(newNodeIds)
    updatedNewNodeIds.add(nodeId)
    const updatedConnections = [...gameState.connections]
    const updatedNewConnectionIds = new Set(newConnectionIds)

    if (fromNodeId) {
      const connId = `conn-${batchId}`
      updatedConnections.push({
        id: connId,
        fromNodeId,
        toNodeId: nodeId,
        active: true,
      })
      updatedNewConnectionIds.add(connId)
    }

    const hasMoreEvents = remainingEvents.length > 0
    const shouldShowOptions = !hasMoreEvents && pendingOptions.length > 0

    set({
      gameState: {
        ...gameState,
        nodes: [...gameState.nodes, newNode],
        connections: updatedConnections,
        pendingEvents: remainingEvents,
        isWaitingForContinue: hasMoreEvents,
        isWaitingForChoice: shouldShowOptions,
        lastSelectedOptionId: null,
        currentEventId: nodeId,
      },
      newNodeIds: updatedNewNodeIds,
      newConnectionIds: updatedNewConnectionIds,
    })

    if (shouldShowOptions) {
      const lastEventNodeId = nodeId
      const eventY = yPosition
      const optionSpacing = 200
      const totalHeight = (pendingOptions.length - 1) * optionSpacing
      const optionYStart = eventY - totalHeight / 2
      const optionX = xOffset + 400

      pendingOptions.forEach((option, index) => {
        setTimeout(
          () => {
            const optionNodeId = `option-${batchId}-${index}`
            const optConnId = `conn-option-${batchId}-${index}`

            const {
              gameState: currentState,
              newNodeIds: currentNewNodeIds,
              newConnectionIds: currentNewConnIds,
            } = get()
            if (!currentState) return

            const updatedOptNewNodeIds = new Set(currentNewNodeIds)
            updatedOptNewNodeIds.add(optionNodeId)
            const updatedOptNewConnIds = new Set(currentNewConnIds)
            updatedOptNewConnIds.add(optConnId)

            const optionY = optionYStart + index * optionSpacing

            set({
              gameState: {
                ...currentState,
                nodes: [
                  ...currentState.nodes,
                  {
                    id: optionNodeId,
                    type: "option",
                    data: option,
                    position: { x: optionX, y: optionY },
                  },
                ],
                connections: [
                  ...currentState.connections,
                  {
                    id: optConnId,
                    fromNodeId: lastEventNodeId,
                    toNodeId: optionNodeId,
                    active: false,
                  },
                ],
                pendingOptions: [],
              },
              newNodeIds: updatedOptNewNodeIds,
              newConnectionIds: updatedOptNewConnIds,
            })
          },
          300 + index * 200,
        )
      })
    }
  },

  saveGame: (name: string) => {
    const { selectedUniverse, character, gameState, currentStep } = get()
    if (!selectedUniverse || !character || !gameState) {
      console.error("Cannot save: missing game data")
      return null
    }

    const savedGame = gamePersistence.saveGame(name, {
      universe: selectedUniverse, // Use universe
      character,
      gameState,
      currentStep,
    })

    return savedGame
  },

  loadGame: (gameId: string) => {
    const savedGame = gamePersistence.loadGame(gameId)
    if (!savedGame) {
      console.error("Cannot load: game not found")
      return false
    }

    const newNodeIds = new Set<string>()
    const newConnectionIds = new Set<string>()

    set({
      selectedUniverse: savedGame.universe, // Use universe
      character: savedGame.character,
      gameState: savedGame.gameState,
      currentStep: savedGame.currentStep,
      newNodeIds,
      newConnectionIds,
      viewport: { x: 0, y: 0, scale: 1 },
      isGenerating: false,
    })

    return true
  },

  getSavedGames: () => {
    return gamePersistence.getSavedGames()
  },

  deleteGame: (gameId: string) => {
    gamePersistence.deleteGame(gameId)
  },

  autoSave: () => {
    const { selectedUniverse, character, gameState, currentStep } = get()
    if (!selectedUniverse || !character || !gameState) return

    gamePersistence.autoSave({
      universe: selectedUniverse, // Use universe
      character,
      gameState,
      currentStep,
    })
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
    }),

  goToMainMenu: () =>
    set({
      currentStep: "menu",
    }),
}))
