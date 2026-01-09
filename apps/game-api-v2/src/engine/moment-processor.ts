import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Moment = v2.Moment;
type Universe = v2.Universe;
import { processMomentTransitions, runTransitionCycle } from "./transition-processor";
import type { TransitionResult } from "./transition-processor";

/**
 * Select a moment to activate
 *
 * This:
 * 1. Verifies the moment is available
 * 2. Sets it to active
 * 3. Handles urgent moments (mark others as passed)
 * 4. Processes active transitions
 */
export function selectMoment(
  state: GameState,
  momentInstanceId: string,
  universe: Universe
): TransitionResult {
  let currentState = structuredClone(state);

  // Find the moment
  const momentIndex = currentState.moments.findIndex(
    (m) => m.id === momentInstanceId
  );
  if (momentIndex === -1) {
    throw new Error(`Moment not found: ${momentInstanceId}`);
  }

  const moment = currentState.moments[momentIndex];

  // Verify it's available
  if (moment.status !== "available") {
    throw new Error(
      `Moment ${momentInstanceId} is not available (status: ${moment.status})`
    );
  }

  // Handle urgent moments - mark other available moments as passed
  if (moment.urgent) {
    for (let i = 0; i < currentState.moments.length; i++) {
      if (i === momentIndex) continue;
      if (
        currentState.moments[i].status === "available" &&
        currentState.moments[i].urgent
      ) {
        currentState.moments[i].status = "passed";
      }
    }
  }

  // Set this moment to active
  currentState.moments[momentIndex].status = "active";

  // Increment turn counter
  currentState.globalStats.turn =
    ((currentState.globalStats.turn as number) ?? 0) + 1;

  // Process active transitions
  const result = processMomentTransitions(currentState, momentInstanceId, universe);

  // Run a full transition cycle to handle any cascading effects
  return runTransitionCycle(result.state, universe);
}

/**
 * Complete the active moment
 *
 * This:
 * 1. Finds the active moment
 * 2. Sets it to lived
 * 3. Processes any completion transitions
 * 4. Runs transition cycle to unlock new moments
 */
export function completeMoment(
  state: GameState,
  universe: Universe
): TransitionResult {
  let currentState = structuredClone(state);

  // Find active moment
  const activeIndex = currentState.moments.findIndex(
    (m) => m.status === "active"
  );
  if (activeIndex === -1) {
    throw new Error("No active moment to complete");
  }

  // Set to lived
  currentState.moments[activeIndex].status = "lived";

  // Run full transition cycle to process all updates
  return runTransitionCycle(currentState, universe);
}

/**
 * Make a moment available
 */
export function makeMomentAvailable(
  state: GameState,
  momentInstanceId: string
): GameState {
  const newState = structuredClone(state);

  const momentIndex = newState.moments.findIndex(
    (m) => m.id === momentInstanceId
  );
  if (momentIndex === -1) {
    throw new Error(`Moment not found: ${momentInstanceId}`);
  }

  newState.moments[momentIndex].status = "available";
  return newState;
}

/**
 * Lock a moment
 */
export function lockMoment(
  state: GameState,
  momentInstanceId: string
): GameState {
  const newState = structuredClone(state);

  const momentIndex = newState.moments.findIndex(
    (m) => m.id === momentInstanceId
  );
  if (momentIndex === -1) {
    throw new Error(`Moment not found: ${momentInstanceId}`);
  }

  newState.moments[momentIndex].status = "locked";
  return newState;
}

/**
 * Hide a moment
 */
export function hideMoment(
  state: GameState,
  momentInstanceId: string
): GameState {
  const newState = structuredClone(state);

  const momentIndex = newState.moments.findIndex(
    (m) => m.id === momentInstanceId
  );
  if (momentIndex === -1) {
    throw new Error(`Moment not found: ${momentInstanceId}`);
  }

  newState.moments[momentIndex].status = "hidden";
  return newState;
}

/**
 * Check if the game has any available moments
 */
export function hasAvailableMoments(state: GameState): boolean {
  return state.moments.some((m) => m.status === "available");
}

/**
 * Check if there's an active moment
 */
export function hasActiveMoment(state: GameState): boolean {
  return state.moments.some((m) => m.status === "active");
}

/**
 * Get moment by ID
 */
export function getMoment(
  state: GameState,
  momentInstanceId: string
): Moment | undefined {
  return state.moments.find((m) => m.id === momentInstanceId);
}

/**
 * Get all moments with a specific status
 */
export function getMomentsByStatus(
  state: GameState,
  status: Moment["status"]
): Moment[] {
  return state.moments.filter((m) => m.status === status);
}

/**
 * Count moments by status
 */
export function countMomentsByStatus(
  state: GameState
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const moment of state.moments) {
    const status = moment.status ?? "hidden";
    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}
