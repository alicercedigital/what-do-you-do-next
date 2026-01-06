"use client"

import { useState, useMemo } from "react"
import type { Universe, Character, Stat } from "@/core/types"
import { resolveStats } from "@/core/calc"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Minus, Plus, Sparkles, ArrowLeft } from "lucide-react"

interface Props {
  universe: Universe
  onComplete: (character: Character) => void
  onBack: () => void
}

export function CharacterCreator({ universe, onComplete, onBack }: Props) {
  const [name, setName] = useState("")
  const [baseStats, setBaseStats] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    for (const stat of universe.stats.filter((s) => s.type === "core")) {
      initial[stat.id] = stat.range?.min ?? 0
    }
    return initial
  })

  const coreStats = universe.stats.filter((s) => s.type === "core" && s.display.showInCreator !== false)
  const computedStats = universe.stats.filter((s) => s.type === "computed" && s.display.showInCreator !== false)

  const usedPoints = useMemo(() => {
    return Object.entries(baseStats).reduce((sum, [statId, value]) => {
      const stat = universe.stats.find((s) => s.id === statId)
      const min = stat?.range?.min ?? 0
      return sum + (value - min)
    }, 0)
  }, [baseStats, universe.stats])

  const remainingPoints = universe.config.startingPoints - usedPoints

  const resolved = useMemo(() => {
    return resolveStats(universe.stats, baseStats)
  }, [universe.stats, baseStats])

  const adjustStat = (statId: string, delta: number) => {
    const stat = universe.stats.find((s) => s.id === statId)
    if (!stat) return

    const current = baseStats[statId] ?? stat.range?.min ?? 0
    const min = stat.range?.min ?? 0
    const max = stat.range?.max ?? 100

    const newValue = Math.max(min, Math.min(max, current + delta))

    // Check if we have points available when increasing
    if (delta > 0 && remainingPoints < delta) return

    setBaseStats((prev) => ({ ...prev, [statId]: newValue }))
  }

  const canSubmit = name.trim().length > 0 && remainingPoints >= 0

  const handleSubmit = () => {
    if (!canSubmit) return

    const character: Character = {
      id: crypto.randomUUID(),
      name: name.trim(),
      level: 1,
      baseStats,
      equipment: {},
      inventory: [],
      points: {
        total: universe.config.startingPoints,
        used: usedPoints,
      },
    }

    onComplete(character)
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Create Your Character</CardTitle>
              <CardDescription>for {universe.name}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Character Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name..."
              autoFocus
            />
          </div>

          {/* Points Remaining */}
          <div
            className={cn(
              "p-3 rounded-lg border",
              remainingPoints < 0 ? "border-red-500 bg-red-500/10" : "bg-muted/50",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Points Remaining</span>
              <span className={cn("font-bold text-lg", remainingPoints < 0 && "text-red-500")}>{remainingPoints}</span>
            </div>
            <Progress
              value={((universe.config.startingPoints - remainingPoints) / universe.config.startingPoints) * 100}
              className="mt-2 h-2"
            />
          </div>

          {/* Core Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Core Stats</h4>
            {coreStats.map((stat) => (
              <StatRow
                key={stat.id}
                stat={stat}
                value={baseStats[stat.id] ?? stat.range?.min ?? 0}
                onAdjust={(delta) => adjustStat(stat.id, delta)}
                canIncrease={remainingPoints > 0}
              />
            ))}
          </div>

          {/* Computed Stats Preview */}
          {computedStats.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Computed Stats
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {computedStats.map((stat) => (
                  <div key={stat.id} className="p-2 rounded bg-muted/50 flex items-center justify-between">
                    <span className="text-sm">{stat.name}</span>
                    <span className="font-mono font-bold">{resolved[stat.id] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
            Begin Adventure
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function StatRow({
  stat,
  value,
  onAdjust,
  canIncrease,
}: {
  stat: Stat
  value: number
  onAdjust: (delta: number) => void
  canIncrease: boolean
}) {
  const min = stat.range?.min ?? 0
  const max = stat.range?.max ?? 100
  const canDecrease = value > min

  return (
    <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{stat.name}</span>
          {stat.short && <span className="text-xs text-muted-foreground">({stat.short})</span>}
        </div>
        {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onAdjust(-1)}
          disabled={!canDecrease}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="font-mono font-bold w-8 text-center">{value}</span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          onClick={() => onAdjust(1)}
          disabled={!canIncrease || value >= max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
