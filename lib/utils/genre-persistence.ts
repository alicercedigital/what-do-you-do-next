import type { GameGenre } from "@/lib/schemas/game-schema"
import { defaultGenres } from "@/lib/data/game-genres"

const STORAGE_KEY = "game-story-generator-custom-genres"

export const genrePersistence = {
  // Get all genres (default + custom)
  getAllGenres: (): GameGenre[] => {
    try {
      const customGenresJson = localStorage.getItem(STORAGE_KEY)
      const customGenres: GameGenre[] = customGenresJson ? JSON.parse(customGenresJson) : []
      return [...defaultGenres, ...customGenres]
    } catch (error) {
      console.error("Error loading custom genres:", error)
      return defaultGenres
    }
  },

  // Get only custom genres
  getCustomGenres: (): GameGenre[] => {
    try {
      const customGenresJson = localStorage.getItem(STORAGE_KEY)
      return customGenresJson ? JSON.parse(customGenresJson) : []
    } catch (error) {
      console.error("Error loading custom genres:", error)
      return []
    }
  },

  // Save a new custom genre
  saveGenre: (genre: GameGenre): void => {
    const customGenres = genrePersistence.getCustomGenres()
    const existingIndex = customGenres.findIndex((g) => g.id === genre.id)

    if (existingIndex >= 0) {
      // Update existing
      customGenres[existingIndex] = genre
    } else {
      // Add new
      customGenres.push(genre)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customGenres))
  },

  // Delete a custom genre
  deleteGenre: (genreId: string): boolean => {
    // Prevent deletion of default genres
    if (defaultGenres.some((g) => g.id === genreId)) {
      console.error("Cannot delete default genre")
      return false
    }

    const customGenres = genrePersistence.getCustomGenres()
    const filtered = customGenres.filter((g) => g.id !== genreId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // Check if a genre is custom (not default)
  isCustomGenre: (genreId: string): boolean => {
    return !defaultGenres.some((g) => g.id === genreId)
  },
}
