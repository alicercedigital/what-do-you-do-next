import { create } from "zustand"
import type {
  GameState,
  GameGenre,
  PlayerCharacter,
  CanvasNode,
  CanvasConnection,
  GameEvent,
  GameOption,
} from "@/lib/schemas/game-schema"

interface GameStore {
  // Game setup state
  currentStep: "genre" | "character" | "playing"
  selectedGenre: GameGenre | null
  character: PlayerCharacter | null

  // Canvas state
  gameState: GameState | null
  viewport: { x: number; y: number; scale: number }
  isGenerating: boolean
  newNodeIds: Set<string>
  newConnectionIds: Set<string>

  // Actions
  setCurrentStep: (step: "genre" | "character" | "playing") => void
  selectGenre: (genre: GameGenre) => void
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

  // Reset
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentStep: "genre",
  selectedGenre: null,
  character: null,
  gameState: null,
  viewport: { x: 0, y: 0, scale: 1 },
  isGenerating: false,
  newNodeIds: new Set(),
  newConnectionIds: new Set(),

  setCurrentStep: (step) => set({ currentStep: step }),

  selectGenre: (genre) => set({ selectedGenre: genre, currentStep: "character" }),

  createCharacter: (character) => set({ character }),

  startGame: () => {
    const { selectedGenre, character } = get()
    if (!selectedGenre || !character) return

    const initialState: GameState = {
      id: crypto.randomUUID(),
      genreId: selectedGenre.id,
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
      viewport: { x: 0, y: 0, scale: 1 }, // Reset viewport too
      isGenerating: false, // Reset generating state
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
        lastSelectedOptionId: optionId, // Track which option was selected
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

    if (gameState.lastSelectedOptionId) {
      // If connecting from an option, position at the same Y level as the option
      fromNodeId = gameState.lastSelectedOptionId
      const fromNode = gameState.nodes.find((n) => n.id === fromNodeId)
      if (fromNode) {
        xOffset = fromNode.position.x + 400
        yPosition = fromNode.position.y // Use option's exact Y position
        console.log("[v0] Positioning from option:", fromNodeId, "at y:", yPosition)
      }
    } else if (eventNodes.length > 0) {
      // If connecting from the last event, keep the same Y
      const lastEventNode = eventNodes[eventNodes.length - 1]
      fromNodeId = lastEventNode.id
      xOffset = lastEventNode.position.x + 400
      yPosition = lastEventNode.position.y
      console.log("[v0] Positioning from event:", fromNodeId, "at y:", yPosition)
    }

    console.log("[v0] New event position: x:", xOffset, "y:", yPosition)

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

    // Check if this was the last event - if so, show options next
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
        lastSelectedOptionId: shouldShowOptions ? null : gameState.lastSelectedOptionId,
        currentEventId: nodeId,
      },
      newNodeIds: updatedNewNodeIds,
      newConnectionIds: updatedNewConnectionIds,
    })

    // If we should show options, add them after a delay
    if (shouldShowOptions) {
      const lastEventNodeId = nodeId
      const eventY = yPosition
      const optionSpacing = 160
      const totalHeight = (pendingOptions.length - 1) * optionSpacing
      const optionYStart = eventY - totalHeight / 2

      console.log("[v0] Options will be placed starting at Y:", optionYStart, "centered around:", eventY)

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
            console.log("[v0] Adding option", optionNodeId, "at y:", optionY)

            set({
              gameState: {
                ...currentState,
                nodes: [
                  ...currentState.nodes,
                  {
                    id: optionNodeId,
                    type: "option",
                    data: option,
                    position: { x: xOffset + 400, y: optionY },
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
                lastSelectedOptionId: null,
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

  resetGame: () =>
    set({
      currentStep: "genre",
      selectedGenre: null,
      character: null,
      gameState: null,
      viewport: { x: 0, y: 0, scale: 1 },
      isGenerating: false,
      newNodeIds: new Set(),
      newConnectionIds: new Set(),
    }),
}))
