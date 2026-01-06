"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  ConflictFormulaToken,
  ConflictRole,
} from "@/lib/schemas/conflict-event-schema";
import type { GameAttribute } from "@/lib/schemas/game-entity-schema";
import {
  evaluateConflictFormula,
  validateConflictFormula,
  conflictFormulaToString,
} from "@/lib/utils/conflict-formula-parser";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormulaTokenList } from "./formula-token-list";
import { ConflictFormulaControls } from "./formula-controls";

interface ConflictFormulaBuilderProps {
  tokens: ConflictFormulaToken[];
  onChange: (tokens: ConflictFormulaToken[]) => void;
  roles: ConflictRole[];
  attributes: GameAttribute[];
  allowComparisons?: boolean; // Allow comparison operators for conditions
  allowLogical?: boolean; // Allow logical operators (and, or, not)
  className?: string;
}

export function ConflictFormulaBuilder({
  tokens,
  onChange,
  roles,
  attributes,
  allowComparisons = false,
  allowLogical = false,
  className,
}: ConflictFormulaBuilderProps) {
  // Filter to distributable attributes only (those that can be modified)
  const selectableAttributes = useMemo(() => {
    return attributes.filter(
      (attr) => attr.category === "distributable" || attr.category === "derived"
    );
  }, [attributes]);

  // Sample context for preview
  const sampleContext = useMemo(() => {
    const roleValues: Record<string, Record<string, number>> = {};
    roles.forEach((role) => {
      roleValues[role.id] = {};
      selectableAttributes.forEach((attr) => {
        roleValues[role.id][attr.id] = 5; // Default sample value
      });
    });
    return { roles: roleValues, variables: {} };
  }, [roles, selectableAttributes]);

  // Validate and preview
  const validation = useMemo(() => {
    return validateConflictFormula(tokens, roles, attributes);
  }, [tokens, roles, attributes]);

  const previewValue = useMemo(() => {
    if (!validation.valid) return null;
    try {
      const result = evaluateConflictFormula(tokens, sampleContext);
      if (typeof result === "boolean") return result ? "true" : "false";
      return result;
    } catch {
      return null;
    }
  }, [tokens, sampleContext, validation.valid]);

  const addToken = useCallback(
    (token: ConflictFormulaToken) => {
      onChange([...tokens, token]);
    },
    [tokens, onChange]
  );

  const removeToken = useCallback(
    (index: number) => {
      const newTokens = [...tokens];
      newTokens.splice(index, 1);
      onChange(newTokens);
    },
    [tokens, onChange]
  );

  const clearFormula = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Formula Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Formula</Label>
          {tokens.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFormula}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        <FormulaTokenList
          tokens={tokens}
          onRemoveToken={removeToken}
          availableAttributes={selectableAttributes}
          roles={roles}
          mode="conflict"
        />

        {/* Preview & Validation */}
        <div className="flex items-center justify-between text-sm">
          {validation.valid ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calculator className="h-4 w-4" />
              <span>Preview (all values = 5):</span>
              <span className="font-mono font-medium text-foreground">
                {previewValue ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{validation.error}</span>
            </div>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {conflictFormulaToString(tokens, roles, attributes)}
          </span>
        </div>
      </div>

      {/* Token Buttons */}
      <ConflictFormulaControls
        onAddToken={addToken}
        availableAttributes={selectableAttributes}
        roles={roles}
        allowComparisons={allowComparisons}
        allowLogical={allowLogical}
      />
    </div>
  );
}
