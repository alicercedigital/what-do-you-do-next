"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getGames, getUniverse, deleteGame } from "@/core/storage"
import { STARTER_UNIVERSES } from "@/data/starter-universes"
import { useGameStore } from "./store"
import type { GameState, Universe } from "@/core/types"
import {
  Play,
  Globe,
  Trash2,
  BookOpen,
  Swords,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SavedGameInfo {
  game: GameState
  universe: Universe
}

export function MainMenu() {
  const [savedGames, setSavedGames] = useState<SavedGameInfo[]>([])
  const { loadGame } = useGameStore()

  useEffect(() => {
    loadSavedGames()
  }, [])

  const loadSavedGames = () => {
    const games = getGames()
    const gamesWithUniverses: SavedGameInfo[] = []

    for (const game of games) {
      // Try to find universe in storage first, then in starters
      let universe = getUniverse(game.universeId)
      if (!universe) {
        universe = STARTER_UNIVERSES.find((u) => u.id === game.universeId) ?? null
      }
      if (universe) {
        gamesWithUniverses.push({ game, universe })
      }
    }

    setSavedGames(gamesWithUniverses)
  }

  const handleContinueGame = (info: SavedGameInfo) => {
    loadGame(info.game, info.universe)
  }

  const handleDeleteGame = (gameId: string) => {
    deleteGame(gameId)
    loadSavedGames()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">What Do You Do Next?</h1>
          <p className="text-muted-foreground">A story-driven RPG adventure</p>
        </div>

        {/* Main Actions */}
        <div className="space-y-3">
          <Link href="/play" className="block">
            <Button className="w-full h-14 text-lg gap-3" size="lg">
              <Play className="h-5 w-5" />
              New Game
            </Button>
          </Link>

          <Link href="/universes" className="block">
            <Button variant="outline" className="w-full h-12 gap-3">
              <Globe className="h-5 w-5" />
              Universe Manager
            </Button>
          </Link>
        </div>

        {/* Saved Games */}
        {savedGames.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Continue Playing</h2>
            {savedGames.map((info) => (
              <Card key={info.game.id} className="overflow-hidden">
                <div className="flex items-stretch">
                  <Link
                    href="/play"
                    onClick={() => handleContinueGame(info)}
                    className="flex-1 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Swords className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {info.game.character.name}
                          </CardTitle>
                          <CardDescription className="text-xs truncate">
                            {info.universe.name} - Level {info.game.character.level}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Link>
                  <div className="flex items-center px-2 border-l">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete saved game?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {info.game.character.name}'s progress in {info.universe.name}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGame(info.game.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Create universes, build characters, and forge your own story</p>
        </div>
      </div>
    </div>
  )
}
