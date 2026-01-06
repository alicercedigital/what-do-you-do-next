"use client";

import { Badge } from "@/components/ui/badge";
import type { ConflictFormulaToken, ConflictRole } from "@/lib/schemas/conflict-event-schema";
import type { FormulaToken, GameAttribute } from "@/lib/schemas/game-entity-schema";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FormulaTokenListProps {
  tokens: (FormulaToken | ConflictFormulaToken)[];
  onRemoveToken: (index: number) => void;
  availableAttributes?: GameAttribute[];
  roles?: ConflictRole[];
  mode: "basic" | "conflict";
}

export function FormulaTokenList({
  tokens,
  onRemoveToken,
  availableAttributes = [],
  roles = [],
  mode,
}: FormulaTokenListProps) {
  const getTokenDisplay = (
    token: FormulaToken | ConflictFormulaToken
  ): { label: string; color: string } => {
    // Handle conflict mode with role-attribute
    if (mode === "conflict" && token.type === "role-attribute") {
      const [roleId, attributeId] = token.value.split(".");
      const role = roles.find((r) => r.id === roleId);
      const attr = availableAttributes.find((a) => a.id === attributeId);
      return {
        label: `${role?.name || roleId}.${
          attr?.shortName || attr?.name || attributeId
        }`,
        color: "bg-primary/20 text-primary border-primary/30",
      };
    }

    switch (token.type) {
      case "attribute": {
        const attr = availableAttributes.find((a) => a.id === token.value);
        return {
          label: attr?.shortName || attr?.name || token.value,
          color: "bg-primary/20 text-primary border-primary/30",
        };
      }
      case "operator":
        return {
          label: token.value,
          color: "bg-orange-500/20 text-orange-500 border-orange-500/30",
        };
      case "number":
        return {
          label: token.value,
          color: "bg-blue-500/20 text-blue-500 border-blue-500/30",
        };
      case "function":
        return {
          label: token.value,
          color: "bg-purple-500/20 text-purple-500 border-purple-500/30",
        };
      case "parenthesis":
        return {
          label: token.value,
          color: "bg-muted text-muted-foreground border-muted-foreground/30",
        };
      case "comparison":
        return {
          label: token.value,
          color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
        };
      case "logical":
        return {
          label: token.value.toUpperCase(),
          color: "bg-amber-500/20 text-amber-500 border-amber-500/30",
        };
      default:
        return { label: token.value, color: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="min-h-[60px] rounded-md border bg-muted/30 p-3">
      {tokens.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add tokens to build a formula...
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((token, index) => {
            const { label, color } = getTokenDisplay(token);
            return (
              <Badge
                key={index}
                variant="outline"
                className={cn(
                  "group relative cursor-default gap-1 pr-6 font-mono text-sm",
                  color
                )}
              >
                {label}
                <button
                  type="button"
                  onClick={() => onRemoveToken(index)}
                  className="absolute right-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
