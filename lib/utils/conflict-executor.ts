import type {
  ConflictEvent,
  CycleStep,
  ConflictOutcome,
  ConflictFormulaToken,
} from "@/lib/schemas/conflict-event-schema"
import type { ConflictLogEntry, ConflictRoleState } from "@/components/game/conflict-card"

export interface ConflictExecutionState {
  conflictId: string
  conflict: ConflictEvent
  roleStates: ConflictRoleState[]
  variables: Record<string, number | string | boolean>
  currentCycle: number
  logs: ConflictLogEntry[]
  isComplete: boolean
  outcome?: ConflictOutcome
  currentStepIndex: number
}

export interface RoleAssignment {
  roleId: string
  entityName: string
  portrait?: string
  attributes: Record<string, number>
}

/**
 * Creates the initial state for a conflict execution
 */
export function createConflictState(
  conflict: ConflictEvent,
  roleAssignments: RoleAssignment[],
): ConflictExecutionState {
  const roleStates: ConflictRoleState[] = roleAssignments.map((assignment) => {
    const role = conflict.roles.find((r) => r.id === assignment.roleId)
    return {
      roleId: assignment.roleId,
      roleName: role?.name || assignment.roleId,
      entityName: assignment.entityName,
      portrait: assignment.portrait,
      attributes: { ...assignment.attributes },
      maxAttributes: { ...assignment.attributes }, // Store initial values as max
    }
  })

  return {
    conflictId: `conflict-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    conflict,
    roleStates,
    variables: {},
    currentCycle: 1,
    logs: [],
    isComplete: false,
    outcome: undefined,
    currentStepIndex: 0,
  }
}

/**
 * Evaluates a formula token array and returns the result
 */
export function evaluateFormula(
  tokens: ConflictFormulaToken[],
  roleStates: ConflictRoleState[],
  variables: Record<string, number | string | boolean>,
): number | boolean | string {
  if (tokens.length === 0) return 0

  // Build expression string
  let expression = ""
  let isComparison = false

  for (const token of tokens) {
    switch (token.type) {
      case "role-attribute": {
        // Format: "roleId.attributeId"
        const [roleId, attributeId] = token.value.split(".")
        const role = roleStates.find((r) => r.roleId === roleId)
        const value = role?.attributes[attributeId] ?? 0
        expression += value.toString()
        break
      }
      case "number":
        expression += token.value
        break
      case "operator":
        expression += ` ${token.value} `
        break
      case "comparison":
        isComparison = true
        expression += ` ${token.value} `
        break
      case "logical":
        isComparison = true
        expression += ` ${token.value === "and" ? "&&" : token.value === "or" ? "||" : token.value} `
        break
      case "parenthesis":
        expression += token.value
        break
      case "function": {
        // Handle built-in functions
        const funcName = token.value.toLowerCase()
        if (funcName === "random") {
          expression += Math.random().toString()
        } else if (funcName === "floor") {
          expression += "Math.floor"
        } else if (funcName === "ceil") {
          expression += "Math.ceil"
        } else if (funcName === "round") {
          expression += "Math.round"
        } else if (funcName === "max") {
          expression += "Math.max"
        } else if (funcName === "min") {
          expression += "Math.min"
        } else if (funcName === "abs") {
          expression += "Math.abs"
        } else if (funcName.startsWith("d")) {
          // Dice roll: d6, d20, etc.
          const sides = Number.parseInt(funcName.substring(1)) || 20
          const roll = Math.floor(Math.random() * sides) + 1
          expression += roll.toString()
        }
        break
      }
      case "string":
        expression += `"${token.value}"`
        break
    }
  }

  // Replace variable references
  for (const [name, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\b${name}\\b`, "g")
    expression = expression.replace(regex, typeof value === "string" ? `"${value}"` : value.toString())
  }

  try {
    // Safe evaluation using Function constructor
    const result = new Function(`return ${expression}`)()
    return result
  } catch (error) {
    console.error("Formula evaluation error:", error, expression)
    return isComparison ? false : 0
  }
}

