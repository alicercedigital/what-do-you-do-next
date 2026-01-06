"use client"

import type { ChoiceCard as ChoiceCardType } from "@/core/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Dices, Check } from "lucide-react"

interface Props {
  card: ChoiceCardType
  onSelect?: (id: string) => void
  disabled?: boolean
}

export function ChoiceCard({ card, onSelect, disabled }: Props) {
  const hasSelection = card.options.some((o) => o.selected)

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <p className="text-sm text-muted-foreground font-medium">{card.prompt}</p>

        <div className="space-y-2">
          {card.options.map((option) => {
            const isDisabled = disabled || (hasSelection && !option.selected)

            return (
              <button
                key={option.id}
                onClick={() => !isDisabled && onSelect?.(option.id)}
                disabled={isDisabled}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  option.selected && "border-primary bg-primary/10 ring-1 ring-primary",
                  isDisabled && !option.selected && "opacity-40 cursor-not-allowed",
                  !isDisabled && "hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {option.selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      <p className="font-medium">{option.text}</p>
                    </div>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">{option.description}</p>
                    )}
                  </div>
                  {option.skillCheck && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Dices className="h-3 w-3" />
                      <span>DC {option.skillCheck.difficulty}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
