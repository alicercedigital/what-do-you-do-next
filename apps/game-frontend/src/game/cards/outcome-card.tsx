import type { OutcomeCard as OutcomeCardType } from "@wdydn/shared"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"
import { Trophy, Skull, Scale } from "lucide-react"

interface Props {
  card: OutcomeCardType
}

const resultIcons = {
  win: Trophy,
  lose: Skull,
  draw: Scale,
}

export function OutcomeCard({ card }: Props) {
  const Icon = resultIcons[card.result]

  return (
    <Card
      className={cn(
        "overflow-hidden",
        card.result === "win" && "border-green-500/50",
        card.result === "lose" && "border-red-500/50",
      )}
    >
      <div
        className={cn(
          "h-2",
          card.result === "win" && "bg-green-500",
          card.result === "lose" && "bg-red-500",
          card.result === "draw" && "bg-yellow-500",
        )}
      />
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
              card.result === "win" && "bg-green-500/20 text-green-400",
              card.result === "lose" && "bg-red-500/20 text-red-400",
              card.result === "draw" && "bg-yellow-500/20 text-yellow-400",
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{card.title}</h3>
            <p className="text-muted-foreground mt-1">{card.description}</p>
            {card.rewards && card.rewards.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {card.rewards.map((reward, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {reward}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