/**
 * Creates a log entry
 */
function createLog(message: string, type: ConflictLogEntry["type"]): ConflictLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    message,
    type,
    timestamp: Date.now(),
  }
}

/**
 * Interpolates template strings with role attributes
 */
function interpolateTemplate(
  template: string,
  roleStates: ConflictRoleState[],
  variables: Record<string, number | string | boolean>,
): string {
  return template.replace(/\{([^}]+)\}/g, (match, path) => {
    const [roleId, attributeId] = path.split(".")
    if (attributeId) {
      const role = roleStates.find((r) => r.roleId === roleId)
      if (role) {
        if (attributeId === "name") return role.entityName
        return role.attributes[attributeId]?.toString() ?? match
      }
    }
    // Check variables
    if (variables[path] !== undefined) {
      return variables[path].toString()
    }
    return match
  })
}

/**
 * Executes a single step of the conflict cycle
 */
export function executeStep(state: ConflictExecutionState, step: CycleStep): ConflictExecutionState {
  const { roleStates, variables, logs } = state
  const newLogs = [...logs]
  const newRoleStates = [...roleStates.map((r) => ({ ...r, attributes: { ...r.attributes } }))]
  const newVariables = { ...variables }
  let isComplete = false
  let outcome: ConflictOutcome | undefined

  switch (step.action.type) {
    case "modify-attribute": {
      const { roleId, attributeId, operation, formula } = step.action
      const value = evaluateFormula(formula, newRoleStates, newVariables) as number
      const roleIndex = newRoleStates.findIndex((r) => r.roleId === roleId)

      if (roleIndex !== -1) {
        const currentValue = newRoleStates[roleIndex].attributes[attributeId] ?? 0
        let newValue: number

        switch (operation) {
          case "set":
            newValue = value
            break
          case "add":
            newValue = currentValue + value
            break
          case "subtract":
            newValue = currentValue - value
            break
          case "multiply":
            newValue = currentValue * value
            break
          case "divide":
            newValue = value !== 0 ? currentValue / value : currentValue
            break
          default:
            newValue = currentValue
        }

        newRoleStates[roleIndex].attributes[attributeId] = Math.max(0, newValue) // Prevent negative values

        if (operation === "subtract" && value > 0) {
          newLogs.push(
            createLog(
              `${newRoleStates[roleIndex].entityName} loses ${Math.round(value)} ${attributeId.replace(/_/g, " ")}`,
              "damage",
            ),
          )
        } else if (operation === "add" && value > 0) {
          newLogs.push(
            createLog(
              `${newRoleStates[roleIndex].entityName} gains ${Math.round(value)} ${attributeId.replace(/_/g, " ")}`,
              "success",
            ),
          )
        }
      }
      break
    }

    case "check-condition": {
      const { condition, thenSteps, elseSteps } = step.action
      const result = evaluateFormula(condition, newRoleStates, newVariables) as boolean

      // Note: In a full implementation, we'd recursively execute thenSteps or elseSteps
      // For now, we store the branch result in a variable
      newVariables[`_condition_${step.id}`] = result
      break
    }

    case "set-variable": {
      const { variableName, formula } = step.action
      const value = evaluateFormula(formula, newRoleStates, newVariables)
      newVariables[variableName] = value
      break
    }

    case "log-message": {
      const message = interpolateTemplate(step.action.template, newRoleStates, newVariables)
      newLogs.push(createLog(message, "action"))
      break
    }

    case "trigger-outcome": {
      const { outcomeId } = step.action
      outcome = state.conflict.outcomes.find((o) => o.id === outcomeId)
      if (outcome) {
        isComplete = true
        newLogs.push(
          createLog(
            outcome.name,
            outcome.type === "success" ? "success" : outcome.type === "failure" ? "failure" : "info",
          ),
        )
      }
      break
    }

    case "roll-dice": {
      const { variableName, diceCount, diceSides, modifier } = step.action
      let total = 0
      const rolls: number[] = []

      for (let i = 0; i < diceCount; i++) {
        const roll = Math.floor(Math.random() * diceSides) + 1
        rolls.push(roll)
        total += roll
      }

      if (modifier) {
        const mod = evaluateFormula(modifier, newRoleStates, newVariables) as number
        total += mod
      }

      newVariables[variableName] = total
      newLogs.push(createLog(`Rolled ${diceCount}d${diceSides}: [${rolls.join(", ")}] = ${total}`, "info"))
      break
    }

    case "compare-attributes": {
      const { comparisons, resultVariable, orderVariable } = step.action
      const values = comparisons.map((c) => ({
        roleId: c.roleId,
        value: evaluateFormula(c.formula, newRoleStates, newVariables) as number,
      }))

      // Sort by value descending
      values.sort((a, b) => b.value - a.value)

      newVariables[resultVariable] = values[0].roleId
      if (orderVariable) {
        newVariables[orderVariable] = values.map((v) => v.roleId).join(",")
      }
      break
    }
  }

  return {
    ...state,
    roleStates: newRoleStates,
    variables: newVariables,
    logs: newLogs,
    isComplete,
    outcome,
  }
}

