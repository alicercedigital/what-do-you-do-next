"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Skull, Cpu, Eye, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useGameStore } from "@/lib/store/game-store"
import { genrePersistence } from "@/lib/utils/genre-persistence"
import { GenreManagement } from "./genre-management"
import type { GameGenre } from "@/lib/schemas/game-schema"

const genreIcons: Record<string, React.ReactNode> = {
  "dark-fantasy": <Skull className="h-8 w-8" />,
  "cyberpunk-noir": <Cpu className="h-8 w-8" />,
  "cosmic-horror": <Eye className="h-8 w-8" />,
}

export function GenreSelector() {
  const { selectGenre } = useGameStore()
  const [genres, setGenres] = useState<GameGenre[]>([])
  const [managementOpen, setManagementOpen] = useState(false)

  useEffect(() => {
    loadGenres()
  }, [managementOpen])

  const loadGenres = () => {
    setGenres(genrePersistence.getAllGenres())
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Journey</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md">
          Select a genre to begin your epic adventure following the Hero's Journey
        </p>
      </motion.div>

      <div className="flex items-center gap-2 mb-6">
        <Dialog open={managementOpen} onOpenChange={setManagementOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Genres
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <GenreManagement />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {genres.map((genre, index) => (
          <GenreCard key={genre.id} genre={genre} index={index} onSelect={() => selectGenre(genre)} />
        ))}
      </div>
    </div>
  )
}

function GenreCard({ genre, index, onSelect }: { genre: GameGenre; index: number; onSelect: () => void }) {
  const isCustom = genrePersistence.isCustomGenre(genre.id)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {genreIcons[genre.id] || <Sparkles className="h-8 w-8" />}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{genre.name}</CardTitle>
              {isCustom && <span className="text-xs text-muted-foreground">Custom Genre</span>}
            </div>
          </div>
          <CardDescription className="text-sm leading-relaxed">{genre.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Attributes</p>
              <div className="flex flex-wrap gap-2">
                {genre.attributes.length > 0 ? (
                  genre.attributes.map((attr) => (
                    <span key={attr.id} className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                      {attr.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No attributes</span>
                )}
              </div>
            </div>
            <Button onClick={onSelect} className="w-full" disabled={genre.attributes.length === 0}>
              {genre.attributes.length === 0 ? "Add Attributes First" : "Begin Journey"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
