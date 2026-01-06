"use client";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Dices } from "lucide-react";
import { useEffect, useState } from "react";
import { CardWrapper } from "./card-wrapper";

interface DiceRollCardProps {
  attributeName: string;
  targetNumber: number;
  attributeValue: number;
  diceRoll: number;
  success: boolean;
  characterPortrait?: string;
  isNew?: boolean;
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
  const [showRoll, setShowRoll] = useState(false);
  const total = attributeValue + diceRoll;

  useEffect(() => {
    // Delay showing the roll result for animation
    const timer = setTimeout(() => {
      setShowRoll(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CardWrapper
      type="diceRoll"
      isNew={isNew}
      characterPortrait={characterPortrait}
      borderColor="border-primary/50"
      animateFrom="top"
    >
      <CardContent className="flex flex-col items-center p-4 pt-3">
        {/* Dice Animation */}
        <motion.div
          className="mb-3"
          animate={!showRoll ? { rotate: [0, 360, 720, 1080] } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Dices
            className={`w-12 h-12 ${
              showRoll
                ? success
                  ? "text-green-500"
                  : "text-red-500"
                : "text-primary"
            }`}
          />
        </motion.div>

        {/* Roll Results */}
        <div className="space-y-2 w-full font-mono">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Target:</span>
            <span className="text-lg font-bold">{targetNumber}</span>
          </div>

          {showRoll && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{attributeName}:</span>
                <span className="text-lg">{attributeValue}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Roll:</span>
                <span className="text-lg font-bold text-primary">
                  +{diceRoll}
                </span>
              </div>

              <div className="border-t border-border pt-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total:</span>
                  <span
                    className={`text-xl font-bold ${
                      success ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {total}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 pb-1">
                <Badge
                  variant={success ? "default" : "destructive"}
                  className={`text-base text-white px-4 py-1.5 font-mono ${
                    success ? "bg-green-500" : ""
                  }`}
                >
                  {success ? "SUCCESS" : "FAILURE"}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </CardWrapper>
  );
}
