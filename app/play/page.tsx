"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/game/store"
import { Game } from "@/game/game"
import { CharacterCreator } from "@/game/character-creator"
import { getUniverses } from "@/core/storage"
import { STARTER_UNIVERSES } from "@/data/starter-universes"
import type { Universe } from "@/core/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Globe } from "lucide-react"
import Link from "next/link"

export default function PlayPage() {
  const { phase, universe, selectUniverse, startGame, reset, setPhase } = useGameStore()
  const [universes, setUniverses] = useState<Universe[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // On first mount, if we're not already in a game (play phase with universe),
    // reset to the select phase to show universe selection
    if (!initialized) {
      if (phase !== "play" || !universe) {
        setPhase("select")
      }
      setInitialized(true)
    }
  }, [initialized, phase, universe, setPhase])

  useEffect(() => {
    // Load universes from storage + starters
    const stored = getUniverses()
    const all = [...STARTER_UNIVERSES]

    // Add stored universes that aren't duplicates of starters
    for (const u of stored) {
      if (!all.find((s) => s.id === u.id)) {
        all.push(u)
      }
    }

    setUniverses(all)
  }, [])

  // Already in a game - show the game
  if (phase === "play" && universe) {
    return <Game />
  }

  // Creating character
  if (phase === "create" && universe) {
    return <CharacterCreator universe={universe} onComplete={startGame} onBack={() => reset()} />
  }

  // Universe selection (menu or select phase)
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Choose Your Universe</h1>
            <p className="text-muted-foreground">Select a world to begin your adventure</p>
          </div>
        </div>

        <div className="grid gap-4">
          {universes.map((u) => (
            <Card
              key={u.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => selectUniverse(u)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      {u.name}
                    </CardTitle>
                    <CardDescription>{u.theme}</CardDescription>
                  </div>
                  {STARTER_UNIVERSES.find((s) => s.id === u.id) && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Starter
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{u.description}</p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{u.stats.length} stats</span>
                  <span>{u.items.length} items</span>
                  <span>{u.challenges.length} challenges</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {universes.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No universes available</p>
                <Link href="/universes">
                  <Button variant="link">Create one in the editor</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
