import type { Token, Stat } from "@wdydn/shared"

interface Context {
  stats: Record<string, number> // Resolved stat values
  roles?: Record<string, Record<string, number>> // For challenges
  vars?: Record<string, number> // Temporary variables
}

/**
 * Evaluate a calculation expression using shunting-yard algorithm
 */
export function evaluate(tokens: Token[], ctx: Context): number {
  if (!tokens.length) return 0

  const output: number[] = []
  const ops: string[] = []

  const precedence: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 }

  const apply = () => {
    const op = ops.pop()!
    const b = output.pop()!
    const a = output.pop()!
    switch (op) {
      case "+":
        output.push(a + b)
        break
      case "-":
        output.push(a - b)
        break
      case "*":
        output.push(a * b)
        break
      case "/":
        output.push(b ? a / b : 0)
        break
    }
  }

  for (const token of tokens) {
    switch (token.type) {
      case "number":
        output.push(token.value)
        break

      case "stat":
        output.push(ctx.stats[token.id] ?? ctx.vars?.[token.id] ?? 0)
        break

      case "role":
        output.push(ctx.roles?.[token.role]?.[token.stat] ?? 0)
        break

      case "op":
        while (ops.length && ops.at(-1) !== "(" && precedence[ops.at(-1)!] >= precedence[token.value]) {
          apply()
        }
        ops.push(token.value)
        break

      case "paren":
        if (token.value === "(") {
          ops.push("(")
        } else {
          while (ops.at(-1) !== "(") apply()
          ops.pop()
          // Check for function
          if (["min", "max", "floor"].includes(ops.at(-1) ?? "")) {
            const fn = ops.pop()!
            const val = output.pop()!
            const prev = output.pop() ?? val
            switch (fn) {
              case "min":
                output.push(Math.min(prev, val))
                break
              case "max":
                output.push(Math.max(prev, val))
                break
              case "floor":
                output.push(Math.floor(val))
                break
            }
          }
        }
        break

      case "fn":
        ops.push(token.name)
        break
    }
  }

  while (ops.length) apply()
  return output[0] ?? 0
}

/**
 * Calculate all stats for a character
 */
export function resolveStats(
  definitions: Stat[],
  baseStats: Record<string, number>,
  equipmentBonuses: Record<string, number> = {},
): Record<string, number> {
  const result: Record<string, number> = {}

  // First: core stats with equipment
  for (const stat of definitions.filter((s) => s.type === "core")) {
    result[stat.id] = (baseStats[stat.id] ?? 0) + (equipmentBonuses[stat.id] ?? 0)
  }

  // Then: computed stats (may depend on core stats)
  for (const stat of definitions.filter((s) => s.type === "computed")) {
    if (!stat.calculation) continue

    let value = evaluate(stat.calculation, { stats: result })

    // Apply clamps
    if (stat.clamp?.min !== undefined) value = Math.max(stat.clamp.min, value)
    if (stat.clamp?.max !== undefined) value = Math.min(stat.clamp.max, value)

    result[stat.id] = Math.round(value)
  }

  return result
}

/**
 * Convert tokens to readable string for display
 */
export function toReadable(tokens: Token[], statNames: Record<string, string>): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case "stat":
          return statNames[t.id] ?? t.id
        case "number":
          return t.value.toString()
        case "op":
          return t.value
        case "paren":
          return t.value
        case "fn":
          return t.name + "("
        case "role":
          return `${t.role}.${statNames[t.stat] ?? t.stat}`
      }
    })
    .join(" ")
}

/**
 * Parse a simple expression string into tokens
 * e.g., "strength * 2 + 10" -> Token[]
 */
export function parseExpression(expr: string, validStats: string[]): Token[] {
  const tokens: Token[] = []
  const parts = expr.match(/(\w+\.?\w*|\d+|[+\-*/()])/g) || []

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      tokens.push({ type: "number", value: Number.parseInt(part, 10) })
    } else if (["+", "-", "*", "/"].includes(part)) {
      tokens.push({ type: "op", value: part as "+" | "-" | "*" | "/" })
    } else if (["(", ")"].includes(part)) {
      tokens.push({ type: "paren", value: part as "(" | ")" })
    } else if (["min", "max", "floor"].includes(part)) {
      tokens.push({ type: "fn", name: part as "min" | "max" | "floor" })
    } else if (part.includes(".")) {
      const [role, stat] = part.split(".")
      tokens.push({ type: "role", role, stat })
    } else if (validStats.includes(part)) {
      tokens.push({ type: "stat", id: part })
    }
  }

  return tokens
}
