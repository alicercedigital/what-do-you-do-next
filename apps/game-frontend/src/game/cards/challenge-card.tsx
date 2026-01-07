import type { ChallengeCard as ChallengeCardType, ActiveChallenge, ChallengeTemplate } from "@wdydn/shared"
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { useGameStore } from "@/game/store"
import { cn } from "@/shared/lib/utils"
import { Swords, Timer, GraduationCap } from "lucide-react"

interface Props {
  card: ChallengeCardType
}

const themeIcons = {
  combat: Swords,
  race: Timer,
  academic: GraduationCap,
  social: Swords,
}

export function ChallengeCard({ card }: Props) {
  const { universe, challenge } = useGameStore()

  if (!challenge || !universe) return null

  const template = universe.challenges.find((c) => c.id === card.challengeId)
  if (!template) return null

  const Icon = themeIcons[template.display.theme || "combat"]

  return (
    <Card
      className={cn(
        "transition-colors",
        challenge.outcome?.result === "win" && "border-green-500/50",
        challenge.outcome?.result === "lose" && "border-red-500/50",
      )}
    >
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{template.name}</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Round {challenge.round}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Participants */}
        <div className="flex justify-between gap-4">
          {Object.entries(challenge.participants).map(([roleId, participant]) => (
            <ParticipantView key={roleId} roleId={roleId} participant={participant} tracked={template.trackedStats} />
          ))}
        </div>

        {/* Battle Log */}
        {template.display.showLog && challenge.log.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1 text-xs font-mono bg-muted/50 rounded-lg p-2">
            {challenge.log.slice(-10).map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "px-2 py-1 rounded",
                  entry.type === "damage" && "bg-red-500/10 text-red-400",
                  entry.type === "heal" && "bg-green-500/10 text-green-400",
                  entry.type === "result" && "bg-primary/10 text-primary font-bold",
                  entry.type === "info" && "text-muted-foreground",
                )}
              >
                {entry.message}
              </div>
            ))}
          </div>
        )}

        {/* Outcome */}
        {challenge.outcome && (
          <div
            className={cn(
              "text-center p-4 rounded-lg",
              challenge.outcome.result === "win" && "bg-green-500/20",
              challenge.outcome.result === "lose" && "bg-red-500/20",
              challenge.outcome.result === "draw" && "bg-muted",
            )}
          >
            <p className="font-bold text-lg">{challenge.outcome.name}</p>
            <p className="text-sm text-muted-foreground">{challenge.outcome.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ParticipantView({
  roleId,
  participant,
  tracked,
}: {
  roleId: string
  participant: ActiveChallenge["participants"][string]
  tracked: ChallengeTemplate["trackedStats"]
}) {
  const isPlayer = roleId === "player"

  return (
    <div className={cn("flex-1", !isPlayer && "text-right")}>
      <div className={cn("flex items-center gap-2 mb-2", !isPlayer && "flex-row-reverse")}>
        {participant.portrait && (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-border">
            <img src={participant.portrait || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <span className="font-medium">{participant.name}</span>
      </div>

      <div className="space-y-2">
        {tracked.map(({ statId, showAs, label }) => {
          const current = participant.stats[statId] ?? 0
          const max = participant.maxStats[statId] ?? 100
          const percent = Math.max(0, Math.min(100, (current / max) * 100))

          return (
            <div key={statId}>
              <div className={cn("flex justify-between text-xs mb-1", !isPlayer && "flex-row-reverse")}>
                <span className="text-muted-foreground">{label ?? statId}</span>
                <span className="font-mono">
                  {Math.round(current)}/{max}
                </span>
              </div>
              {showAs === "bar" && (
                <Progress
                  value={percent}
                  className={cn(
                    "h-2",
                    percent < 25 && "bg-red-500/20",
                    percent >= 25 && percent < 50 && "bg-yellow-500/20",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
