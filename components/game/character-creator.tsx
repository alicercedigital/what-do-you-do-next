"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Minus, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameStore } from "@/lib/store/game-store"
import type { PlayerCharacter } from "@/lib/schemas/game-schema"

const TOTAL_POINTS = 10
const MIN_ATTRIBUTE = 1
const MAX_ATTRIBUTE = 5

export function CharacterCreator() {
  const { selectedGenre, createCharacter, startGame, setCurrentStep } = useGameStore()
  const [name, setName] = useState("")
  const [attributes, setAttributes] = useState<Record<string, number>>(() => {
    if (!selectedGenre) return {}
    return Object.fromEntries(selectedGenre.attributes.map((attr) => [attr.id, 1]))
  })

  if (!selectedGenre) return null

  const usedPoints = Object.values(attributes).reduce((sum, val) => sum + val, 0)
  const remainingPoints = TOTAL_POINTS - usedPoints

  const updateAttribute = (attrId: string, delta: number) => {
    const currentValue = attributes[attrId]
    const newValue = currentValue + delta

    if (newValue < MIN_ATTRIBUTE || newValue > MAX_ATTRIBUTE) return
    if (delta > 0 && remainingPoints <= 0) return

    setAttributes((prev) => ({
      ...prev,
      [attrId]: newValue,
    }))
  }

  const handleStartGame = () => {
    if (!name.trim()) return

    const character: PlayerCharacter = {
      id: crypto.randomUUID(),
      name: name.trim(),
      attributes,
      totalPoints: TOTAL_POINTS,
      usedPoints,
    }

    createCharacter(character)
    startGame()
    setName("")
    setAttributes(Object.fromEntries(selectedGenre!.attributes.map((attr) => [attr.id, 1])))
  }

  const canStart = name.trim().length > 0 && usedPoints === TOTAL_POINTS

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => setCurrentStep("genre")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change Genre
        </Button>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Create Your Character</CardTitle>
                <CardDescription>{selectedGenre.name} Adventure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Character Name</label>
              <Input
                placeholder="Enter your hero's name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Distribute Attribute Points</label>
                <span className="text-sm text-muted-foreground">{remainingPoints} points remaining</span>
              </div>
              <Progress value={(usedPoints / TOTAL_POINTS) * 100} className="mb-6 h-2" />

              <div className="space-y-4">
                {selectedGenre.attributes.map((attr, index) => (
                  <motion.div
                    key={attr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{attr.name}</span>
                        <span className="text-2xl font-bold text-primary">{attributes[attr.id]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{attr.summary}</p>
                      <p className="text-xs text-primary/70 mt-1">
                        {attr.benchmarks.find((b) => b.value === attributes[attr.id])?.label}:{" "}
                        {attr.benchmarks.find((b) => b.value === attributes[attr.id])?.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateAttribute(attr.id, -1)}
                        disabled={attributes[attr.id] <= MIN_ATTRIBUTE}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateAttribute(attr.id, 1)}
                        disabled={attributes[attr.id] >= MAX_ATTRIBUTE || remainingPoints <= 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleStartGame} disabled={!canStart}>
              <Sparkles className="h-4 w-4 mr-2" />
              Begin Your Journey
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