/**
 * Executes a full cycle of the conflict
 */
export function executeCycle(state: ConflictExecutionState): ConflictExecutionState {
  if (state.isComplete) return state

  let currentState = { ...state, currentCycle: state.currentCycle }
  const steps = state.conflict.cycleSteps

  // Execute each step in order
  for (const step of steps) {
    if (currentState.isComplete) break

    // Handle executeFor logic
    if (step.executeFor === "each-role") {
      const rolesToExecute = step.roleTypeFilter
        ? currentState.roleStates.filter((r) => {
            const role = state.conflict.roles.find((cr) => cr.id === r.roleId)
            return role?.entityType === step.roleTypeFilter
          })
        : currentState.roleStates

      for (const role of rolesToExecute) {
        // Set current role context
        currentState.variables["_currentRole"] = role.roleId
        currentState = executeStep(currentState, step)
        if (currentState.isComplete) break
      }
    } else {
      currentState = executeStep(currentState, step)
    }
  }

  // Check for max cycles
  if (!currentState.isComplete && currentState.currentCycle >= state.conflict.maxCycles) {
    const defaultOutcome = state.conflict.outcomes.find((o) => o.id === state.conflict.defaultOutcomeId)
    if (defaultOutcome) {
      currentState.isComplete = true
      currentState.outcome = defaultOutcome
      currentState.logs.push(createLog(`Max cycles reached. ${defaultOutcome.name}`, "info"))
    }
  }

  return {
    ...currentState,
    currentCycle: currentState.currentCycle + 1,
    currentStepIndex: 0,
  }
}

/**
 * Runs the entire conflict until completion with delays for animation
 */
export async function runConflict(
  initialState: ConflictExecutionState,
  onStateChange: (state: ConflictExecutionState) => void,
  cycleDelayMs = 1000,
): Promise<ConflictExecutionState> {
  let state = initialState
  onStateChange(state)

  while (!state.isComplete && state.currentCycle <= state.conflict.maxCycles) {
    await new Promise((resolve) => setTimeout(resolve, cycleDelayMs))
    state = executeCycle(state)
    onStateChange(state)
  }

  return state
}

/**
 * Utility to create a simple combat conflict with default cycle
 */
export function createSimpleCombat(
  playerName: string,
  playerPortrait: string | undefined,
  playerAttributes: Record<string, number>,
  enemyName: string,
  enemyPortrait: string | undefined,
  enemyAttributes: Record<string, number>,
  conflictDefinition: ConflictEvent,
): ConflictExecutionState {
  return createConflictState(conflictDefinition, [
    {
      roleId: "player",
      entityName: playerName,
      portrait: playerPortrait,
      attributes: playerAttributes,
    },
    {
      roleId: "enemy",
      entityName: enemyName,
      portrait: enemyPortrait,
      attributes: enemyAttributes,
    },
  ])
}
