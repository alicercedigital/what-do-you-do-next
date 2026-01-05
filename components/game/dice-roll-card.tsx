"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Dices } from "lucide-react"
import { useEffect, useState } from "react"
import { Handle, Position } from "reactflow"

interface DiceRollCardProps {
  attributeName: string
  targetNumber: number
  attributeValue: number
  diceRoll: number
  success: boolean
  characterPortrait?: string
  isNew?: boolean
}

export function DiceRollCard({
  attributeName,
  targetNumber,
  attributeValue,
  diceRoll,
  success,
  characterPortrait,
  isNew = false,
}: DiceRollCardProps) {
  const [showRoll, setShowRoll] = useState(false)
  const total = attributeValue + diceRoll

  useEffect(() => {
    // Delay showing the roll result for animation
    const timer = setTimeout(() => {
      setShowRoll(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.8, y: 20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative"
    >
      <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />
      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3 !border-2 !border-background" />

      <Card className="w-80 h-[420px] flex flex-col overflow-hidden border-2 border-primary/50 shadow-lg bg-gradient-to-b from-card to-card/80 py-0">
        <div className="relative w-full bg-gradient-to-b from-primary/20 to-background/50 overflow-hidden">
          <img
            src={
              characterPortrait || "/placeholder.svg?height=192&width=320&query=fantasy character portrait silhouette"
            }
            alt="Character"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* Attribute badge overlaid on portrait */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="font-mono text-sm bg-card/80 backdrop-blur-sm">
              {attributeName} Test
            </Badge>
          </div>
        </div>

        <CardContent className="flex flex-col items-center p-4 pt-3">
          {/* Dice Animation */}
          <motion.div
            className="mb-3"
            animate={!showRoll ? { rotate: [0, 360, 720, 1080] } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Dices
              className={`w-12 h-12 ${showRoll ? (success ? "text-green-500" : "text-red-500") : "text-primary"}`}
            />
          </motion.div>

          {/* Roll Results */}
          <div className="space-y-2 w-full font-mono">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Target:</span>
              <span className="text-lg font-bold">{targetNumber}</span>
            </div>

            {showRoll && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{attributeName}:</span>
                  <span className="text-lg">{attributeValue}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Roll:</span>
                  <span className="text-lg font-bold text-primary">+{diceRoll}</span>
                </div>

                <div className="border-t border-border pt-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total:</span>
                    <span className={`text-xl font-bold ${success ? "text-green-500" : "text-red-500"}`}>{total}</span>
                  </div>
                </div>

                <div className="text-center pt-2 pb-1">
                  <Badge variant={success ? "default" : "destructive"} className={`text-base text-white px-4 py-1.5 font-mono ${success ? "bg-green-500" : ""}`}>
                    {success ? "SUCCESS" : "FAILURE"}
                  </Badge>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
