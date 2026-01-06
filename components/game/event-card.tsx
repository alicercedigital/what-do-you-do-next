"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type GameEvent } from "@/lib/schemas/game-schema";
import { truncateText } from "@/lib/utils/game-helpers";
import { motion } from "framer-motion";
import {
    BookOpen, DicesIcon, ImageIcon, MessageSquare, SwordsIcon, Volume2, Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { CardWrapper } from "./card-wrapper";

const eventTypeIcons: Record<string, React.ReactNode> = {
  narrative: <BookOpen className="h-4 w-4" />,
  dialogue: <MessageSquare className="h-4 w-4" />,
  action: <Zap className="h-4 w-4" />,
  audio: <Volume2 className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  "dice-roll": <DicesIcon className="h-4 w-4" />,
  conflict: <SwordsIcon className="h-4 w-4" />,
};

interface EventCardProps {
  event: GameEvent;
  isNew?: boolean;
  isActive?: boolean;
  characterPortrait?: string;
  locationImage?: string;
}

export function EventCard({
  event,
  isNew = false,
  isActive = false,
  characterPortrait,
  locationImage,
}: EventCardProps) {
  const [wasActive, setWasActive] = useState(false);
  const [showGradient, setShowGradient] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setShowGradient(true);
      setWasActive(true);
    } else if (wasActive) {
      setShowGradient(false);
    }
  }, [isActive, wasActive]);

  const truncatedContent = truncateText(event.content);

  return (
    <CardWrapper
      type="event"
      isNew={isNew}
      isActive={isActive}
      characterPortrait={characterPortrait}
      locationImage={locationImage}
      borderColor={isActive ? "border-primary/50" : undefined}
    >
      <CardHeader className="py-2 shrink-0">
        <motion.div
          className="flex items-center gap-2 text-muted-foreground mb-1"
          initial={isNew ? { x: -10, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {eventTypeIcons[event.type]}
          <span className="text-xs uppercase tracking-wider font-mono">
            {event.type}
          </span>
        </motion.div>
        <CardTitle className="text-base leading-tight font-mono line-clamp-2">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-4 flex-1 overflow-hidden">
        <motion.p
          className="text-sm text-muted-foreground leading-relaxed font-mono h-[140px] overflow-hidden"
          initial={isNew ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {truncatedContent}
        </motion.p>
      </CardContent>
    </CardWrapper>
  );
}
