import type { GameState, PlayerCharacter } from "@/lib/schemas/game-schema"
import type { GameUniverse } from "@/lib/schemas/game-entity-schema"

const STORAGE_KEYS = {
  SAVED_GAMES: "game-story-generator-saved-games",
  CURRENT_GAME: "game-story-generator-current-game",
  AUTO_SAVE: "game-story-generator-auto-save",
}

export interface SavedGame {
  id: string
  name: string
  timestamp: number
  universe: GameUniverse
  character: PlayerCharacter
  gameState: GameState
  currentStep: "menu" | "universe-select" | "character" | "playing"
}

export const gamePersistence = {
  // Save current game
  saveGame: (name: string, data: Omit<SavedGame, "id" | "name" | "timestamp">): SavedGame => {
    const savedGame: SavedGame = {
      id: crypto.randomUUID(),
      name,
      timestamp: Date.now(),
      ...data,
    }

    const savedGames = gamePersistence.getSavedGames()
    savedGames.push(savedGame)
    localStorage.setItem(STORAGE_KEYS.SAVED_GAMES, JSON.stringify(savedGames))

    return savedGame
  },

  // Get all saved games
  getSavedGames: (): SavedGame[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_GAMES)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading saved games:", error)
      return []
    }
  },

  // Load a specific game
  loadGame: (gameId: string): SavedGame | null => {
    const savedGames = gamePersistence.getSavedGames()
    return savedGames.find((game) => game.id === gameId) || null
  },

  // Delete a saved game
  deleteGame: (gameId: string): void => {
    const savedGames = gamePersistence.getSavedGames()
    const filtered = savedGames.filter((game) => game.id !== gameId)
    localStorage.setItem(STORAGE_KEYS.SAVED_GAMES, JSON.stringify(filtered))
  },

  // Auto-save current game
  autoSave: (data: Omit<SavedGame, "id" | "name" | "timestamp">): void => {
    const autoSave: SavedGame = {
      id: "auto-save",
      name: "Auto Save",
      timestamp: Date.now(),
      ...data,
    }
    localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(autoSave))
  },

  // Get auto-save
  getAutoSave: (): SavedGame | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error("Error loading auto-save:", error)
      return null
    }
  },

  // Clear all saved games
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.SAVED_GAMES)
    localStorage.removeItem(STORAGE_KEYS.AUTO_SAVE)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME)
  },
}
