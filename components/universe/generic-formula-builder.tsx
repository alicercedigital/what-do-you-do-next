"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  UniversalFormulaToken,
  GameAttribute,
} from "@/lib/schemas/game-entity-schema";
import type { ConflictRole } from "@/lib/schemas/conflict-event-schema";
import { UnifiedFormulaEvaluator } from "@/lib/utils/unified-formula-evaluator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Token List Component
interface FormulaTokenListProps {
  tokens: UniversalFormulaToken[];
  onRemoveToken: (index: number) => void;
  availableAttributes: GameAttribute[];
  roles?: ConflictRole[];
  allowComparisons?: boolean;
  allowLogical?: boolean;
}

const FormulaTokenList = ({
  tokens,
  onRemoveToken,
  availableAttributes,
  roles,
  allowComparisons,
  allowLogical,
}: FormulaTokenListProps) => {
  const attrMap = new Map(
    availableAttributes.map((a) => [a.id, a.shortName || a.name])
  );
  const roleMap = new Map(roles?.map((r) => [r.id, r.name]) || []);

  const getTokenLabel = (token: UniversalFormulaToken): string => {
    switch (token.type) {
      case "attribute":
        return attrMap.get(token.value) || token.value;
      case "role-attribute": {
        const [roleId, attributeId] = token.value.split(".");
        const roleName = roleMap.get(roleId) || roleId;
        const attrName = attrMap.get(attributeId) || attributeId;
        return `${roleName}.${attrName}`;
      }
      case "logical":
        return token.value.toUpperCase();
      default:
        return token.value;
    }
  };

  const getTokenColor = (type: string): string => {
    switch (type) {
      case "attribute":
      case "role-attribute":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "operator":
      case "comparison":
      case "logical":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "number":
        return "bg-green-100 text-green-800 border-green-300";
      case "function":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "parenthesis":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "string":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="flex flex-wrap gap-1 min-h-10 p-2 bg-muted/50 rounded-md border">
      {tokens.length === 0 ? (
        <span className="text-sm text-muted-foreground">
          No tokens added yet
        </span>
      ) : (
        tokens.map((token, index) => (
          <div
            key={index}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-mono",
              getTokenColor(token.type)
            )}
          >
            <span>{getTokenLabel(token)}</span>
            <button
              onClick={() => onRemoveToken(index)}
              className="ml-1 hover:opacity-70"
              type="button"
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
};

// Controls Component
interface FormulaControlsProps {
  onAddToken: (token: UniversalFormulaToken) => void;
  availableAttributes: GameAttribute[];
  roles?: ConflictRole[];
  allowComparisons?: boolean;
  allowLogical?: boolean;
  allowRoleAttributes?: boolean;
}

const FormulaControls = ({
  onAddToken,
  availableAttributes,
  roles,
  allowComparisons,
  allowLogical,
  allowRoleAttributes,
}: FormulaControlsProps) => {
  const [numberInput, setNumberInput] = useState("");
  const [showAttributePicker, setShowAttributePicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showFunctionPicker, setShowFunctionPicker] = useState(false);

  const handleAddNumber = useCallback(() => {
    const num = Number.parseFloat(numberInput);
    if (!isNaN(num)) {
      onAddToken({ type: "number", value: num.toString() });
      setNumberInput("");
    }
  }, [numberInput, onAddToken]);

  const handleAddAttribute = useCallback(
    (attrId: string) => {
      onAddToken({ type: "attribute", value: attrId });
      setShowAttributePicker(false);
    },
    [onAddToken]
  );

  const handleSelectRole = useCallback((roleId: string) => {
    setSelectedRole(roleId);
  }, []);

  const handleAddRoleAttribute = useCallback(
    (attrId: string) => {
      if (selectedRole) {
        onAddToken({
          type: "role-attribute",
          value: `${selectedRole}.${attrId}`,
        });
        setSelectedRole(null);
        setShowRolePicker(false);
      }
    },
    [selectedRole, onAddToken]
  );

  const handleAddFunction = useCallback(
    (funcName: string) => {
      onAddToken({ type: "function", value: funcName });
      onAddToken({ type: "parenthesis", value: "(" });
      setShowFunctionPicker(false);
    },
    [onAddToken]
  );

  const handleAddOperator = useCallback(
    (op: string) => {
      onAddToken({ type: "operator", value: op });
    },
    [onAddToken]
  );

  const handleAddComparison = useCallback(
    (comp: string) => {
      onAddToken({ type: "comparison", value: comp });
    },
    [onAddToken]
  );

  const handleAddLogical = useCallback(
    (log: string) => {
      onAddToken({ type: "logical", value: log });
    },
    [onAddToken]
  );

  const handleAddParenthesis = useCallback(
    (paren: string) => {
      onAddToken({ type: "parenthesis", value: paren });
    },
    [onAddToken]
  );

  const OPERATORS = [
    { value: "+", label: "Add" },
    { value: "-", label: "Subtract" },
    { value: "*", label: "Multiply" },
    { value: "/", label: "Divide" },
  ];

  const COMPARISONS = [
    { value: "=", label: "Equals" },
    { value: "!=", label: "Not Equals" },
    { value: "<", label: "Less Than" },
    { value: ">", label: "Greater Than" },
    { value: "<=", label: "Less/Equal" },
    { value: ">=", label: "Greater/Equal" },
  ];

  const LOGICAL = [
    { value: "and", label: "AND" },
    { value: "or", label: "OR" },
    { value: "not", label: "NOT" },
  ];

  const FUNCTIONS = [
    { value: "min", label: "min()", description: "Minimum of values" },
    { value: "max", label: "max()", description: "Maximum of values" },
    { value: "floor", label: "floor()", description: "Round down" },
    { value: "ceil", label: "ceil()", description: "Round up" },
  ];

  const PARENTHESES = [
    { value: "(", label: "(" },
    { value: ")", label: ")" },
  ];

  return (
    <div className="space-y-3">
      {/* Attributes */}
      {availableAttributes.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Attributes</Label>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 justify-between bg-transparent"
              onClick={() => setShowAttributePicker(!showAttributePicker)}
            >
              <span>Add Attribute</span>
            </Button>
            {allowRoleAttributes && roles && roles.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 justify-between bg-transparent"
                onClick={() => setShowRolePicker(!showRolePicker)}
              >
                <span>Add Role Attribute</span>
              </Button>
            )}
          </div>

          {/* Attribute Picker Popover */}
          {showAttributePicker && (
            <div className="border rounded-md p-2 bg-background">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {availableAttributes.map((attr) => (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() => handleAddAttribute(attr.id)}
                    className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                  >
                    {attr.name}
                    {attr.shortName && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({attr.shortName})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role Picker */}
          {showRolePicker && (
            <div className="border rounded-md p-2 bg-background">
              {selectedRole ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedRole(null)}
                  >
                    ← Back to roles
                  </Button>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableAttributes.map((attr) => (
                      <button
                        key={attr.id}
                        type="button"
                        onClick={() => handleAddRoleAttribute(attr.id)}
                        className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                      >
                        {attr.name}
                        {attr.shortName && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({attr.shortName})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground px-2 pb-2">
                    Select a role:
                  </p>
                  <div className="space-y-1">
                    {roles!.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRole(role.id)}
                        className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm flex justify-between items-center"
                      >
                        <span>{role.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.entityType}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Operators */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Operators</Label>
        <div className="flex flex-wrap gap-1.5">
          {OPERATORS.map((op) => (
            <Button
              key={op.value}
              type="button"
              variant="outline"
              size="sm"
              className="px-3 font-mono"
              onClick={() => handleAddOperator(op.value)}
            >
              {op.value}
            </Button>
          ))}
          {PARENTHESES.map((paren) => (
            <Button
              key={paren.value}
              type="button"
              variant="outline"
              size="sm"
              className="px-3 font-mono"
              onClick={() => handleAddParenthesis(paren.value)}
            >
              {paren.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Comparisons */}
      {allowComparisons && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Comparisons</Label>
          <div className="flex flex-wrap gap-1.5">
            {COMPARISONS.map((comp) => (
              <Button
                key={comp.value}
                type="button"
                variant="outline"
                size="sm"
                className="px-3 font-mono"
                onClick={() => handleAddComparison(comp.value)}
              >
                {comp.value}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Logical Operators */}
      {allowLogical && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Logical</Label>
          <div className="flex flex-wrap gap-1.5">
            {LOGICAL.map((log) => (
              <Button
                key={log.value}
                type="button"
                variant="outline"
                size="sm"
                className="px-3"
                onClick={() => handleAddLogical(log.value)}
              >
                {log.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Numbers */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Number</Label>
        <div className="flex gap-1.5">
          <input
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder="Enter number"
            className="flex-1 px-2 py-1 border rounded text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddNumber();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-3"
            onClick={handleAddNumber}
          >
            #
          </Button>
        </div>
      </div>

      {/* Functions */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Functions</Label>
        <div className="flex flex-wrap gap-1.5">
          {FUNCTIONS.map((func) => (
            <Button
              key={func.value}
              type="button"
              variant="outline"
              size="sm"
              className="px-3"
              onClick={() => handleAddFunction(func.value)}
              title={func.description}
            >
              {func.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Builder Component
interface GenericFormulaBuilderProps {
  tokens: UniversalFormulaToken[];
  onChange: (tokens: UniversalFormulaToken[]) => void;
  availableAttributes: GameAttribute[];
  roles?: ConflictRole[];
  allowComparisons?: boolean;
  allowLogical?: boolean;
  allowRoleAttributes?: boolean;
  className?: string;
}

export function GenericFormulaBuilder({
  tokens,
  onChange,
  availableAttributes,
  roles,
  allowComparisons = false,
  allowLogical = false,
  allowRoleAttributes = false,
  className,
}: GenericFormulaBuilderProps) {
  // Filter to distributable attributes only
  const selectableAttributes = useMemo(() => {
    return availableAttributes.filter(
      (attr) => attr.category === "distributable" || attr.category === "derived"
    );
  }, [availableAttributes]);

  // Sample context for preview
  const sampleContext = useMemo(() => {
    const context: any = {
      attributeValues: {},
      variables: {},
    };

    // Basic attributes
    selectableAttributes.forEach((attr) => {
      context.attributeValues[attr.id] = 5;
    });

    // Role attributes
    if (roles && allowRoleAttributes) {
      context.roles = {};
      roles.forEach((role) => {
        context.roles[role.id] = {};
        selectableAttributes.forEach((attr) => {
          context.roles[role.id][attr.id] = 5;
        });
      });
    }

    return context;
  }, [selectableAttributes, roles, allowRoleAttributes]);

  // Validate and preview
  const validation = useMemo(() => {
    return UnifiedFormulaEvaluator.validate(
      tokens,
      selectableAttributes.map((a) => a.id),
      roles
    );
  }, [tokens, selectableAttributes, roles]);

  const previewValue = useMemo(() => {
    if (!validation.valid) return null;
    try {
      const result = UnifiedFormulaEvaluator.evaluate(tokens, sampleContext);
      if (typeof result === "boolean") return result ? "true" : "false";
      return result;
    } catch {
      return null;
    }
  }, [tokens, sampleContext, validation.valid]);

  const addToken = useCallback(
    (token: UniversalFormulaToken) => {
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
          allowComparisons={allowComparisons}
          allowLogical={allowLogical}
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
            {UnifiedFormulaEvaluator.toString(
              tokens,
              availableAttributes,
              roles
            )}
          </span>
        </div>
      </div>

      {/* Token Buttons */}
      <FormulaControls
        onAddToken={addToken}
        availableAttributes={selectableAttributes}
        roles={roles}
        allowComparisons={allowComparisons}
        allowLogical={allowLogical}
        allowRoleAttributes={allowRoleAttributes}
      />
    </div>
  );
}
