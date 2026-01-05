"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Minus, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameStore } from "@/lib/store/game-store"
import type { PlayerCharacter } from "@/lib/schemas/game-schema"
import { calculateDerivedAttributes } from "@/lib/utils/formula-parser"
import { getIconComponent } from "@/components/universe/icon-picker"
import { cn } from "@/lib/utils"

export function CharacterCreator() {
  const { selectedUniverse, createCharacter, startGame, setCurrentStep } = useGameStore()
  const [name, setName] = useState("")

  const totalPoints = selectedUniverse?.attributeConfig?.startingPoints ?? 20

  const distributableAttributes = selectedUniverse?.attributes?.filter((a) => a.category === "distributable") || []

  const derivedAttributes = selectedUniverse?.attributes?.filter((a) => a.category === "derived") || []

  const [baseAttributes, setBaseAttributes] = useState<Record<string, number>>(() => {
    if (!distributableAttributes.length) return {}
    return Object.fromEntries(distributableAttributes.map((attr) => [attr.id, attr.distributableConfig?.minValue ?? 1]))
  })

  const getMinValue = (attrId: string) => {
    const attr = distributableAttributes.find((a) => a.id === attrId)
    return attr?.distributableConfig?.minValue ?? 1
  }

  const getMaxValue = (attrId: string) => {
    const attr = distributableAttributes.find((a) => a.id === attrId)
    return attr?.distributableConfig?.maxValue ?? 10
  }

  const usedPoints = Object.values(baseAttributes).reduce((sum, val) => sum + val, 0)
  const remainingPoints = totalPoints - usedPoints

  const calculatedDerived = useMemo(() => {
    return calculateDerivedAttributes(selectedUniverse.attributes || [], baseAttributes, {})
  }, [selectedUniverse.attributes, baseAttributes])

  const updateAttribute = (attrId: string, delta: number) => {
    const currentValue = baseAttributes[attrId]
    const newValue = currentValue + delta
    const minValue = getMinValue(attrId)
    const maxValue = getMaxValue(attrId)

    if (newValue < minValue || newValue > maxValue) return
    if (delta > 0 && remainingPoints <= 0) return

    setBaseAttributes((prev) => ({
      ...prev,
      [attrId]: newValue,
    }))
  }

  const handleStartGame = () => {
    if (!name.trim()) return

    const character: PlayerCharacter = {
      id: crypto.randomUUID(),
      name: name.trim(),
      baseAttributes,
      cachedDerivedAttributes: calculatedDerived,
      equipment: {},
      inventory: [],
      level: 1,
      totalPoints,
      usedPoints,
      role: "protagonist",
      portraits: {},
      type: "character",
      description: "",
    }

    createCharacter(character)
    startGame()
    setName("")
    setBaseAttributes(
      Object.fromEntries(distributableAttributes.map((attr) => [attr.id, attr.distributableConfig?.minValue ?? 1])),
    )
  }

  const canStart = name.trim().length > 0 && usedPoints === totalPoints

  if (!selectedUniverse) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => setCurrentStep("universe-select")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change Universe
        </Button>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Create Your Character</CardTitle>
                <CardDescription>{selectedUniverse.name} Adventure</CardDescription>
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

            {/* Distributable Attributes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Distribute Attribute Points</label>
                <span className="text-sm text-muted-foreground">{remainingPoints} points remaining</span>
              </div>
              <Progress value={(usedPoints / totalPoints) * 100} className="mb-6 h-2" />

              <div className="space-y-4">
                {distributableAttributes.map((attr, index) => {
                  const Icon = getIconComponent(attr.display?.icon || "circle")
                  const minValue = getMinValue(attr.id)
                  const maxValue = getMaxValue(attr.id)
                  const currentBenchmark = attr.distributableConfig?.benchmarks?.find(
                    (b) => b.value === baseAttributes[attr.id],
                  )

                  return (
                    <motion.div
                      key={attr.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                    >
                      <div className={cn("p-2 rounded-lg bg-background", attr.display?.iconColor || "text-foreground")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {attr.name}
                            {attr.shortName && (
                              <span className="text-muted-foreground text-sm ml-1">({attr.shortName})</span>
                            )}
                          </span>
                          <span className="text-2xl font-bold text-primary">{baseAttributes[attr.id]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{attr.summary}</p>
                        {currentBenchmark && (
                          <p className="text-xs text-primary/70 mt-1">
                            {currentBenchmark.label}: {currentBenchmark.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateAttribute(attr.id, -1)}
                          disabled={baseAttributes[attr.id] <= minValue}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateAttribute(attr.id, 1)}
                          disabled={baseAttributes[attr.id] >= maxValue || remainingPoints <= 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Derived Attributes Preview */}
            {derivedAttributes.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-4 block">Derived Stats</label>
                <div className="grid grid-cols-2 gap-3">
                  {derivedAttributes.map((attr) => {
                    const Icon = getIconComponent(attr.display?.icon || "circle")
                    const value = calculatedDerived[attr.id] ?? 0

                    return (
                      <div key={attr.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                        <div
                          className={cn("p-1.5 rounded bg-background", attr.display?.iconColor || "text-foreground")}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{attr.shortName || attr.name}</span>
                            <span className="font-bold text-primary">{Math.round(value)}</span>
                          </div>
                          {attr.display?.displayType === "bar" && (
                            <div
                              className={cn(
                                "h-1.5 rounded-full mt-1",
                                attr.display.barBackgroundColor || "bg-secondary",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  attr.display.barColor || "bg-primary",
                                )}
                                style={{
                                  width: `${Math.min(100, (value / (attr.derivedConfig?.maxValue || 100)) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
