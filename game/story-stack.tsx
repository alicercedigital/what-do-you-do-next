"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Card } from "@/core/types"
import { StoryCard } from "./cards/story-card"
import { ChoiceCard } from "./cards/choice-card"
import { DiceCard } from "./cards/dice-card"
import { ChallengeCard } from "./cards/challenge-card"
import { OutcomeCard } from "./cards/outcome-card"

interface Props {
  cards: Card[]
  onChoice?: (optionId: string) => void
}

export function StoryStack({ cards, onChoice }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new cards appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [cards.length])

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <CardRenderer card={card} isLatest={index === cards.length - 1} onChoice={onChoice} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}

function CardRenderer({
  card,
  isLatest,
  onChoice,
}: { card: Card; isLatest: boolean; onChoice?: (id: string) => void }) {
  switch (card.type) {
    case "story":
      return <StoryCard card={card} />
    case "choice":
      return <ChoiceCard card={card} onSelect={onChoice} disabled={!isLatest} />
    case "dice":
      return <DiceCard card={card} />
    case "challenge":
      return <ChallengeCard card={card} />
    case "outcome":
      return <OutcomeCard card={card} />
  }
}
