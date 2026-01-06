import type { StoryCard as StoryCardType } from "@/core/types"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

interface Props {
  card: StoryCardType
}

export function StoryCard({ card }: Props) {
  return (
    <Card className="overflow-hidden">
      {card.image && (
        <div className="h-40 bg-muted overflow-hidden">
          <img src={card.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg">{card.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{card.content}</p>
      </CardContent>
    </Card>
  )
}
