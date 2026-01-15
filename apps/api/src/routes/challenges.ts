import { Router } from "express";
import { getGame, saveGame, getChallengeState, saveChallengeState, deleteChallengeState } from "../storage";
import { createChallengeProcessor } from "../engine";
import { optionalAuth, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Apply optional auth to all routes
router.use(optionalAuth);

/**
 * Start a challenge
 * POST /api/game/:id/challenge/start
 *
 * Body: { roleAssignments: Record<string, string> }
 */
router.post("/game/:id/challenge/start", async (req: AuthenticatedRequest, res) => {
  try {
    const { roleAssignments } = req.body;
    const gameId = req.params.id;

    if (!roleAssignments || typeof roleAssignments !== "object") {
      return res.status(400).json({ error: "roleAssignments is required" });
    }

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Find the active moment
    const activeMoment = game.state.moments.find((m) => m.status === "active");
    if (!activeMoment) {
      return res.status(400).json({ error: "No active moment" });
    }

    if (!activeMoment.challenge) {
      return res.status(400).json({
        error: "Active moment does not have a challenge",
      });
    }

    // Check if there's already an active challenge
    const existingChallenge = getChallengeState(gameId);
    if (existingChallenge) {
      return res.status(400).json({
        error: "A challenge is already in progress",
      });
    }

    // Create and start the challenge
    const processor = createChallengeProcessor(
      game.state,
      activeMoment.challenge,
      activeMoment.id
    );

    const result = processor.start(roleAssignments);

    // Save the challenge state
    saveChallengeState(gameId, result.challengeState);

    // Save the updated game state
    await saveGame({ state: result.state, universe: game.universe }, req.user?.id);

    return res.json({
      state: result.state,
      challengeState: result.challengeState,
      aiConditions: result.aiConditions,
      logEntries: result.logEntries,
    });
  } catch (error) {
    console.error("Failed to start challenge:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to start challenge",
    });
  }
});

/**
 * Advance a challenge round
 * POST /api/game/:id/challenge/advance
 */
router.post("/game/:id/challenge/advance", async (req: AuthenticatedRequest, res) => {
  try {
    const gameId = req.params.id;

    const game = await getGame(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const challengeState = getChallengeState(gameId);
    if (!challengeState) {
      return res.status(400).json({ error: "No active challenge" });
    }

    if (challengeState.completed) {
      return res.status(400).json({ error: "Challenge already completed" });
    }

    // Find the challenge definition from the moment
    const moment = game.state.moments.find(
      (m) => m.id === challengeState.momentId
    );
    if (!moment?.challenge) {
      return res.status(400).json({ error: "Challenge definition not found" });
    }

    // Create processor with existing state and advance
    const processor = createChallengeProcessor(
      game.state,
      moment.challenge,
      challengeState.momentId,
      challengeState
    );

    const result = processor.advanceRound();

    // Update challenge state
    if (result.challengeState.completed) {
      // Challenge is done, clean up
      deleteChallengeState(gameId);
    } else {
      saveChallengeState(gameId, result.challengeState);
    }

    // Save the updated game state
    await saveGame({ state: result.state, universe: game.universe }, req.user?.id);

    return res.json({
      state: result.state,
      challengeState: result.challengeState,
      aiConditions: result.aiConditions,
      logEntries: result.logEntries,
    });
  } catch (error) {
    console.error("Failed to advance challenge:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to advance challenge",
    });
  }
});

/**
 * Get challenge state
 * GET /api/game/:id/challenge
 */
router.get("/game/:id/challenge", async (req, res) => {
  const gameId = req.params.id;

  const game = await getGame(gameId);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const challengeState = getChallengeState(gameId);

  // Also include the challenge definition if available
  let challengeDefinition = null;
  if (challengeState) {
    const moment = game.state.moments.find(
      (m) => m.id === challengeState.momentId
    );
    challengeDefinition = moment?.challenge ?? null;
  }

  return res.json({
    challengeState,
    challengeDefinition,
  });
});

/**
 * End/cancel a challenge
 * POST /api/game/:id/challenge/end
 */
router.post("/game/:id/challenge/end", async (req, res) => {
  const gameId = req.params.id;

  const game = await getGame(gameId);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  deleteChallengeState(gameId);

  return res.json({ success: true });
});

export { router as challengesRouter };
