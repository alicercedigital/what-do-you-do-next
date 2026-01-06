import type { ChallengeTemplate, ActiveChallenge, RoundAction } from "@/core/types"
import { evaluate } from "@/core/calc"

/**
 * Create a new challenge instance from a template
 */
export function createChallenge(
  template: ChallengeTemplate,
  participants: Record<string, { name: string; stats: Record<string, number>; portrait?: string }>,
): ActiveChallenge {
  return {
    templateId: template.id,
    round: 0,
    participants: Object.fromEntries(
      Object.entries(participants).map(([roleId, p]) => [
        roleId,
        {
          name: p.name,
          portrait: p.portrait,
          stats: { ...p.stats },
          maxStats: { ...p.stats },
        },
      ]),
    ),
    variables: {},
    log: [],
    outcome: null,
  }
}

/**
 * Execute one round of the challenge
 */
export function runRound(challenge: ActiveChallenge, template: ChallengeTemplate): ActiveChallenge {
  if (challenge.outcome) return challenge

  const next = structuredClone(challenge)
  next.round++

  const ctx = buildContext(next)

  for (const action of template.rounds) {
    if (next.outcome) break
    executeAction(next, action, template, ctx)
  }

  // Check max rounds
  if (!next.outcome && next.round >= template.maxRounds && template.defaultOutcome) {
    next.outcome = template.outcomes.find((o) => o.id === template.defaultOutcome) ?? null
  }

  return next
}

function buildContext(challenge: ActiveChallenge) {
  return {
    stats: {},
    roles: Object.fromEntries(Object.entries(challenge.participants).map(([id, p]) => [id, p.stats])),
    vars: challenge.variables,
  }
}

function executeAction(
  challenge: ActiveChallenge,
  action: RoundAction,
  template: ChallengeTemplate,
  ctx: ReturnType<typeof buildContext>,
) {
  switch (action.type) {
    case "damage": {
      const amount = Math.round(evaluate(action.amount, ctx))
      const target = challenge.participants[action.target]
      if (!target) break

      const oldValue = target.stats[action.stat] ?? 0
      target.stats[action.stat] = Math.max(0, oldValue - amount)

      const message = action.message
        ? interpolate(action.message, challenge, { amount })
        : `${target.name} loses ${amount} ${action.stat}`

      challenge.log.push({
        id: crypto.randomUUID(),
        message,
        type: "damage",
        timestamp: Date.now(),
      })
      break
    }

    case "check": {
      const result = evaluate(action.condition, ctx)
      if (result <= 0 && action.onTrue) {
        const outcome = template.outcomes.find((o) => o.id === action.onTrue)
        if (outcome) {
          challenge.outcome = outcome
          challenge.log.push({
            id: crypto.randomUUID(),
            message: outcome.name,
            type: "result",
            timestamp: Date.now(),
          })
        }
      } else if (result > 0 && action.onFalse) {
        const outcome = template.outcomes.find((o) => o.id === action.onFalse)
        if (outcome) {
          challenge.outcome = outcome
          challenge.log.push({
            id: crypto.randomUUID(),
            message: outcome.name,
            type: "result",
            timestamp: Date.now(),
          })
        }
      }
      break
    }

    case "log": {
      challenge.log.push({
        id: crypto.randomUUID(),
        message: interpolate(action.message, challenge),
        type: "info",
        timestamp: Date.now(),
      })
      break
    }

    case "roll": {
      const [countStr, sidesStr] = action.dice.split("d")
      const count = Number.parseInt(countStr, 10) || 1
      const sides = Number.parseInt(sidesStr, 10) || 6

      let total = 0
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1
      }
      if (action.modifier) {
        total += Math.round(evaluate(action.modifier, ctx))
      }
      challenge.variables[action.saveAs] = total
      break
    }
  }
}

function interpolate(template: string, challenge: ActiveChallenge, extras: Record<string, unknown> = {}): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    // Check extras first
    if (path in extras) return String(extras[path])

    // Check role.stat pattern
    const [role, stat] = path.split(".")
    if (stat) {
      const participant = challenge.participants[role]
      if (participant) {
        if (stat === "name") return participant.name
        return String(participant.stats[stat] ?? 0)
      }
    }

    // Check variables
    if (path in challenge.variables) {
      return String(challenge.variables[path])
    }

    return `{${path}}`
  })
}

/**
 * Run challenge to completion (for testing or instant mode)
 */
export function runToCompletion(challenge: ActiveChallenge, template: ChallengeTemplate): ActiveChallenge {
  let current = challenge
  while (!current.outcome && current.round < template.maxRounds) {
    current = runRound(current, template)
  }
  return current
}

/**
 * Check if challenge is over
 */
export function isComplete(challenge: ActiveChallenge): boolean {
  return challenge.outcome !== null
}

/**
 * Get the winner role ID (if any)
 */
export function getWinner(challenge: ActiveChallenge): string | null {
  if (!challenge.outcome || challenge.outcome.result !== "win") return null
  // Convention: player role is the winner on "win"
  return "player"
}
