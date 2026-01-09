import { useState } from "react";
import { Plus, X, Calculator } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { toReadable } from "@/shared/lib/calc";
import { cn } from "@/shared/lib/utils";
import { type Token, type Stat } from "@wdydn/shared";

interface Props {
  tokens: Token[];
  onChange: (tokens: Token[]) => void;
  availableStats: Stat[];
  allowRoles?: boolean;
  roles?: string[];
  className?: string;
}

export function CalculationBuilder({
  tokens,
  onChange,
  availableStats,
  allowRoles = false,
  roles = [],
  className,
}: Props) {
  const [numberInput, setNumberInput] = useState("");

  const statNames = Object.fromEntries(
    availableStats.map((s) => [s.id, s.name])
  );

  const addToken = (token: Token) => {
    onChange([...tokens, token]);
  };

  const removeToken = (index: number) => {
    onChange(tokens.filter((_, i) => i !== index));
  };

  const addNumber = () => {
    const num = Number.parseFloat(numberInput);
    if (!isNaN(num)) {
      addToken({ type: "number", value: num });
      setNumberInput("");
    }
  };

  const readable = toReadable(tokens, statNames);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Display current formula */}
      <div className="p-3 bg-muted rounded-lg min-h-[60px] flex flex-wrap items-center gap-1">
        {tokens.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            Click below to build a calculation...
          </span>
        ) : (
          tokens.map((token, index) => (
            <TokenChip
              key={index}
              token={token}
              statNames={statNames}
              onRemove={() => removeToken(index)}
            />
          ))
        )}
      </div>

      {/* Preview */}
      {tokens.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calculator className="h-4 w-4" />
          <span className="font-mono">{readable}</span>
        </div>
      )}

      {/* Token buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Stats */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Stat
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {availableStats.map((stat) => (
                <Button
                  key={stat.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addToken({ type: "stat", id: stat.id })}
                >
                  {stat.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Roles (for challenges) */}
        {allowRoles && roles.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Role.Stat
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                {roles.map((role) => (
                  <div key={role} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2">
                      {role}
                    </p>
                    {availableStats.map((stat) => (
                      <Button
                        key={`${role}.${stat.id}`}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          addToken({ type: "role", role, stat: stat.id })
                        }
                      >
                        {role}.{stat.name}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Operators */}
        {["+", "-", "*", "/"].map((op) => (
          <Button
            key={op}
            variant="outline"
            size="sm"
            onClick={() =>
              addToken({ type: "op", value: op as "+" | "-" | "*" | "/" })
            }
          >
            {op}
          </Button>
        ))}

        {/* Parentheses */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => addToken({ type: "paren", value: "(" })}
        >
          (
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addToken({ type: "paren", value: ")" })}
        >
          )
        </Button>

        {/* Functions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              fn()
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-2" align="start">
            <div className="space-y-1">
              {(["min", "max", "floor"] as const).map((fn) => (
                <Button
                  key={fn}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addToken({ type: "fn", name: fn })}
                >
                  {fn}()
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Number input */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="#"
            className="w-16 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addNumber()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addNumber}
            disabled={!numberInput}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Clear */}
      {tokens.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear All
        </Button>
      )}
    </div>
  );
}

function TokenChip({
  token,
  statNames,
  onRemove,
}: {
  token: Token;
  statNames: Record<string, string>;
  onRemove: () => void;
}) {
  let label = "";
  let variant: "stat" | "number" | "op" | "fn" | "role" = "op";

  switch (token.type) {
    case "stat":
      label = statNames[token.id] ?? token.id;
      variant = "stat";
      break;
    case "number":
      label = token.value.toString();
      variant = "number";
      break;
    case "op":
      label = token.value;
      variant = "op";
      break;
    case "paren":
      label = token.value;
      variant = "op";
      break;
    case "fn":
      label = token.name + "(";
      variant = "fn";
      break;
    case "role":
      label = `${token.role}.${statNames[token.stat] ?? token.stat}`;
      variant = "role";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono",
        variant === "stat" && "bg-blue-500/20 text-blue-400",
        variant === "number" && "bg-green-500/20 text-green-400",
        variant === "op" && "bg-muted text-foreground",
        variant === "fn" && "bg-purple-500/20 text-purple-400",
        variant === "role" && "bg-orange-500/20 text-orange-400"
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:text-red-400 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
