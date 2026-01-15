import * as React from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface FunctionHelperProps {
  onSelect: (fn: string) => void;
}

interface FunctionDef {
  name: string;
  signature: string;
  description: string;
  example: string;
  insert: string;
}

const FUNCTIONS: FunctionDef[] = [
  {
    name: "min",
    signature: "min(a, b)",
    description: "Returns the smaller of two values",
    example: "min(stats.health, 100)",
    insert: "min(, )",
  },
  {
    name: "max",
    signature: "max(a, b)",
    description: "Returns the larger of two values",
    example: "max(stats.health, 0)",
    insert: "max(, )",
  },
  {
    name: "floor",
    signature: "floor(x)",
    description: "Rounds down to nearest integer",
    example: "floor(stats.experience / 100)",
    insert: "floor()",
  },
  {
    name: "ceil",
    signature: "ceil(x)",
    description: "Rounds up to nearest integer",
    example: "ceil(stats.damage * 1.5)",
    insert: "ceil()",
  },
  {
    name: "round",
    signature: "round(x)",
    description: "Rounds to nearest integer",
    example: "round(stats.speed * 0.8)",
    insert: "round()",
  },
  {
    name: "abs",
    signature: "abs(x)",
    description: "Returns absolute value",
    example: "abs(stats.reputation)",
    insert: "abs()",
  },
  {
    name: "clamp",
    signature: "clamp(value, min, max)",
    description: "Constrains value between min and max",
    example: "clamp(stats.health, 0, stats.maxHealth)",
    insert: "clamp(, , )",
  },
  {
    name: "roll",
    signature: 'roll("XdY") or roll(count, sides)',
    description: "Rolls dice (e.g., 1d20, 2d6)",
    example: 'roll("1d20") + stats.strength',
    insert: 'roll("1d6")',
  },
  {
    name: "random",
    signature: "random() or random(min, max)",
    description: "Random number (0-1 or min-max)",
    example: "random(1, 100)",
    insert: "random()",
  },
];

export function FunctionHelper({ onSelect }: FunctionHelperProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (fn: FunctionDef) => {
    onSelect(fn.insert);
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Functions
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
          >
            Insert Function
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2" align="start">
          <div className="max-h-64 overflow-y-auto space-y-1">
            {FUNCTIONS.map((fn) => (
              <button
                key={fn.name}
                type="button"
                onClick={() => handleSelect(fn)}
                className="w-full rounded px-2 py-2 text-left hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">
                    {fn.signature}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {fn.description}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  Example: {fn.example}
                </p>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick function buttons */}
      <div className="mt-2 flex flex-wrap gap-1">
        {["roll", "min", "max", "clamp"].map((fnName) => {
          const fn = FUNCTIONS.find((f) => f.name === fnName);
          if (!fn) return null;
          return (
            <Button
              key={fnName}
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[10px] font-mono"
              onClick={() => onSelect(fn.insert)}
              title={fn.description}
            >
              {fnName}()
            </Button>
          );
        })}
      </div>
    </div>
  );
}
