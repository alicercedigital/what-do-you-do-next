"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGameStore } from "@/lib/store/game-store"
import type { SavedGame } from "@/lib/utils/game-persistence"
import { motion } from "framer-motion"
import { Clock, FolderOpen, Globe, Play, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function MainMenu() {
  const { setCurrentStep, loadGame, getSavedGames, deleteGame } = useGameStore()
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])
  const [showLoadMenu, setShowLoadMenu] = useState(false)

  useEffect(() => {
    setSavedGames(getSavedGames())
  }, [getSavedGames])

  const handleStartNewGame = () => {
    setCurrentStep("universe-select")
  }

  const handleLoadGame = (gameId: string) => {
    const success = loadGame(gameId)
    if (success) {
      setShowLoadMenu(false)
    }
  }

  const handleDeleteGame = (gameId: string) => {
    deleteGame(gameId)
    setSavedGames(getSavedGames())
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Story Generator
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Embark on epic adventures through procedurally generated narratives
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-md space-y-4"
      >
        {!showLoadMenu ? (
          <>
            <Button onClick={handleStartNewGame} size="lg" className="w-full h-16 text-lg gap-3">
              <Play className="h-6 w-6" />
              Start New Game
            </Button>

            <Button
              onClick={() => setShowLoadMenu(true)}
              variant="secondary"
              size="lg"
              className="w-full h-16 text-lg gap-3"
              disabled={savedGames.length === 0}
            >
              <FolderOpen className="h-6 w-6" />
              Load Game
              {savedGames.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-sm rounded-full bg-primary/20">{savedGames.length}</span>
              )}
            </Button>

            <Link href="/universes" className="block">
              <Button variant="outline" size="lg" className="w-full h-16 text-lg gap-3 bg-transparent">
                <Globe className="h-6 w-6" />
                Manage Universes
              </Button>
            </Link>
          </>
        ) : (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Load Game</CardTitle>
                  <CardDescription>Select a saved game to continue</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowLoadMenu(false)}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {savedGames.map((game) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors group"
                    >
                      <div className="flex-1 cursor-pointer" onClick={() => handleLoadGame(game.id)}>
                        <p className="font-medium">{game.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{game.character.name}</span>
                          <span>•</span>
                          <span>{game.universe.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(game.timestamp)}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Save?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{game.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGame(game.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
