"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/store/game-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, FolderOpen, Trash2 } from "lucide-react"
import type { SavedGame } from "@/lib/utils/game-persistence"

export function SaveLoadMenu() {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])

  const { saveGame, loadGame, getSavedGames, deleteGame } = useGameStore()

  const handleSave = () => {
    if (!saveName.trim()) return

    const saved = saveGame(saveName.trim())
    if (saved) {
      setSaveName("")
      setSaveDialogOpen(false)
    }
  }

  const handleOpenLoad = () => {
    setSavedGames(getSavedGames())
    setLoadDialogOpen(true)
  }

  const handleLoad = (gameId: string) => {
    const success = loadGame(gameId)
    if (success) {
      setLoadDialogOpen(false)
    }
  }

  const handleDelete = (gameId: string) => {
    deleteGame(gameId)
    setSavedGames(getSavedGames())
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="flex gap-2">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Game
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Game</DialogTitle>
            <DialogDescription>Enter a name for your saved game</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-name">Save Name</Label>
              <Input
                id="save-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My Epic Adventure"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!saveName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleOpenLoad}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Game
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Game</DialogTitle>
            <DialogDescription>Select a saved game to continue your adventure</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {savedGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No saved games found</div>
            ) : (
              <div className="space-y-2">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{game.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {game.genre.name} • {game.character.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{formatDate(game.timestamp)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDelete(game.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleLoad(game.id)}>
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
