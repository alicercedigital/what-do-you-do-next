"use client"

import { useGameStore } from "@/lib/store/game-store"
import { GenreSelector } from "./genre-selector"
import { CharacterCreator } from "./character-creator"
import { GameCanvas } from "./game-canvas"

export function GameContainer() {
  const { currentStep } = useGameStore()

  switch (currentStep) {
    case "genre":
      return <GenreSelector />
    case "character":
      return <CharacterCreator />
    case "playing":
      return <GameCanvas />
    default:
      return <GenreSelector />
  }
}
