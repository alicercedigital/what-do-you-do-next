import type { FormulaToken, GameAttribute } from "@/lib/schemas/game-entity-schema"

/**
 * Evaluates a formula with the given attribute values
 * Supports: +, -, *, /, (, ), min(), max(), floor(), ceil()
 */
export function evaluateFormula(tokens: FormulaToken[], attributeValues: Record<string, number>): number {
  if (tokens.length === 0) return 0

  // Convert tokens to a string expression
  const expression = tokensToExpression(tokens, attributeValues)

  try {
    // Use Function constructor for safe evaluation (no access to global scope)
    const safeEval = new Function("min", "max", "floor", "ceil", `"use strict"; return (${expression});`)
    const result = safeEval(Math.min, Math.max, Math.floor, Math.ceil)
    return typeof result === "number" && !isNaN(result) ? result : 0
  } catch {
    console.error("[v0] Formula evaluation error:", expression)
    return 0
  }
}

/**
 * Converts formula tokens to a string expression
 */
function tokensToExpression(tokens: FormulaToken[], attributeValues: Record<string, number>): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case "attribute":
          return attributeValues[token.value] ?? 0
        case "operator":
        case "parenthesis":
          return token.value
        case "number":
          return Number.parseFloat(token.value) || 0
        case "function":
          return token.value // min, max, floor, ceil
        default:
          return ""
      }
    })
    .join(" ")
}

/**
 * Validates a formula to ensure it's syntactically correct
 */
export function validateFormula(
  tokens: FormulaToken[],
  availableAttributeIds: string[],
): { valid: boolean; error?: string } {
  if (tokens.length === 0) {
    return { valid: true }
  }

  // Check for balanced parentheses
  let parenCount = 0
  for (const token of tokens) {
    if (token.type === "parenthesis") {
      if (token.value === "(") parenCount++
      else if (token.value === ")") parenCount--
      if (parenCount < 0) {
        return { valid: false, error: "Unbalanced parentheses: unexpected )" }
      }
    }
  }
  if (parenCount !== 0) {
    return { valid: false, error: "Unbalanced parentheses: missing )" }
  }

  // Check that all referenced attributes exist
  for (const token of tokens) {
    if (token.type === "attribute") {
      if (!availableAttributeIds.includes(token.value)) {
        return { valid: false, error: `Unknown attribute: ${token.value}` }
      }
    }
  }

  // Check for valid function usage
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === "function") {
      const validFunctions = ["min", "max", "floor", "ceil"]
      if (!validFunctions.includes(token.value)) {
        return { valid: false, error: `Unknown function: ${token.value}` }
      }
      // Functions must be followed by (
      const nextToken = tokens[i + 1]
      if (!nextToken || nextToken.type !== "parenthesis" || nextToken.value !== "(") {
        return { valid: false, error: `Function ${token.value} must be followed by (` }
      }
    }
  }

  // Try to evaluate with dummy values
  const dummyValues: Record<string, number> = {}
  availableAttributeIds.forEach((id) => {
    dummyValues[id] = 1
  })

  try {
    evaluateFormula(tokens, dummyValues)
    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid formula syntax" }
  }
}

/**
 * Formats tokens to a human-readable string
 */
export function formulaToString(tokens: FormulaToken[], attributes: GameAttribute[]): string {
  const attrMap = new Map(attributes.map((a) => [a.id, a.shortName || a.name]))

  return tokens
    .map((token) => {
      if (token.type === "attribute") {
        return attrMap.get(token.value) || token.value
      }
      return token.value
    })
    .join(" ")
}

/**
 * Applies min/max caps to a derived attribute value
 */
export function applyAttributeCaps(value: number, minValue?: number, maxValue?: number): number {
  let result = value
  if (minValue !== undefined) {
    result = Math.max(result, minValue)
  }
  if (maxValue !== undefined) {
    result = Math.min(result, maxValue)
  }
  return result
}

/**
 * Calculates all derived attributes for a character
 * Returns a map of attributeId -> calculated value
 */
export function calculateDerivedAttributes(
  attributes: GameAttribute[],
  baseAttributeValues: Record<string, number>,
  equipmentBonuses: Record<string, number> = {},
): Record<string, number> {
  const result: Record<string, number> = {}

  // First, calculate total distributable attribute values (base + equipment)
  const totalDistributableValues: Record<string, number> = { ...baseAttributeValues }
  for (const [attrId, bonus] of Object.entries(equipmentBonuses)) {
    totalDistributableValues[attrId] = (totalDistributableValues[attrId] || 0) + bonus
  }

  // Get all distributable attributes for formula evaluation
  const distributableAttrs = attributes.filter((a) => a.category === "distributable")
  const distributableValues: Record<string, number> = {}
  for (const attr of distributableAttrs) {
    distributableValues[attr.id] = totalDistributableValues[attr.id] || 0
  }

  // Calculate derived attributes
  const derivedAttrs = attributes.filter((a) => a.category === "derived")
  for (const attr of derivedAttrs) {
    if (attr.derivedConfig?.formula && attr.derivedConfig.formula.length > 0) {
      const rawValue = evaluateFormula(attr.derivedConfig.formula, distributableValues)
      result[attr.id] = applyAttributeCaps(rawValue, attr.derivedConfig.minValue, attr.derivedConfig.maxValue)
    } else {
      result[attr.id] = 0
    }
  }

  return result
}

/**
 * Gets equipment bonuses from equipped items
 */
export function getEquipmentBonuses(
  equipment: Record<string, string | null>,
  items: { id: string; attributeModifiers: { attributeId: string; modifier: number }[] }[],
): Record<string, number> {
  const bonuses: Record<string, number> = {}
  const itemMap = new Map(items.map((i) => [i.id, i]))

  for (const itemId of Object.values(equipment)) {
    if (!itemId) continue
    const item = itemMap.get(itemId)
    if (!item) continue

    for (const mod of item.attributeModifiers) {
      bonuses[mod.attributeId] = (bonuses[mod.attributeId] || 0) + mod.modifier
    }
  }

  return bonuses
}

/**
 * Gets total attribute values (base + equipment bonuses)
 * For distributable attributes only
 */
export function getTotalDistributableAttributes(
  baseAttributes: Record<string, number>,
  equipmentBonuses: Record<string, number>,
): Record<string, number> {
  const result = { ...baseAttributes }
  for (const [attrId, bonus] of Object.entries(equipmentBonuses)) {
    result[attrId] = (result[attrId] || 0) + bonus
  }
  return result
}
