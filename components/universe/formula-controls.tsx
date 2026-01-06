"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Minus,
  Asterisk,
  Divide,
  Hash,
  ChevronDown,
  Parentheses,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { FormulaToken } from "@/lib/schemas/game-entity-schema";
import type { ConflictFormulaToken } from "@/lib/schemas/conflict-event-schema";
import type { GameAttribute } from "@/lib/schemas/game-entity-schema";
import type { ConflictRole } from "@/lib/schemas/conflict-event-schema";

const OPERATORS = [
  { value: "+", label: "Add", icon: Plus },
  { value: "-", label: "Subtract", icon: Minus },
  { value: "*", label: "Multiply", icon: Asterisk },
  { value: "/", label: "Divide", icon: Divide },
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

interface BasicFormulaControlsProps {
  onAddToken: (token: FormulaToken) => void;
  availableAttributes: GameAttribute[];
}

interface ConflictFormulaControlsProps {
  onAddToken: (token: ConflictFormulaToken) => void;
  availableAttributes: GameAttribute[];
  roles: ConflictRole[];
  allowComparisons?: boolean;
  allowLogical?: boolean;
}

export function BasicFormulaControls({
  onAddToken,
  availableAttributes,
}: BasicFormulaControlsProps) {
  const [numberInput, setNumberInput] = useState("");
  const [showAttributePicker, setShowAttributePicker] = useState(false);
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

  const handleAddParenthesis = useCallback(
    (paren: string) => {
      onAddToken({ type: "parenthesis", value: paren });
    },
    [onAddToken]
  );

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Attributes */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Attributes</Label>
          <Popover
            open={showAttributePicker}
            onOpenChange={setShowAttributePicker}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between bg-transparent"
                disabled={availableAttributes.length === 0}
              >
                <span>Add Attribute</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <ScrollArea className="max-h-48">
                <div className="p-1">
                  {availableAttributes.length === 0 ? (
                    <p className="p-2 text-sm text-muted-foreground">
                      No distributable attributes available
                    </p>
                  ) : (
                    availableAttributes.map((attr) => (
                      <button
                        key={attr.id}
                        type="button"
                        onClick={() => handleAddAttribute(attr.id)}
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        <span>{attr.name}</span>
                        {attr.shortName && (
                          <span className="text-xs text-muted-foreground">
                            {attr.shortName}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Operators */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Operators</Label>
          <div className="flex flex-wrap gap-1.5">
            {OPERATORS.map((op) => {
              const Icon = op.icon;
              return (
                <Tooltip key={op.value}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-transparent"
                      onClick={() => handleAddOperator(op.value)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{op.label}</TooltipContent>
                </Tooltip>
              );
            })}

            {/* Parentheses */}
            {PARENTHESES.map((paren) => (
              <Button
                key={paren.value}
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 font-mono bg-transparent"
                onClick={() => handleAddParenthesis(paren.value)}
              >
                {paren.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Numbers */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Number</Label>
          <div className="flex gap-1.5">
            <Input
              type="number"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              placeholder="Enter number"
              className="w-32"
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
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={handleAddNumber}
            >
              <Hash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Functions */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Functions</Label>
          <Popover
            open={showFunctionPicker}
            onOpenChange={setShowFunctionPicker}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Parentheses className="h-4 w-4" />
                  <span>Add Function</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-1">
                {FUNCTIONS.map((func) => (
                  <button
                    key={func.value}
                    type="button"
                    onClick={() => handleAddFunction(func.value)}
                    className="flex w-full flex-col items-start rounded-sm px-2 py-1.5 text-left hover:bg-accent"
                  >
                    <span className="font-mono text-sm">{func.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {func.description}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function ConflictFormulaControls({
  onAddToken,
  availableAttributes,
  roles,
  allowComparisons = false,
  allowLogical = false,
}: ConflictFormulaControlsProps) {
  const [numberInput, setNumberInput] = useState("");
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

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Role Attributes */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Role Attributes
          </Label>
          <Popover open={showRolePicker} onOpenChange={setShowRolePicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between bg-transparent"
                disabled={roles.length === 0}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Add Role Attribute</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <ScrollArea className="max-h-64">
                <div className="p-2">
                  {selectedRole ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start mb-2"
                        onClick={() => setSelectedRole(null)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to roles
                      </Button>
                      <div className="space-y-1">
                        {availableAttributes.map((attr) => (
                          <button
                            key={attr.id}
                            type="button"
                            onClick={() => handleAddRoleAttribute(attr.id)}
                            className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                          >
                            <span>{attr.name}</span>
                            {attr.shortName && (
                              <span className="text-xs text-muted-foreground">
                                {attr.shortName}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground px-2 pb-2">
                        Select a role first:
                      </p>
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleSelectRole(role.id)}
                          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                        >
                          <div>
                            <span className="font-medium">{role.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {role.entityType}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Operators */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Operators</Label>
          <div className="flex flex-wrap gap-1.5">
            {OPERATORS.map((op) => {
              const Icon = op.icon;
              return (
                <Tooltip key={op.value}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-transparent"
                      onClick={() => handleAddOperator(op.value)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{op.label}</TooltipContent>
                </Tooltip>
              );
            })}

            {/* Parentheses */}
            {PARENTHESES.map((paren) => (
              <Button
                key={paren.value}
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 font-mono bg-transparent"
                onClick={() => handleAddParenthesis(paren.value)}
              >
                {paren.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Comparison Operators (for conditions) */}
        {allowComparisons && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Comparisons</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMPARISONS.map((comp) => (
                <Tooltip key={comp.value}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 font-mono bg-transparent"
                      onClick={() => handleAddComparison(comp.value)}
                    >
                      {comp.value}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{comp.label}</TooltipContent>
                </Tooltip>
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
                  className="h-9 px-3 bg-transparent"
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
            <Input
              type="number"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              placeholder="Enter number"
              className="w-32"
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
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={handleAddNumber}
            >
              <Hash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Functions */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Functions</Label>
          <Popover
            open={showFunctionPicker}
            onOpenChange={setShowFunctionPicker}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-between bg-transparent"
              >
                <div className="flex items-center gap-2">
                  <Parentheses className="h-4 w-4" />
                  <span>Add Function</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-1">
                {FUNCTIONS.map((func) => (
                  <button
                    key={func.value}
                    type="button"
                    onClick={() => handleAddFunction(func.value)}
                    className="flex w-full flex-col items-start rounded-sm px-2 py-1.5 text-left hover:bg-accent"
                  >
                    <span className="font-mono text-sm">{func.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {func.description}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
