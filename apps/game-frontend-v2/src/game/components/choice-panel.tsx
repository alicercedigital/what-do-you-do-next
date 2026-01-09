import { motion } from "framer-motion";
import { Clock, Lock, ChevronRight } from "lucide-react";
import type { v2 } from "@wdydn/shared";
type Moment = v2.Moment;
import { useGameStore } from "@/store";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface ChoicePanelProps {
  moments: Moment[];
}

/**
 * Displays available moments as choices
 *
 * Each moment is shown as a clickable card with:
 * - Preview text (or title if no preview)
 * - Urgent badge if applicable
 * - Locked state if status is 'locked'
 */
export function ChoicePanel({ moments }: ChoicePanelProps) {
  const selectMoment = useGameStore((state) => state.selectMoment);
  const isLoading = useGameStore((state) => state.isLoading);

  if (moments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No choices available</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6 bg-card/50 border-dashed">
        <CardHeader className="py-4">
          <CardTitle className="text-center text-lg font-medium text-muted-foreground">
            What do you do next?
          </CardTitle>
        </CardHeader>
      </Card>

      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {moments.map((moment) => (
          <MomentChoice
            key={moment.id}
            moment={moment}
            onSelect={() => selectMoment(moment.id)}
            disabled={isLoading || moment.status === "locked"}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface MomentChoiceProps {
  moment: Moment;
  onSelect: () => void;
  disabled: boolean;
}

function MomentChoice({ moment, onSelect, disabled }: MomentChoiceProps) {
  const displayText = moment.preview ?? moment.title ?? "Continue...";
  const isLocked = moment.status === "locked";

  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      }}
      whileHover={disabled ? {} : { scale: 1.01, x: 4 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
        "bg-card/80 backdrop-blur-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:bg-accent/60 hover:border-primary/50 hover:shadow-md",
        moment.urgent && "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Choice indicator */}
        <div className={cn(
          "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
          "transition-colors",
          disabled ? "border-muted" : "border-primary/50 group-hover:border-primary",
          isLocked && "bg-muted"
        )}>
          {isLocked ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-primary/70" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{displayText}</p>

            <div className="flex gap-1.5 shrink-0">
              {moment.urgent && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  Urgent
                </Badge>
              )}
              {isLocked && (
                <Badge variant="secondary" className="text-xs">
                  Locked
                </Badge>
              )}
            </div>
          </div>

          {moment.text && moment.preview && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {moment.text.slice(0, 120)}
              {moment.text.length > 120 && "..."}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
