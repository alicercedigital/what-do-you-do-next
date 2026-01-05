import type { ConflictFormulaToken, ConflictRole } from "@/lib/schemas/conflict-event-schema"
import type { GameAttribute } from "@/lib/schemas/game-entity-schema"

/**
 * Context for evaluating conflict formulas
 * Contains all role attribute values and temporary variables
 */
export interface ConflictContext {
  roles: Record<string, Record<string, number>> // roleId -> attributeId -> value
  variables: Record<string, number | string> // temporary variables
  currentRoleId?: string // for "each-role" execution
}

/**
 * Converts conflict formula tokens to a string expression
 */
function tokensToExpression(tokens: ConflictFormulaToken[], context: ConflictContext): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case "role-attribute": {
          // Format: "roleId.attributeId"
          const [roleId, attributeId] = token.value.split(".")
          const roleValues = context.roles[roleId]
          if (!roleValues) return 0
          return roleValues[attributeId] ?? 0
        }
        case "operator":
        case "parenthesis":
          return token.value
        case "number":
          return Number.parseFloat(token.value) || 0
        case "function":
          return token.value // min, max, floor, ceil
        case "comparison":
          // Convert to JS comparison operators
          if (token.value === "=") return "==="
          if (token.value === "!=") return "!=="
          return token.value // <, >, <=, >=
        case "logical":
          // Convert to JS logical operators
          if (token.value === "and") return "&&"
          if (token.value === "or") return "||"
          if (token.value === "not") return "!"
          return token.value
        case "string":
          return `"${token.value}"`
        default:
          return ""
      }
    })
    .join(" ")
}

/**
 * Evaluates a conflict formula with the given context
 */
export function evaluateConflictFormula(tokens: ConflictFormulaToken[], context: ConflictContext): number | boolean {
  if (tokens.length === 0) return 0

  const expression = tokensToExpression(tokens, context)

  try {
    const safeEval = new Function("min", "max", "floor", "ceil", `"use strict"; return (${expression});`)
    const result = safeEval(Math.min, Math.max, Math.floor, Math.ceil)
    return result
  } catch (e) {
    console.error("[v0] Conflict formula evaluation error:", expression, e)
    return 0
  }
}

/**
 * Validates a conflict formula
 */
export function validateConflictFormula(
  tokens: ConflictFormulaToken[],
  roles: ConflictRole[],
  attributes: GameAttribute[],
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

  // Check that all role-attribute references are valid
  const roleIds = new Set(roles.map((r) => r.id))
  const attrIds = new Set(attributes.map((a) => a.id))

  for (const token of tokens) {
    if (token.type === "role-attribute") {
      const [roleId, attributeId] = token.value.split(".")
      if (!roleIds.has(roleId)) {
        return { valid: false, error: `Unknown role: ${roleId}` }
      }
      if (!attrIds.has(attributeId)) {
        return { valid: false, error: `Unknown attribute: ${attributeId}` }
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
      const nextToken = tokens[i + 1]
      if (!nextToken || nextToken.type !== "parenthesis" || nextToken.value !== "(") {
        return { valid: false, error: `Function ${token.value} must be followed by (` }
      }
    }
  }

  return { valid: true }
}

/**
 * Formats conflict formula tokens to a human-readable string
 */
export function conflictFormulaToString(
  tokens: ConflictFormulaToken[],
  roles: ConflictRole[],
  attributes: GameAttribute[],
): string {
  const roleMap = new Map(roles.map((r) => [r.id, r.name]))
  const attrMap = new Map(attributes.map((a) => [a.id, a.shortName || a.name]))

  return tokens
    .map((token) => {
      if (token.type === "role-attribute") {
        const [roleId, attributeId] = token.value.split(".")
        const roleName = roleMap.get(roleId) || roleId
        const attrName = attrMap.get(attributeId) || attributeId
        return `${roleName}.${attrName}`
      }
      if (token.type === "logical") {
        return token.value.toUpperCase()
      }
      return token.value
    })
    .join(" ")
}
