"use client"

import type { Universe, Character } from "@/core/types"
import { resolveStats } from "@/core/calc"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { User, Package, Sparkles } from "lucide-react"

interface Props {
  universe: Universe
  character: Character
  className?: string
  compact?: boolean
}

export function CharacterSheet({ universe, character, className, compact = false }: Props) {
  // Calculate equipment bonuses
  const bonuses: Record<string, number> = {}
  for (const itemId of Object.values(character.equipment)) {
    if (!itemId) continue
    const item = universe.items.find((i) => i.id === itemId)
    if (!item?.bonuses) continue
    for (const bonus of item.bonuses) {
      bonuses[bonus.statId] = (bonuses[bonus.statId] ?? 0) + bonus.amount
    }
  }

  const resolved = resolveStats(universe.stats, character.baseStats, bonuses)

  const visibleStats = universe.stats.filter((s) => s.display.showInSheet !== false)
  const coreStats = visibleStats.filter((s) => s.type === "core")
  const computedStats = visibleStats.filter((s) => s.type === "computed")

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {visibleStats.slice(0, 4).map((stat) => (
          <div key={stat.id} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
            <span className="text-muted-foreground">{stat.short || stat.name}:</span>
            <span className="font-mono font-bold">{resolved[stat.id] ?? 0}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{character.name}</CardTitle>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Lvl {character.level}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Core Stats */}
        <div className="space-y-2">
          {coreStats.map((stat) => {
            const value = resolved[stat.id] ?? 0
            const max = stat.range?.max ?? 100
            const bonus = bonuses[stat.id]

            return (
              <div key={stat.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{stat.name}</span>
                  <span className="font-mono">
                    {value}
                    {bonus ? <span className="text-green-500 text-xs ml-1">(+{bonus})</span> : null}
                  </span>
                </div>
                {stat.display.style === "bar" && <Progress value={(value / max) * 100} className="h-1.5" />}
              </div>
            )
          })}
        </div>

        {/* Computed Stats */}
        {computedStats.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Computed</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {computedStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.name}</span>
                  <span className="font-mono font-bold">{resolved[stat.id] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Summary */}
        {character.inventory.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Package className="h-3 w-3" />
              <span>Inventory ({character.inventory.length})</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
