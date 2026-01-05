"use client"

import { useState, useCallback, useMemo } from "react"
import type { FormulaToken, GameAttribute } from "@/lib/schemas/game-entity-schema"
import { evaluateFormula, validateFormula, formulaToString } from "@/lib/utils/formula-parser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, Plus, Minus, Asterisk, Divide, Hash, Calculator, AlertCircle, ChevronDown, Parentheses } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormulaBuilderProps {
  tokens: FormulaToken[]
  onChange: (tokens: FormulaToken[]) => void
  availableAttributes: GameAttribute[]
  currentAttributeId?: string // Exclude current attribute from available list
  className?: string
}

const OPERATORS = [
  { value: "+", label: "Add", icon: Plus },
  { value: "-", label: "Subtract", icon: Minus },
  { value: "*", label: "Multiply", icon: Asterisk },
  { value: "/", label: "Divide", icon: Divide },
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

export function FormulaBuilder({
  tokens,
  onChange,
  availableAttributes,
  currentAttributeId,
  className,
}: FormulaBuilderProps) {
  const [numberInput, setNumberInput] = useState("")
  const [showAttributePicker, setShowAttributePicker] = useState(false)
  const [showFunctionPicker, setShowFunctionPicker] = useState(false)

  // Filter out current attribute and non-distributable attributes
  const selectableAttributes = useMemo(() => {
    return availableAttributes.filter((attr) => attr.id !== currentAttributeId && attr.category === "distributable")
  }, [availableAttributes, currentAttributeId])

  // Sample values for preview
  const sampleValues = useMemo(() => {
    const values: Record<string, number> = {}
    selectableAttributes.forEach((attr) => {
      values[attr.id] = 5 // Default sample value
    })
    return values
  }, [selectableAttributes])

  // Validate and preview
  const validation = useMemo(() => {
    return validateFormula(
      tokens,
      selectableAttributes.map((a) => a.id),
    )
  }, [tokens, selectableAttributes])

  const previewValue = useMemo(() => {
    if (!validation.valid) return null
    try {
      return evaluateFormula(tokens, sampleValues)
    } catch {
      return null
    }
  }, [tokens, sampleValues, validation.valid])

  const addToken = useCallback(
    (token: FormulaToken) => {
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

  const handleAddAttribute = useCallback(
    (attrId: string) => {
      addToken({ type: "attribute", value: attrId })
      setShowAttributePicker(false)
    },
    [addToken],
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

  const handleAddParenthesis = useCallback(
    (paren: string) => {
      addToken({ type: "parenthesis", value: paren })
    },
    [addToken],
  )

  const getTokenDisplay = (token: FormulaToken): { label: string; color: string } => {
    switch (token.type) {
      case "attribute": {
        const attr = availableAttributes.find((a) => a.id === token.value)
        return {
          label: attr?.shortName || attr?.name || token.value,
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
              {formulaToString(tokens, availableAttributes)}
            </span>
          </div>
        </div>

        {/* Token Buttons */}
        <div className="space-y-3">
          {/* Attributes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Attributes</Label>
            <Popover open={showAttributePicker} onOpenChange={setShowAttributePicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-between bg-transparent"
                  disabled={selectableAttributes.length === 0}
                >
                  <span>Add Attribute</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <ScrollArea className="max-h-48">
                  <div className="p-1">
                    {selectableAttributes.length === 0 ? (
                      <p className="p-2 text-sm text-muted-foreground">No distributable attributes available</p>
                    ) : (
                      selectableAttributes.map((attr) => (
                        <button
                          key={attr.id}
                          type="button"
                          onClick={() => handleAddAttribute(attr.id)}
                          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                        >
                          <span>{attr.name}</span>
                          {attr.shortName && <span className="text-xs text-muted-foreground">{attr.shortName}</span>}
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
            <div className="flex gap-1.5">
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
