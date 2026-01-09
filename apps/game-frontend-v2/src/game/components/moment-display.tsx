import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Swords } from "lucide-react";
import type { v2 } from "@wdydn/shared";
type Moment = v2.Moment;
import { useGameStore } from "@/store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Stage } from "../stage/stage";
import { cn } from "@/shared/lib/utils";

interface MomentDisplayProps {
  moment: Moment;
  onStartChallenge?: () => void;
}

/**
 * Displays the active moment content
 *
 * Shows:
 * - Title
 * - Stage with characters (if defined)
 * - Narrative text with typewriter effect
 * - Continue button
 */
export function MomentDisplay({ moment, onStartChallenge }: MomentDisplayProps) {
  const completeMoment = useGameStore((state) => state.completeMoment);
  const isLoading = useGameStore((state) => state.isLoading);
  const hasChallenge = !!moment.challenge;
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const fullText = moment.text ?? "";

  // Typewriter effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);

    if (!fullText) {
      setIsTyping(false);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20); // 20ms per character

    return () => clearInterval(timer);
  }, [fullText, moment.id]);

  // Skip to full text on click
  const handleSkip = useCallback(() => {
    if (isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
    }
  }, [isTyping, fullText]);

  const handleContinue = async () => {
    await completeMoment();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (isTyping) {
          handleSkip();
        } else if (!isLoading) {
          handleContinue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, isLoading, handleSkip]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stage with characters */}
      <AnimatePresence>
        {moment.stage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Stage stage={moment.stage} />
          </motion.div>
        )}
      </AnimatePresence>

      <Card className={cn(
        "mt-4 border-2 transition-colors",
        moment.urgent && "border-destructive/50"
      )}>
        {(moment.title || moment.urgent) && (
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              {moment.title && (
                <CardTitle className="text-xl">{moment.title}</CardTitle>
              )}
              {moment.urgent && (
                <Badge variant="destructive" className="shrink-0 gap-1">
                  <Clock className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
            </div>
          </CardHeader>
        )}

        <CardContent
          onClick={handleSkip}
          className={cn(
            "cursor-pointer min-h-25 select-none",
            !moment.title && "pt-6"
          )}
        >
          <p className="whitespace-pre-wrap leading-relaxed text-base">
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block ml-0.5 text-primary"
              >
                ▌
              </motion.span>
            )}
          </p>

          {isTyping && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Click or press Space to skip
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-2 gap-3">
          {hasChallenge && onStartChallenge ? (
            <>
              <Button
                variant="outline"
                onClick={handleContinue}
                disabled={isTyping || isLoading}
                className="flex-1"
              >
                Skip Challenge
              </Button>
              <Button
                onClick={onStartChallenge}
                disabled={isTyping || isLoading}
                className="flex-1 group"
                size="lg"
              >
                <Swords className="mr-2 h-4 w-4" />
                Start Challenge
              </Button>
            </>
          ) : (
            <Button
              onClick={handleContinue}
              disabled={isTyping || isLoading}
              className="w-full group"
              size="lg"
            >
              {isLoading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing...
                </motion.span>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
