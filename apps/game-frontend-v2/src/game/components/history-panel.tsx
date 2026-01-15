import { motion } from "framer-motion";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { v2 } from "@wdydn/shared";
type Moment = v2.Moment;
import { useLivedMoments } from "@/store";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

interface HistoryPanelProps {
  className?: string;
}

/**
 * Panel showing lived moments (story history)
 *
 * Displays as a collapsible timeline of past moments
 */
export function HistoryPanel({ className }: HistoryPanelProps) {
  const livedMoments = useLivedMoments();
  const [isOpen, setIsOpen] = useState(false);

  if (livedMoments.length === 0) {
    return null;
  }

  // Show most recent moments first
  const reversedMoments = [...livedMoments].reverse();

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between px-4 hover:bg-muted/50"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              History ({livedMoments.length} moment{livedMoments.length !== 1 ? "s" : ""})
            </span>
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ScrollArea className="h-[200px] px-4 py-2">
          <div className="space-y-1">
            {reversedMoments.map((moment, index) => (
              <HistoryEntry
                key={moment.id}
                moment={moment}
                isLatest={index === 0}
              />
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface HistoryEntryProps {
  moment: Moment;
  isLatest: boolean;
}

function HistoryEntry({ moment, isLatest }: HistoryEntryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "relative pl-4 py-2 border-l-2",
        isLatest
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/50"
      )}
    >
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-0 top-3 w-2 h-2 rounded-full -translate-x-[5px]",
          isLatest ? "bg-primary" : "bg-muted-foreground"
        )}
      />

      <h4 className="text-sm font-medium leading-tight">{moment.title}</h4>
      {moment.text && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {moment.text}
        </p>
      )}
    </motion.div>
  );
}

/**
 * Compact history display for the header area
 */
export function HistoryBreadcrumb({ className }: { className?: string }) {
  const livedMoments = useLivedMoments();

  if (livedMoments.length === 0) {
    return null;
  }

  // Get last 3 moments
  const recentMoments = livedMoments.slice(-3);

  return (
    <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
      {recentMoments.map((moment, index) => (
        <span key={moment.id} className="flex items-center">
          {index > 0 && <span className="mx-1">→</span>}
          <span
            className={cn(
              "truncate max-w-[80px]",
              index === recentMoments.length - 1 && "text-foreground font-medium"
            )}
            title={moment.title}
          >
            {moment.title}
          </span>
        </span>
      ))}
    </div>
  );
}
