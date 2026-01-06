"use client"

import { useEffect, useState } from "react"
import type { DiceCard as DiceCardType } from "@/core/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Dices } from "lucide-react"

interface Props {
  card: DiceCardType
}

export function DiceCard({ card }: Props) {
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card
      className={cn(
        "transition-colors",
        showResult && card.success && "border-green-500/50 bg-green-500/5",
        showResult && !card.success && "border-red-500/50 bg-red-500/5",
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl transition-all",
                !showResult && "bg-muted animate-pulse",
                showResult && card.success && "bg-green-500/20 text-green-400",
                showResult && !card.success && "bg-red-500/20 text-red-400",
              )}
            >
              {showResult ? card.roll : <Dices className="h-5 w-5 animate-spin" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.stat} Check</p>
              <p className="font-medium">
                {showResult ? (
                  <>
                    {card.roll} + {card.statValue} = {card.roll + card.statValue}
                  </>
                ) : (
                  "Rolling..."
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Target: {card.target}</p>
            {showResult && (
              <p className={cn("font-bold", card.success ? "text-green-400" : "text-red-400")}>
                {card.success ? "Success!" : "Failed"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
