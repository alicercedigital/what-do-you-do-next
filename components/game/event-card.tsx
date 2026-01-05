"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, MessageSquare, Zap, Volume2, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Handle, Position } from "reactflow"
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
  characterPortrait?: string
  locationImage?: string
}

export function EventCard({
  event,
  isNew = false,
  isActive = false,
  characterPortrait,
  locationImage,
}: EventCardProps) {
  const [wasActive, setWasActive] = useState(false)
  const [showGradient, setShowGradient] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setShowGradient(true)
      setWasActive(true)
    } else if (wasActive) {
      setShowGradient(false)
    }
  }, [isActive, wasActive])

  const truncatedContent = event.content.length > 320 ? event.content.slice(0, 317) + "..." : event.content

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
      className="relative"
    >
      <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />

      <Card className="w-80 h-[420px] bg-card border-border shadow-lg shadow-background/50 overflow-hidden !py-0 flex flex-col relative">
        <div className="relative h-32 bg-secondary/30 overflow-hidden shrink-0">
          {locationImage ? (
            <img src={locationImage || "/placeholder.svg"} alt="Location" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary/50 to-secondary/20 flex items-center justify-center">
              <span className="text-muted-foreground/40 text-xs font-mono">Location</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0">
            <AnimatePresence>
              {showGradient && (
                <motion.div
                  className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 relative overflow-hidden"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={isNew ? { x: ["100%", "-100%"] } : { x: "100%", opacity: 0 }}
                    transition={isNew ? { x: { duration: 1.5, repeat: 2, ease: "easeInOut" } } : { duration: 0.8 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute top-20 right-3 z-30">
          <div className="w-24 h-24 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-lg">
            {characterPortrait ? (
              <img
                src={characterPortrait || "/placeholder.svg"}
                alt="Character"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <span className="text-primary/60 text-lg font-bold font-mono">?</span>
              </div>
            )}
          </div>
        </div>

        <CardHeader className="py-2 shrink-0">
          <motion.div
            className="flex items-center gap-2 text-muted-foreground mb-1"
            initial={isNew ? { x: -10, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {eventTypeIcons[event.type]}
            <span className="text-xs uppercase tracking-wider font-mono">{event.type}</span>
          </motion.div>
          <CardTitle className="text-base leading-tight font-mono line-clamp-2">{event.title}</CardTitle>
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
      </Card>
    </motion.div>
  )
}
