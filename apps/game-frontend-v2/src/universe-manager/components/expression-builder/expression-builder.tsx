import * as React from "react";
import { ChevronRight, Wand2 } from "lucide-react";
import type { v2 } from "@wdydn/shared";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { PathAutocomplete } from "./path-autocomplete";
import { OperatorPalette } from "./operator-palette";
import { FunctionHelper } from "./function-helper";
import { ExpressionPreview } from "./expression-preview";

type Universe = v2.Universe;

interface ExpressionBuilderProps {
  value: string;
  onChange: (value: string) => void;
  mode: "formula" | "condition" | "consequence" | "transition";
  universe: Universe;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function ExpressionBuilder({
  value,
  onChange,
  mode,
  universe,
  placeholder,
  rows = 3,
  className,
}: ExpressionBuilderProps) {
  const [isHelperOpen, setIsHelperOpen] = React.useState(false);
  const [, setCursorPosition] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + text + value.slice(end);
    onChange(newValue);

    // Set cursor position after inserted text
    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
      setCursorPosition(newPosition);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "formula":
        return "Stat Formula";
      case "condition":
        return "Condition";
      case "consequence":
        return "Consequence";
      case "transition":
        return "Transition Expression";
      default:
        return "Expression";
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (mode) {
      case "formula":
        return "$base + stats.strength / 2";
      case "condition":
        return "character.$player.stats.gold >= 100";
      case "consequence":
        return "character.$player.stats.gold += 50";
      case "transition":
        return "$self.status = available when character.$player.stats.level >= 5";
      default:
        return "Enter expression...";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main textarea with autocomplete */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onSelect={handleSelectionChange}
          onClick={handleSelectionChange}
          placeholder={getPlaceholder()}
          rows={rows}
          className="font-mono text-sm pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsHelperOpen(!isHelperOpen)}
          className={cn(
            "absolute right-1 top-1 h-7 w-7",
            isHelperOpen && "bg-muted"
          )}
          title="Toggle expression helper"
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Collapsible helper panel */}
      <Collapsible open={isHelperOpen} onOpenChange={setIsHelperOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                isHelperOpen && "rotate-90"
              )}
            />
            {getModeLabel()} Helper
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-4">
            {/* Quick variables */}
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Quick Insert
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["$player", "$self", "$turn", "$roll", "$base"].map((v) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-mono"
                    onClick={() => insertAtCursor(v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>

            {/* Path autocomplete */}
            <PathAutocomplete
              universe={universe}
              onSelect={insertAtCursor}
            />

            {/* Operators */}
            <OperatorPalette
              mode={mode}
              onSelect={insertAtCursor}
            />

            {/* Functions */}
            <FunctionHelper onSelect={insertAtCursor} />

            {/* Expression templates */}
            {mode === "transition" && (
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Templates
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      insertAtCursor("$self.status = available when ")
                    }
                  >
                    Unlock when...
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      insertAtCursor("$self.status = passed when ")
                    }
                  >
                    Pass when...
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      insertAtCursor("character.$player.stats. += ")
                    }
                  >
                    Modify stat
                  </Button>
                </div>
              </div>
            )}

            {/* Preview/validation */}
            <ExpressionPreview expression={value} mode={mode} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
