import { Router } from "express";
import { GameEngine } from "../engine";
import { getGame, saveGame } from "../storage";
import { optionalAuth, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Apply optional auth to all routes
router.use(optionalAuth);

/**
 * Select a moment
 * POST /api/game/:id/moment/select
 */
router.post("/game/:id/moment/select", async (req: AuthenticatedRequest, res) => {
  try {
    const { momentInstanceId } = req.body;

    if (!momentInstanceId) {
      return res.status(400).json({ error: "momentInstanceId is required" });
    }

    const game = await getGame(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const engine = GameEngine.loadGame(game.state, game.universe);
    const result = engine.selectMoment(momentInstanceId);

    // Update stored state
    await saveGame({ state: engine.getState(), universe: game.universe }, req.user?.id);

    return res.json({
      state: engine.getState(),
      aiConditions: result.aiConditions,
      executedExpressions: result.executedExpressions,
    });
  } catch (error) {
    console.error("Failed to select moment:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to select moment",
    });
  }
});

/**
 * Complete the active moment
 * POST /api/game/:id/moment/complete
 */
router.post("/game/:id/moment/complete", async (req: AuthenticatedRequest, res) => {
  try {
    const game = await getGame(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const engine = GameEngine.loadGame(game.state, game.universe);
    const result = engine.completeMoment();

    // Update stored state
    await saveGame({ state: engine.getState(), universe: game.universe }, req.user?.id);

    return res.json({
      state: engine.getState(),
      aiConditions: result.aiConditions,
      executedExpressions: result.executedExpressions,
    });
  } catch (error) {
    console.error("Failed to complete moment:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to complete moment",
    });
  }
});

/**
 * Add a new moment instance
 * POST /api/game/:id/moment/create
 */
router.post("/game/:id/moment/create", async (req: AuthenticatedRequest, res) => {
  try {
    const { templateId, initialStatus } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: "templateId is required" });
    }

    const game = await getGame(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const engine = GameEngine.loadGame(game.state, game.universe);
    const { momentInstanceId } = engine.addMoment(templateId, initialStatus);

    // Update stored state
    await saveGame({ state: engine.getState(), universe: game.universe }, req.user?.id);

    return res.json({
      state: engine.getState(),
      momentInstanceId,
    });
  } catch (error) {
    console.error("Failed to create moment:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create moment",
    });
  }
});

/**
 * Get available moments
 * GET /api/game/:id/moments/available
 */
router.get("/game/:id/moments/available", async (req, res) => {
  const game = await getGame(req.params.id);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const engine = GameEngine.loadGame(game.state, game.universe);
  const available = engine.getAvailableMoments();

  return res.json(available);
});

/**
 * Get the active moment
 * GET /api/game/:id/moments/active
 */
router.get("/game/:id/moments/active", async (req, res) => {
  const game = await getGame(req.params.id);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const engine = GameEngine.loadGame(game.state, game.universe);
  const active = engine.getActiveMoment();

  if (!active) {
    return res.json(null);
  }

  return res.json(active);
});

/**
 * Get lived moments (history)
 * GET /api/game/:id/moments/history
 */
router.get("/game/:id/moments/history", async (req, res) => {
  const game = await getGame(req.params.id);
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const engine = GameEngine.loadGame(game.state, game.universe);
  const history = engine.getLivedMoments();

  return res.json(history);
});

/**
 * Run transitions manually
 * POST /api/game/:id/transitions/run
 */
router.post("/game/:id/transitions/run", async (req: AuthenticatedRequest, res) => {
  try {
    const game = await getGame(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const engine = GameEngine.loadGame(game.state, game.universe);
    const result = engine.runTransitions();

    // Update stored state
    await saveGame({ state: engine.getState(), universe: game.universe }, req.user?.id);

    return res.json({
      state: engine.getState(),
      aiConditions: result.aiConditions,
      executedExpressions: result.executedExpressions,
    });
  } catch (error) {
    console.error("Failed to run transitions:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to run transitions",
    });
  }
});

export { router as momentsRouter };
