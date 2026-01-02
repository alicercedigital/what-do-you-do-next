"use client"

import { useGameStore } from "@/lib/store/game-store"
import { MainMenu } from "./main-menu"
import { UniverseSelector } from "./universe-selector"
import { CharacterCreator } from "./character-creator"
import { GameCanvas } from "./game-canvas"

export function GameContainer() {
  const { currentStep } = useGameStore()

  switch (currentStep) {
    case "menu":
      return <MainMenu />
    case "universe-select":
      return <UniverseSelector />
    case "character":
      return <CharacterCreator />
    case "playing":
      return <GameCanvas />
    default:
      return <MainMenu />
  }
}
