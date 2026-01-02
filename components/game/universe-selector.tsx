"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Globe, Users, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/store/game-store"
import { universePersistence } from "@/lib/utils/universe-persistence"
import type { GameUniverse } from "@/lib/schemas/game-entity-schema"

export function UniverseSelector() {
  const { selectUniverse, setCurrentStep } = useGameStore()
  const [universes, setUniverses] = useState<GameUniverse[]>([])

  useEffect(() => {
    setUniverses(universePersistence.getAllUniverses())
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
        <Button variant="ghost" className="mb-6" onClick={() => setCurrentStep("menu")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Select Universe</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Choose a universe to begin your adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universes.map((universe, index) => (
            <UniverseCard
              key={universe.id}
              universe={universe}
              index={index}
              onSelect={() => selectUniverse(universe)}
            />
          ))}
        </div>

        {universes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No universes available.</p>
            <Button variant="outline" onClick={() => (window.location.href = "/universes")}>
              Create Universe
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function UniverseCard({
  universe,
  index,
  onSelect,
}: {
  universe: GameUniverse
  index: number
  onSelect: () => void
}) {
  const isCustom = universePersistence.isCustomUniverse(universe.id)
  const canStart = universe.charactersAttributes.length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full flex flex-col">
        {universe.thumbnailUrl && (
          <div className="relative h-32 overflow-hidden rounded-t-lg">
            <img
              src={universe.thumbnailUrl || "/placeholder.svg"}
              alt={universe.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{universe.name}</CardTitle>
            {isCustom && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Custom</span>}
          </div>
          <CardDescription className="text-sm line-clamp-2">{universe.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{universe.characters.length} characters</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{universe.locations.length} locations</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Attributes</p>
              <div className="flex flex-wrap gap-1.5">
                {universe.charactersAttributes.length > 0 ? (
                  universe.charactersAttributes.slice(0, 4).map((attr) => (
                    <span
                      key={attr.id}
                      className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground"
                    >
                      {attr.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No attributes defined</span>
                )}
                {universe.charactersAttributes.length > 4 && (
                  <span className="px-2 py-0.5 text-xs rounded-md bg-secondary/50 text-muted-foreground">
                    +{universe.charactersAttributes.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button onClick={onSelect} className="w-full mt-4" disabled={!canStart}>
            {canStart ? "Select Universe" : "Add Attributes First"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
