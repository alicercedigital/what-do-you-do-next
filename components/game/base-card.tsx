"use client"

import type { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Handle, Position } from "reactflow"
import { cn } from "@/lib/utils"

// Shared card dimensions as constants
export const CARD_DIMENSIONS = {
  event: { width: 320, height: 420 },
  option: { width: 288, height: 180 },
  diceRoll: { width: 320, height: 420 },
  conflict: { width: 380, height: 500 },
} as const

export type CardType = keyof typeof CARD_DIMENSIONS

interface BaseCardProps {
  children: ReactNode
  type: CardType
  isNew?: boolean
  showHandles?: boolean
  className?: string
  borderColor?: string
}

export function BaseCard({ children, type, isNew = false, showHandles = true, className, borderColor }: BaseCardProps) {
  const dimensions = CARD_DIMENSIONS[type]

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
      {showHandles && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="!bg-primary !w-3 !h-3 !border-2 !border-background"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!bg-primary !w-3 !h-3 !border-2 !border-background"
          />
        </>
      )}

      <Card
        className={cn(
          "bg-card border-border shadow-lg shadow-background/50 overflow-hidden flex flex-col relative",
          borderColor,
          className,
        )}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        {children}
      </Card>
    </motion.div>
  )
}

// Shared card header with image/portrait area
interface CardHeaderImageProps {
  backgroundImage?: string
  backgroundQuery?: string
  portrait?: string
  showPortrait?: boolean
  isActive?: boolean
  isNew?: boolean
  children?: ReactNode
}

export function CardHeaderImage({
  backgroundImage,
  backgroundQuery = "fantasy landscape",
  portrait,
  showPortrait = true,
  isActive = false,
  isNew = false,
  children,
}: CardHeaderImageProps) {
  return (
    <div className="relative h-32 bg-secondary/30 overflow-hidden shrink-0">
      {backgroundImage ? (
        <img src={backgroundImage || "/placeholder.svg"} alt="Background" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-secondary/50 to-secondary/20 flex items-center justify-center">
          <span className="text-muted-foreground/40 text-xs font-mono">{backgroundQuery}</span>
        </div>
      )}

      {/* Active indicator line */}
      <div className="absolute bottom-0 left-0 right-0">
        <AnimatePresence>
          {isActive && (
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

      {/* Portrait overlay */}
      {showPortrait && (
        <div className="absolute top-20 right-3 z-30">
          <div className="w-24 h-24 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-lg">
            {portrait ? (
              <img src={portrait || "/placeholder.svg"} alt="Character" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <span className="text-primary/60 text-lg font-bold font-mono">?</span>
              </div>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
