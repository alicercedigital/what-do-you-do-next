import { defaultUniverses } from "@/lib/data/default-universes"
import type { GameUniverse } from "@/lib/schemas/game-entity-schema"

const STORAGE_KEY = "game-story-generator-universes"

export const universePersistence = {
  // Get all universes (default + custom)
  getAllUniverses: (): GameUniverse[] => {
    try {
      const customUniversesJson = localStorage.getItem(STORAGE_KEY)
      const customUniverses: GameUniverse[] = customUniversesJson ? JSON.parse(customUniversesJson) : []
      return [...defaultUniverses, ...customUniverses]
    } catch (error) {
      console.error("Error loading universes:", error)
      return defaultUniverses
    }
  },

  // Get only custom universes
  getCustomUniverses: (): GameUniverse[] => {
    try {
      const customUniversesJson = localStorage.getItem(STORAGE_KEY)
      return customUniversesJson ? JSON.parse(customUniversesJson) : []
    } catch (error) {
      console.error("Error loading custom universes:", error)
      return []
    }
  },

  // Get a specific universe by ID
  getUniverseById: (id: string): GameUniverse | null => {
    const allUniverses = universePersistence.getAllUniverses()
    return allUniverses.find((u) => u.id === id) || null
  },

  // Save a new or update existing universe
  saveUniverse: (universe: GameUniverse): void => {
    const customUniverses = universePersistence.getCustomUniverses()
    const existingIndex = customUniverses.findIndex((u) => u.id === universe.id)

    if (existingIndex >= 0) {
      customUniverses[existingIndex] = universe
    } else {
      customUniverses.push(universe)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customUniverses))
  },

  // Delete a custom universe
  deleteUniverse: (universeId: string): boolean => {
    if (defaultUniverses.some((u) => u.id === universeId)) {
      console.error("Cannot delete default universe")
      return false
    }

    const customUniverses = universePersistence.getCustomUniverses()
    const filtered = customUniverses.filter((u) => u.id !== universeId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // Check if a universe is custom (not default)
  isCustomUniverse: (universeId: string): boolean => {
    return !defaultUniverses.some((u) => u.id === universeId)
  },
}
