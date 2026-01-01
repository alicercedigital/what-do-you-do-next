"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Sparkles, Skull, Cpu, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { defaultGenres } from "@/lib/data/game-genres"
import { useGameStore } from "@/lib/store/game-store"
import type { GameGenre } from "@/lib/schemas/game-schema"

const genreIcons: Record<string, React.ReactNode> = {
  "dark-fantasy": <Skull className="h-8 w-8" />,
  "cyberpunk-noir": <Cpu className="h-8 w-8" />,
  "cosmic-horror": <Eye className="h-8 w-8" />,
}

export function GenreSelector() {
  const { selectGenre } = useGameStore()

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {defaultGenres.map((genre, index) => (
          <GenreCard key={genre.id} genre={genre} index={index} onSelect={() => selectGenre(genre)} />
        ))}
      </div>
    </div>
  )
}

function GenreCard({
  genre,
  index,
  onSelect,
}: {
  genre: GameGenre
  index: number
  onSelect: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {genreIcons[genre.id] || <Sparkles className="h-8 w-8" />}
            </div>
            <CardTitle className="text-xl">{genre.name}</CardTitle>
          </div>
          <CardDescription className="text-sm leading-relaxed">{genre.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Attributes</p>
              <div className="flex flex-wrap gap-2">
                {genre.attributes.map((attr) => (
                  <span key={attr.id} className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                    {attr.name}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={onSelect} className="w-full">
              Begin Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
