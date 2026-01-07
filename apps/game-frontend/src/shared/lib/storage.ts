import type { Universe, GameState } from "@wdydn/shared"

const UNIVERSES_KEY = "rpg-universes-v2"
const GAMES_KEY = "rpg-games-v2"

// ============================================
// UNIVERSE STORAGE
// ============================================

export function getUniverses(): Universe[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(UNIVERSES_KEY)
  return data ? JSON.parse(data) : []
}

export function getUniverse(id: string): Universe | null {
  return getUniverses().find((u) => u.id === id) ?? null
}

export function saveUniverse(universe: Universe): void {
  const universes = getUniverses()
  const index = universes.findIndex((u) => u.id === universe.id)

  if (index >= 0) {
    universes[index] = universe
  } else {
    universes.push(universe)
  }

  localStorage.setItem(UNIVERSES_KEY, JSON.stringify(universes))
}

export function deleteUniverse(id: string): void {
  const universes = getUniverses().filter((u) => u.id !== id)
  localStorage.setItem(UNIVERSES_KEY, JSON.stringify(universes))
}

export function duplicateUniverse(id: string): Universe | null {
  const original = getUniverse(id)
  if (!original) return null

  const copy: Universe = {
    ...structuredClone(original),
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
  }

  saveUniverse(copy)
  return copy
}

// ============================================
// GAME STATE STORAGE
// ============================================

export function getGames(): GameState[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(GAMES_KEY)
  return data ? JSON.parse(data) : []
}

export function getGame(id: string): GameState | null {
  return getGames().find((g) => g.id === id) ?? null
}

export function saveGame(game: GameState): void {
  const games = getGames()
  const index = games.findIndex((g) => g.id === game.id)

  if (index >= 0) {
    games[index] = game
  } else {
    games.push(game)
  }

  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

export function deleteGame(id: string): void {
  const games = getGames().filter((g) => g.id !== id)
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

export function getGamesByUniverse(universeId: string): GameState[] {
  return getGames().filter((g) => g.universeId === universeId)
}

// ============================================
// EXPORT / IMPORT
// ============================================

export function exportUniverse(universe: Universe): string {
  return JSON.stringify(universe, null, 2)
}

export function importUniverse(json: string): Universe {
  const universe = JSON.parse(json) as Universe
  // Ensure new ID to avoid conflicts
  universe.id = crypto.randomUUID()
  saveUniverse(universe)
  return universe
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      universes: getUniverses(),
      games: getGames(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}

export function importAllData(json: string): void {
  const data = JSON.parse(json)
  if (data.universes) {
    localStorage.setItem(UNIVERSES_KEY, JSON.stringify(data.universes))
  }
  if (data.games) {
    localStorage.setItem(GAMES_KEY, JSON.stringify(data.games))
  }
}
