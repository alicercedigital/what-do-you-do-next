"use client"

import { useState, useCallback, useMemo } from "react"
import type { ConflictFormulaToken, ConflictRole } from "@/lib/schemas/conflict-event-schema"
import type { GameAttribute } from "@/lib/schemas/game-entity-schema"
import {
  evaluateConflictFormula,
  validateConflictFormula,
  conflictFormulaToString,
} from "@/lib/utils/conflict-formula-parser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  X,
  Plus,
  Minus,
  Asterisk,
  Divide,
  Hash,
  Calculator,
  AlertCircle,
  ChevronDown,
  Parentheses,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ConflictFormulaBuilderProps {
  tokens: ConflictFormulaToken[]
  onChange: (tokens: ConflictFormulaToken[]) => void
  roles: ConflictRole[]
  attributes: GameAttribute[]
  allowComparisons?: boolean // Allow comparison operators for conditions
  allowLogical?: boolean // Allow logical operators (and, or, not)
  className?: string
}

const OPERATORS = [
  { value: "+", label: "Add", icon: Plus },
  { value: "-", label: "Subtract", icon: Minus },
  { value: "*", label: "Multiply", icon: Asterisk },
  { value: "/", label: "Divide", icon: Divide },
]

const COMPARISONS = [
  { value: "=", label: "Equals" },
  { value: "!=", label: "Not Equals" },
  { value: "<", label: "Less Than" },
  { value: ">", label: "Greater Than" },
  { value: "<=", label: "Less/Equal" },
  { value: ">=", label: "Greater/Equal" },
]

const LOGICAL = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
  { value: "not", label: "NOT" },
]

const FUNCTIONS = [
  { value: "min", label: "min()", description: "Minimum of values" },
  { value: "max", label: "max()", description: "Maximum of values" },
  { value: "floor", label: "floor()", description: "Round down" },
  { value: "ceil", label: "ceil()", description: "Round up" },
]

const PARENTHESES = [
  { value: "(", label: "(" },
  { value: ")", label: ")" },
]

