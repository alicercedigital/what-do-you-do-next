"use client"

import { motion } from "framer-motion"
import { MousePointer, Dices, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Handle, Position } from "reactflow"
import type { GameOption } from "@/lib/schemas/game-schema"
import { cn } from "@/lib/utils"

interface OptionCardProps {
  option: GameOption
  onClick: () => void
  selected?: boolean
  greyedOut?: boolean
  isNew?: boolean
}

export function OptionCard({ option, onClick, selected = false, greyedOut = false, isNew = false }: OptionCardProps) {
  return (
    <motion.div
      initial={isNew ? { scale: 0.5, opacity: 0, x: -20 } : false}
      animate={{
        scale: greyedOut ? 0.95 : 1,
        opacity: 1,
        x: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
      whileHover={!greyedOut && !selected ? { scale: 1.03, y: -2 } : {}}
      whileTap={!greyedOut && !selected ? { scale: 0.97 } : {}}
      className="relative"
    >
      <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />

      <Card
        onClick={!greyedOut && !selected ? onClick : undefined}
        className={cn(
          "w-72 transition-all duration-300 overflow-hidden bg-card",
          !greyedOut && !selected && "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          selected && "border-primary bg-primary/10 ring-2 ring-primary/20",
          greyedOut && "cursor-not-allowed border-muted bg-muted",
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <motion.div
              className={cn("flex items-center gap-2", greyedOut ? "text-muted-foreground/50" : "text-primary")}
              initial={isNew ? { x: -10, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {selected ? <Check className="h-4 w-4" /> : <MousePointer className="h-4 w-4" />}
              <span className="text-xs uppercase tracking-wider font-medium">{selected ? "Chosen" : "Choice"}</span>
            </motion.div>
            {option.attributeTest && (
              <Badge variant="secondary" className={cn("text-xs", greyedOut && "opacity-50")}>
                <Dices className="h-3 w-3 mr-1" />
                Test
              </Badge>
            )}
          </div>
          <CardTitle className={cn("text-base leading-tight", greyedOut && "text-muted-foreground/60")}>
            {option.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p
            className={cn("text-sm leading-relaxed", greyedOut ? "text-muted-foreground/40" : "text-muted-foreground")}
            initial={isNew ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {option.description}
          </motion.p>
          {option.attributeTest && (
            <motion.div
              className={cn("mt-2 p-2 rounded bg-secondary/50 text-xs", greyedOut && "opacity-50")}
              initial={isNew ? { opacity: 0, y: 5 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-muted-foreground">Difficulty: {option.attributeTest.difficulty}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
