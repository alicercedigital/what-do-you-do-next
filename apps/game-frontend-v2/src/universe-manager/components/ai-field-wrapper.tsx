import * as React from "react";
import { Sparkles, ChevronDown, Loader2, Info } from "lucide-react";
import type { v2 } from "@wdydn/shared";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { useAIField, type AIAction, getContextSummary } from "../ai";

type Universe = v2.Universe;

interface AIFieldWrapperProps {
  children: React.ReactNode;
  entityType: string;
  field: string;
  universe: Universe;
  currentEntity?: Record<string, unknown>;
  currentValue: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const ACTION_LABELS: Record<AIAction, { label: string; description: string }> = {
  generate: {
    label: "Generate",
    description: "Create new content from scratch",
  },
  improve: {
    label: "Improve",
    description: "Enhance the existing content",
  },
  expand: {
    label: "Expand",
    description: "Add more detail to existing content",
  },
  suggestions: {
    label: "Suggestions",
    description: "Get multiple alternatives",
  },
};

export function AIFieldWrapper({
  children,
  entityType,
  field,
  universe,
  currentEntity,
  currentValue,
  onValueChange,
  className,
}: AIFieldWrapperProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showFullContext, setShowFullContext] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const { state, availableActions, executeAction, getContext } = useAIField({
    entityType,
    field,
    universe,
    currentEntity,
  });

  const contextSummary = React.useMemo(
    () => getContextSummary(entityType, field, universe, currentEntity),
    [entityType, field, universe, currentEntity]
  );

  const handleAction = async (action: AIAction) => {
    const result = await executeAction(action, currentValue);
    if (result) {
      if (action === "suggestions") {
        // Parse suggestions (one per line)
        const lines = result
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        setSuggestions(lines);
      } else {
        onValueChange(result);
        setIsOpen(false);
        setSuggestions([]);
      }
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onValueChange(suggestion);
    setSuggestions([]);
    setIsOpen(false);
  };

  if (availableActions.length === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {children}

      {/* AI button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-1 top-1 h-7 w-7",
              state.isLoading && "animate-pulse"
            )}
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-purple-500" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-3" align="end">
          <div className="space-y-3">
            {/* Actions */}
            <div>
              <div className="mb-2 text-xs font-medium">AI Actions</div>
              <div className="flex flex-wrap gap-1.5">
                {availableActions.map((action) => (
                  <Button
                    key={action}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleAction(action)}
                    disabled={
                      state.isLoading ||
                      (action !== "generate" && !currentValue.trim())
                    }
                    title={ACTION_LABELS[action].description}
                  >
                    {ACTION_LABELS[action].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium">Suggestions</div>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {state.error && (
              <div className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-500">
                {state.error}
              </div>
            )}

            {/* Context info */}
            <Collapsible open={showFullContext} onOpenChange={setShowFullContext}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded border border-dashed px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {contextSummary.summary}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      showFullContext && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded bg-muted/50 p-2 text-xs">
                  <div className="mb-1 font-medium">AI Context:</div>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {contextSummary.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      const ctx = getContext();
                      console.log("Full AI context:", ctx);
                    }}
                    className="mt-2 text-[10px] text-blue-500 hover:underline"
                  >
                    Log full context to console
                  </button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
