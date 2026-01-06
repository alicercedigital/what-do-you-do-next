"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  FormulaToken,
  GameAttribute,
} from "@/lib/schemas/game-entity-schema";
import {
  evaluateFormula,
  validateFormula,
  formulaToString,
} from "@/lib/utils/formula-parser";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormulaTokenList } from "./formula-token-list";
import { BasicFormulaControls } from "./formula-controls";

interface FormulaBuilderProps {
  tokens: FormulaToken[];
  onChange: (tokens: FormulaToken[]) => void;
  availableAttributes: GameAttribute[];
  currentAttributeId?: string; // Exclude current attribute from available list
  className?: string;
  mode?: "basic" | "conflict";
}

export function FormulaBuilder({
  tokens,
  onChange,
  availableAttributes,
  currentAttributeId,
  className,
  mode = "basic",
}: FormulaBuilderProps) {
  // Filter out current attribute and non-distributable attributes
  const selectableAttributes = useMemo(() => {
    return availableAttributes.filter(
      (attr) =>
        attr.id !== currentAttributeId && attr.category === "distributable"
    );
  }, [availableAttributes, currentAttributeId]);

  // Sample values for preview
  const sampleValues = useMemo(() => {
    const values: Record<string, number> = {};
    selectableAttributes.forEach((attr) => {
      values[attr.id] = 5; // Default sample value
    });
    return values;
  }, [selectableAttributes]);

  // Validate and preview
  const validation = useMemo(() => {
    return validateFormula(
      tokens,
      selectableAttributes.map((a) => a.id)
    );
  }, [tokens, selectableAttributes]);

  const previewValue = useMemo(() => {
    if (!validation.valid) return null;
    try {
      return evaluateFormula(tokens, sampleValues);
    } catch {
      return null;
    }
  }, [tokens, sampleValues, validation.valid]);

  const addToken = useCallback(
    (token: FormulaToken) => {
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
          availableAttributes={availableAttributes}
          mode={mode}
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
            {formulaToString(tokens, availableAttributes)}
          </span>
        </div>
      </div>

      {/* Token Buttons */}
      <BasicFormulaControls
        onAddToken={addToken}
        availableAttributes={selectableAttributes}
      />
    </div>
  );
}