export function ConflictFormulaBuilder({
  tokens,
  onChange,
  roles,
  attributes,
  allowComparisons = false,
  allowLogical = false,
  className,
}: ConflictFormulaBuilderProps) {
  const [numberInput, setNumberInput] = useState("")
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showFunctionPicker, setShowFunctionPicker] = useState(false)

  // Filter to distributable attributes only (those that can be modified)
  const selectableAttributes = useMemo(() => {
    return attributes.filter((attr) => attr.category === "distributable" || attr.category === "derived")
  }, [attributes])

  // Sample context for preview
  const sampleContext = useMemo(() => {
    const roleValues: Record<string, Record<string, number>> = {}
    roles.forEach((role) => {
      roleValues[role.id] = {}
      selectableAttributes.forEach((attr) => {
        roleValues[role.id][attr.id] = 5 // Default sample value
      })
    })
    return { roles: roleValues, variables: {} }
  }, [roles, selectableAttributes])

  // Validate and preview
  const validation = useMemo(() => {
    return validateConflictFormula(tokens, roles, attributes)
  }, [tokens, roles, attributes])

  const previewValue = useMemo(() => {
    if (!validation.valid) return null
    try {
      const result = evaluateConflictFormula(tokens, sampleContext)
      if (typeof result === "boolean") return result ? "true" : "false"
      return result
    } catch {
      return null
    }
  }, [tokens, sampleContext, validation.valid])

  const addToken = useCallback(
    (token: ConflictFormulaToken) => {
      onChange([...tokens, token])
    },
    [tokens, onChange],
  )

  const removeToken = useCallback(
    (index: number) => {
      const newTokens = [...tokens]
      newTokens.splice(index, 1)
      onChange(newTokens)
    },
    [tokens, onChange],
  )

  const clearFormula = useCallback(() => {
    onChange([])
  }, [onChange])

  const handleAddNumber = useCallback(() => {
    const num = Number.parseFloat(numberInput)
    if (!isNaN(num)) {
      addToken({ type: "number", value: num.toString() })
      setNumberInput("")
    }
  }, [numberInput, addToken])

  const handleSelectRole = useCallback((roleId: string) => {
    setSelectedRole(roleId)
  }, [])

  const handleAddRoleAttribute = useCallback(
    (attrId: string) => {
      if (selectedRole) {
        addToken({ type: "role-attribute", value: `${selectedRole}.${attrId}` })
        setSelectedRole(null)
        setShowRolePicker(false)
      }
    },
    [selectedRole, addToken],
  )

  const handleAddFunction = useCallback(
    (funcName: string) => {
      addToken({ type: "function", value: funcName })
      addToken({ type: "parenthesis", value: "(" })
      setShowFunctionPicker(false)
    },
    [addToken],
  )

  const handleAddOperator = useCallback(
    (op: string) => {
      addToken({ type: "operator", value: op })
    },
    [addToken],
  )

  const handleAddComparison = useCallback(
    (comp: string) => {
      addToken({ type: "comparison", value: comp })
    },
    [addToken],
  )

  const handleAddLogical = useCallback(
    (log: string) => {
      addToken({ type: "logical", value: log })
    },
    [addToken],
  )

  const handleAddParenthesis = useCallback(
    (paren: string) => {
      addToken({ type: "parenthesis", value: paren })
    },
    [addToken],
  )

  const getTokenDisplay = (token: ConflictFormulaToken): { label: string; color: string } => {
    switch (token.type) {
      case "role-attribute": {
        const [roleId, attributeId] = token.value.split(".")
        const role = roles.find((r) => r.id === roleId)
        const attr = attributes.find((a) => a.id === attributeId)
        return {
          label: `${role?.name || roleId}.${attr?.shortName || attr?.name || attributeId}`,
          color: "bg-primary/20 text-primary border-primary/30",
        }
      }
      case "operator":
        return { label: token.value, color: "bg-orange-500/20 text-orange-500 border-orange-500/30" }
      case "number":
        return { label: token.value, color: "bg-blue-500/20 text-blue-500 border-blue-500/30" }
      case "function":
        return { label: token.value, color: "bg-purple-500/20 text-purple-500 border-purple-500/30" }
      case "parenthesis":
        return { label: token.value, color: "bg-muted text-muted-foreground border-muted-foreground/30" }
      case "comparison":
        return { label: token.value, color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" }
      case "logical":
        return { label: token.value.toUpperCase(), color: "bg-amber-500/20 text-amber-500 border-amber-500/30" }
      default:
        return { label: token.value, color: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Formula Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Formula</Label>
            {tokens.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFormula} className="h-6 px-2 text-xs">
                Clear
              </Button>
            )}
          </div>

          <div className="min-h-[60px] rounded-md border bg-muted/30 p-3">
            {tokens.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add tokens to build a formula...</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tokens.map((token, index) => {
                  const { label, color } = getTokenDisplay(token)
                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn("group relative cursor-default gap-1 pr-6 font-mono text-sm", color)}
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeToken(index)}
                        className="absolute right-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Preview & Validation */}
          <div className="flex items-center justify-between text-sm">
            {validation.valid ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>Preview (all values = 5):</span>
                <span className="font-mono font-medium text-foreground">{previewValue ?? 0}</span>
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
        <div className="space-y-3">
          {/* Role Attributes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Role Attributes</Label>
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
                          {selectableAttributes.map((attr) => (
                            <button
                              key={attr.id}
                              type="button"
                              onClick={() => handleAddRoleAttribute(attr.id)}
                              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                            >
                              <span>{attr.name}</span>
                              {attr.shortName && (
                                <span className="text-xs text-muted-foreground">{attr.shortName}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground px-2 pb-2">Select a role first:</p>
                        {roles.map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => handleSelectRole(role.id)}
                            className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                          >
                            <div>
                              <span className="font-medium">{role.name}</span>
                              <p className="text-xs text-muted-foreground">{role.entityType}</p>
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
                const Icon = op.icon
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
                )
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
                    e.preventDefault()
                    handleAddNumber()
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
            <Popover open={showFunctionPicker} onOpenChange={setShowFunctionPicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="w-full justify-between bg-transparent">
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
                      <span className="text-xs text-muted-foreground">{func.description}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
