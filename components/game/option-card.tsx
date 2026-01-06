"use client";

import { motion } from "framer-motion";
import { MousePointer, Dices, Check } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameOption } from "@/lib/schemas/game-schema";
import { cn } from "@/lib/utils";
import { CardWrapper } from "./card-wrapper";

interface OptionCardProps {
  option: GameOption;
  onClick: () => void;
  selected?: boolean;
  greyedOut?: boolean;
  isNew?: boolean;
}

export function OptionCard({
  option,
  onClick,
  selected = false,
  greyedOut = false,
  isNew = false,
}: OptionCardProps) {
  return (
    <CardWrapper
      type="option"
      isNew={isNew}
      showHandles={true}
      className={cn(
        !greyedOut &&
          !selected &&
          "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        selected && "border-primary bg-primary/10 ring-2 ring-primary/20",
        greyedOut && "cursor-not-allowed border-muted bg-muted"
      )}
      borderColor={
        selected ? "border-primary" : greyedOut ? "border-muted" : undefined
      }
      animateFrom="left"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <motion.div
            className={cn(
              "flex items-center gap-2",
              greyedOut ? "text-muted-foreground/50" : "text-primary"
            )}
            initial={isNew ? { x: -10, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {selected ? (
              <Check className="h-4 w-4" />
            ) : (
              <MousePointer className="h-4 w-4" />
            )}
            <span className="text-xs uppercase tracking-wider font-medium">
              {selected ? "Chosen" : "Choice"}
            </span>
          </motion.div>
          {option.attributeTest && (
            <Badge
              variant="secondary"
              className={cn("text-xs", greyedOut && "opacity-50")}
            >
              <Dices className="h-3 w-3 mr-1" />
              Test
            </Badge>
          )}
        </div>
        <CardTitle
          className={cn(
            "text-base leading-tight",
            greyedOut && "text-muted-foreground/60"
          )}
        >
          {option.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.p
          className={cn(
            "text-sm leading-relaxed",
            greyedOut ? "text-muted-foreground/40" : "text-muted-foreground"
          )}
          initial={isNew ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {option.description}
        </motion.p>
        {option.attributeTest && (
          <motion.div
            className={cn(
              "mt-2 p-2 rounded bg-secondary/50 text-xs",
              greyedOut && "opacity-50"
            )}
            initial={isNew ? { opacity: 0, y: 5 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-muted-foreground">
              Difficulty: {option.attributeTest.difficulty}
            </span>
          </motion.div>
        )}
      </CardContent>
    </CardWrapper>
  );
}
