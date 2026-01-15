import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Moment = v2.Moment;
type Universe = v2.Universe;
type MomentStatus = v2.MomentStatus;
import { evaluateAndApply, checkCondition } from "./expression";
import type { EvaluationContext, AiConditionRequest } from "./expression";

/**
 * Result of processing transitions
 */
export interface TransitionResult {
  state: GameState;
  aiConditions: AiConditionRequest[];
  executedExpressions: string[];
}

/**
 * Process all moment transitions based on current status
 *
 * For each moment:
 * 1. Get transitions for current status
 * 2. Check conditions
 * 3. Execute expressions where conditions are met
 * 4. Collect AI conditions for deferred evaluation
 */
export function processTransitions(
  state: GameState,
  universe: Universe
): TransitionResult {
  let currentState = structuredClone(state);
  const aiConditions: AiConditionRequest[] = [];
  const executedExpressions: string[] = [];

  // Process each moment's transitions
  for (let i = 0; i < currentState.moments.length; i++) {
    const moment = currentState.moments[i];
    if (!moment.transitions) continue;

    const status = moment.status ?? "hidden";
    const transitions = moment.transitions[status];
    if (!transitions || transitions.length === 0) continue;

    // Process each transition expression
    for (const expression of transitions) {
      const context = buildEvaluationContext(currentState, moment);

      // Check if condition is met
      const conditionResult = checkCondition(expression, context);

      if (conditionResult === "ai") {
        // Collect AI condition for deferred evaluation
        aiConditions.push({
          hint: extractAiHint(expression),
          expression,
        });
        continue;
      }

      if (conditionResult === true) {
        // Execute the expression
        try {
          const { context: newContext } = evaluateAndApply(expression, context);

          // Apply mutations back to game state
          currentState = applyContextToState(currentState, newContext, moment.id);
          executedExpressions.push(expression);
        } catch (error) {
          console.warn(`Failed to execute transition: ${expression}`, error);
        }
      }
    }
  }

  return {
    state: currentState,
    aiConditions,
    executedExpressions,
  };
}

/**
 * Process transitions for a single moment
 */
export function processMomentTransitions(
  state: GameState,
  momentId: string,
  universe: Universe
): TransitionResult {
  let currentState = structuredClone(state);
  const aiConditions: AiConditionRequest[] = [];
  const executedExpressions: string[] = [];

  const momentIndex = currentState.moments.findIndex((m) => m.id === momentId);
  if (momentIndex === -1) {
    return { state: currentState, aiConditions, executedExpressions };
  }

  const moment = currentState.moments[momentIndex];
  if (!moment.transitions) {
    return { state: currentState, aiConditions, executedExpressions };
  }

  const status = moment.status ?? "hidden";
  const transitions = moment.transitions[status];
  if (!transitions || transitions.length === 0) {
    return { state: currentState, aiConditions, executedExpressions };
  }

  // Process each transition expression
  for (const expression of transitions) {
    const context = buildEvaluationContext(currentState, moment);

    const conditionResult = checkCondition(expression, context);

    if (conditionResult === "ai") {
      aiConditions.push({
        hint: extractAiHint(expression),
        expression,
      });
      continue;
    }

    if (conditionResult === true) {
      try {
        const { context: newContext } = evaluateAndApply(expression, context);
        currentState = applyContextToState(currentState, newContext, moment.id);
        executedExpressions.push(expression);
      } catch (error) {
        console.warn(`Failed to execute transition: ${expression}`, error);
      }
    }
  }

  return {
    state: currentState,
    aiConditions,
    executedExpressions,
  };
}

/**
 * Build evaluation context from game state
 */
function buildEvaluationContext(
  state: GameState,
  self?: Moment
): EvaluationContext {
  return {
    characters: state.characters.map((c) => ({
      ...c,
      isPlayer: c.isPlayer,
    })),
    moments: state.moments.map((m) => ({
      id: m.id,
      status: m.status,
      title: m.title,
      text: m.text,
      preview: m.preview,
      locationId: m.locationId,
      urgent: m.urgent,
      tags: m.tags,
    })),
    globalStats: state.globalStats,
    self: self
      ? {
          id: self.id,
          status: self.status,
        }
      : undefined,
    turn: (state.globalStats.turn as number) ?? 0,
  };
}

/**
 * Apply evaluation context changes back to game state
 */
function applyContextToState(
  state: GameState,
  context: EvaluationContext,
  selfId?: string
): GameState {
  const newState = structuredClone(state);

  // Apply character changes
  for (const contextChar of context.characters) {
    const stateCharIndex = newState.characters.findIndex(
      (c) => c.id === contextChar.id
    );
    if (stateCharIndex !== -1) {
      // Merge stats changes
      newState.characters[stateCharIndex].stats = {
        ...newState.characters[stateCharIndex].stats,
        ...contextChar.stats,
      };
      // Merge disposition changes
      newState.characters[stateCharIndex].disposition = {
        ...newState.characters[stateCharIndex].disposition,
        ...contextChar.disposition,
      };
    }
  }

  // Apply moment changes
  for (const contextMoment of context.moments) {
    const stateMomentIndex = newState.moments.findIndex(
      (m) => m.id === contextMoment.id
    );
    if (stateMomentIndex !== -1) {
      // Only update status if it changed
      if (contextMoment.status) {
        newState.moments[stateMomentIndex].status =
          contextMoment.status as MomentStatus;
      }
    }
  }

  // Apply global stats changes
  newState.globalStats = {
    ...newState.globalStats,
    ...context.globalStats,
  };

  // Apply $self changes
  if (selfId && context.self) {
    const selfIndex = newState.moments.findIndex((m) => m.id === selfId);
    if (selfIndex !== -1 && context.self.status) {
      newState.moments[selfIndex].status = context.self.status as MomentStatus;
    }
  }

  return newState;
}

/**
 * Extract AI hint from expression
 */
function extractAiHint(expression: string): string {
  const match = expression.match(/ai\(([^)]+)\)/);
  return match ? match[1].trim() : expression;
}

/**
 * Run a full transition cycle until no more changes occur
 * (with max iterations to prevent infinite loops)
 */
export function runTransitionCycle(
  state: GameState,
  universe: Universe,
  maxIterations: number = 10
): TransitionResult {
  let currentState = state;
  const allAiConditions: AiConditionRequest[] = [];
  const allExecutedExpressions: string[] = [];
  let iterations = 0;

  while (iterations < maxIterations) {
    const result = processTransitions(currentState, universe);

    allAiConditions.push(...result.aiConditions);
    allExecutedExpressions.push(...result.executedExpressions);

    // If no expressions were executed, we're done
    if (result.executedExpressions.length === 0) {
      break;
    }

    currentState = result.state;
    iterations++;
  }

  if (iterations >= maxIterations) {
    console.warn(`Transition cycle hit max iterations (${maxIterations})`);
  }

  return {
    state: currentState,
    aiConditions: allAiConditions,
    executedExpressions: allExecutedExpressions,
  };
}
