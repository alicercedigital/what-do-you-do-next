"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, MessageSquare, Zap, Volume2, ImageIcon, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { GameEvent } from "@/lib/schemas/game-schema"

const eventTypeIcons = {
  narrative: <BookOpen className="h-4 w-4" />,
  dialogue: <MessageSquare className="h-4 w-4" />,
  action: <Zap className="h-4 w-4" />,
  audio: <Volume2 className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
}

interface EventCardProps {
  event: GameEvent
  isNew?: boolean
  isActive?: boolean
  showContinue?: boolean
  onContinue?: () => void
}

export function EventCard({
  event,
  isNew = false,
  isActive = false,
  showContinue = false,
  onContinue,
}: EventCardProps) {
  const [wasActive, setWasActive] = useState(false)
  const [showGradient, setShowGradient] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setShowGradient(true)
      setWasActive(true)
    } else if (wasActive) {
      // Was active before, now not active - trigger exit animation
      setShowGradient(false)
    }
  }, [isActive, wasActive])

  return (
    <motion.div
      initial={isNew ? { scale: 0.5, opacity: 0, y: 20 } : false}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
    >
      <Card className="w-72 bg-card border-border shadow-lg shadow-background/50 overflow-hidden">
        <AnimatePresence>
          {showGradient && (
            <motion.div
              className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 relative overflow-hidden"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: 1,
                opacity: 1,
              }}
              exit={{
                scaleX: 0,
                opacity: 0,
                transition: { duration: 0.4, ease: "easeInOut" },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={
                  isNew
                    ? {
                        x: ["100%", "-100%"],
                      }
                    : { x: "100%", opacity: 0 }
                }
                transition={
                  isNew
                    ? {
                        x: { duration: 1.5, repeat: 2, ease: "easeInOut" },
                      }
                    : { duration: 0.8 }
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader className="pb-2">
          <motion.div
            className="flex items-center gap-2 text-muted-foreground mb-1"
            initial={isNew ? { x: -10, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {eventTypeIcons[event.type]}
            <span className="text-xs uppercase tracking-wider">{event.type}</span>
          </motion.div>
          <CardTitle className="text-base leading-tight">{event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p
            className="text-sm text-muted-foreground leading-relaxed"
            initial={isNew ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {event.content}
          </motion.p>
          {event.imageUrl && (
            <motion.div
              className="mt-3 rounded-md overflow-hidden"
              initial={isNew ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-32 object-cover" />
            </motion.div>
          )}
          {showContinue && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onContinue?.()
                }}
                className="w-full group"
                variant="default"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
