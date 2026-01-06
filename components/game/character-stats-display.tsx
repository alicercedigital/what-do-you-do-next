"use client"

import { getIconComponent } from "@/components/universe/icon-picker"
import type { GameAttribute, GameItem } from "@/lib/schemas/game-entity-schema"
import type { PlayerCharacter } from "@/lib/schemas/game-schema"
import { cn } from "@/lib/utils"
import { recalculateCharacterAttributes } from "@/lib/utils/character-attributes"
import { useMemo } from "react"

interface CharacterStatsDisplayProps {
  character: PlayerCharacter
  attributes: GameAttribute[]
  items: GameItem[]
  className?: string
  compact?: boolean
}

export function CharacterStatsDisplay({
  character,
  attributes,
  items,
  className,
  compact = false,
}: CharacterStatsDisplayProps) {
  // Calculate all attributes
  const { totalDistributable, derived } = useMemo(() => {
    return recalculateCharacterAttributes(character, attributes, items)
  }, [character, attributes, items])

  // Sort attributes by display position
  const sortedAttributes = useMemo(() => {
    return [...attributes]
      .filter((a) => a.display?.showOnCharacterSheet !== false)
      .sort((a, b) => (a.display?.position ?? 0) - (b.display?.position ?? 0))
  }, [attributes])

  // Group by width for layout
  const attributeRows = useMemo(() => {
    const rows: { attr: GameAttribute; value: number; isBonus: boolean }[][] = []
    let currentRow: { attr: GameAttribute; value: number; isBonus: boolean }[] = []
    let currentWidth = 0

    for (const attr of sortedAttributes) {
      const width = attr.display?.width === "full" ? 1 : attr.display?.width === "half" ? 0.5 : 0.33
      const value = attr.category === "distributable" ? (totalDistributable[attr.id] ?? 0) : (derived[attr.id] ?? 0)
      const isBonus =
        attr.category === "distributable" &&
        (totalDistributable[attr.id] ?? 0) > (character.baseAttributes[attr.id] ?? 0)

      if (currentWidth + width > 1) {
        if (currentRow.length > 0) rows.push(currentRow)
        currentRow = [{ attr, value, isBonus }]
        currentWidth = width
      } else {
        currentRow.push({ attr, value, isBonus })
        currentWidth += width
      }
    }
    if (currentRow.length > 0) rows.push(currentRow)

    return rows
  }, [sortedAttributes, totalDistributable, derived, character.baseAttributes])

  return (
    <div className={cn("space-y-2", className)}>
      {attributeRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map(({ attr, value, isBonus }) => {
            const Icon = getIconComponent(attr.display?.icon || "circle")
            const widthClass =
              attr.display?.width === "full" ? "flex-1" : attr.display?.width === "half" ? "w-1/2" : "w-1/3"

            if (compact) {
              return (
                <div key={attr.id} className={cn("flex items-center gap-2 p-2 rounded-lg bg-secondary/30", widthClass)}>
                  <div className={cn("p-1 rounded bg-background", attr.display?.iconColor || "text-foreground")}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium">{attr.shortName || attr.name}</span>
                  <span className={cn("ml-auto font-bold text-sm", isBonus && "text-green-500")}>
                    {Math.round(value)}
                    {isBonus && <span className="text-xs">+</span>}
                  </span>
                </div>
              )
            }

            // Full display with bar support
            return (
              <div key={attr.id} className={cn("p-3 rounded-lg bg-secondary/30", widthClass)}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("p-1.5 rounded bg-background", attr.display?.iconColor || "text-foreground")}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{attr.shortName || attr.name}</span>
                  <span className={cn("ml-auto text-lg font-bold", isBonus && "text-green-500")}>
                    {Math.round(value)}
                    {isBonus && character.baseAttributes[attr.id] !== undefined && (
                      <span className="text-xs text-muted-foreground ml-1">({character.baseAttributes[attr.id]})</span>
                    )}
                  </span>
                </div>

                {/* Bar display for derived attributes */}
                {attr.display?.displayType === "bar" && attr.derivedConfig?.maxValue && (
                  <div className={cn("h-2 rounded-full mt-2", attr.display.barBackgroundColor || "bg-secondary")}>
                    <div
                      className={cn("h-full rounded-full transition-all", attr.display.barColor || "bg-primary")}
                      style={{ width: `${Math.min(100, (value / attr.derivedConfig.maxValue) * 100)}%` }}
                    />
                    {attr.display.showPercentage && (
                      <span className="text-xs text-muted-foreground mt-0.5 block text-right">
                        {Math.round((value / attr.derivedConfig.maxValue) * 100)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
