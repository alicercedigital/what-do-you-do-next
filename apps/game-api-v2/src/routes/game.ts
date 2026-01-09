import { Router } from "express";
import type { v2 } from "@wdydn/shared";
type Universe = v2.Universe;
import { GameEngine } from "../engine";
import {
  getGame,
  saveGame,
  deleteGame,
  getUniverse,
  saveUniverse,
  deleteUniverse,
  getUniverseSummaries,
  getAllGames,
} from "../storage";
import {
  optionalAuth,
  type AuthenticatedRequest,
} from "../middleware/auth";

const router = Router();

// Apply optional auth to all routes - allows both authenticated and anonymous access
router.use(optionalAuth);

/**
 * Register a universe (for testing/development)
 * POST /api/universe
 */
router.post("/universe", async (req: AuthenticatedRequest, res) => {
  try {
    const universe: Universe = req.body;

    if (!universe.id) {
      return res.status(400).json({ error: "Universe ID is required" });
    }

    await saveUniverse(universe, req.user?.id);

    return res.json({
      success: true,
      universeId: universe.id,
    });
  } catch (error) {
    console.error("Failed to register universe:", error);
    return res.status(500).json({ error: "Failed to register universe" });
  }
});

/**
 * Get a universe
 * GET /api/universe/:id
 */
router.get("/universe/:id", async (req, res) => {
  const universe = await getUniverse(req.params.id);

  if (!universe) {
    return res.status(404).json({ error: "Universe not found" });
  }

  return res.json(universe);
});

/**
 * List all universes
 * GET /api/universes
 */
router.get("/universes", async (req: AuthenticatedRequest, res) => {
  const list = await getUniverseSummaries(req.user?.id);
  return res.json(list);
});

/**
 * Update a universe
 * PUT /api/universe/:id
 */
router.put("/universe/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const existingUniverse = await getUniverse(req.params.id);

    if (!existingUniverse) {
      return res.status(404).json({ error: "Universe not found" });
    }

    const universe: Universe = req.body;

    if (universe.id !== req.params.id) {
      return res.status(400).json({ error: "Universe ID mismatch" });
    }

    await saveUniverse(universe, req.user?.id);

    return res.json({
      success: true,
      universeId: universe.id,
    });
  } catch (error) {
    console.error("Failed to update universe:", error);
    return res.status(500).json({ error: "Failed to update universe" });
  }
});

/**
 * Delete a universe
 * DELETE /api/universe/:id
 */
router.delete("/universe/:id", async (req, res) => {
  try {
    const existed = await deleteUniverse(req.params.id);

    return res.json({
      success: existed,
    });
  } catch (error) {
    console.error("Failed to delete universe:", error);
    return res.status(500).json({ error: "Failed to delete universe" });
  }
});

/**
 * Duplicate a universe
 * POST /api/universe/:id/duplicate
 */
router.post("/universe/:id/duplicate", async (req: AuthenticatedRequest, res) => {
  try {
    const sourceUniverse = await getUniverse(req.params.id);

    if (!sourceUniverse) {
      return res.status(404).json({ error: "Universe not found" });
    }

    // Deep clone the universe
    const newUniverse: Universe = JSON.parse(JSON.stringify(sourceUniverse));

    // Generate new ID and update name
    newUniverse.id = `${sourceUniverse.id}-copy-${Date.now()}`;
    newUniverse.name = `${sourceUniverse.name} (Copy)`;
    newUniverse.version = 1;

    await saveUniverse(newUniverse, req.user?.id);

    return res.json({
      success: true,
      universeId: newUniverse.id,
    });
  } catch (error) {
    console.error("Failed to duplicate universe:", error);
    return res.status(500).json({ error: "Failed to duplicate universe" });
  }
});

/**
 * Create a new game
 * POST /api/game/create
 */
router.post("/game/create", async (req: AuthenticatedRequest, res) => {
  try {
    const { universeId, characterId } = req.body;

    const universe = await getUniverse(universeId);
    if (!universe) {
      return res.status(404).json({ error: "Universe not found" });
    }

    const engine = GameEngine.createGame({
      universe,
      playerId: characterId,
    });

    const state = engine.getState();

    // Store the game
    await saveGame({ state, universe }, req.user?.id);

    return res.json({
      gameId: state.id,
      state,
    });
  } catch (error) {
    console.error("Failed to create game:", error);
    return res.status(500).json({ error: "Failed to create game" });
  }
});

/**
 * Get game state
 * GET /api/game/:id
 */
router.get("/game/:id", async (req, res) => {
  const game = await getGame(req.params.id);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  return res.json({
    state: game.state,
    universe: game.universe,
  });
});

/**
 * Save game state
 * PUT /api/game/:id/save
 */
router.put("/game/:id/save", async (req: AuthenticatedRequest, res) => {
  const game = await getGame(req.params.id);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const engine = GameEngine.loadGame(game.state, game.universe);
  const savedState = engine.save();

  await saveGame({ state: savedState, universe: game.universe }, req.user?.id);

  return res.json({
    success: true,
    savedAt: savedState.savedAt,
  });
});

/**
 * Delete a game
 * DELETE /api/game/:id
 */
router.delete("/game/:id", async (req, res) => {
  const existed = await deleteGame(req.params.id);

  return res.json({
    success: existed,
  });
});

/**
 * List all games
 * GET /api/games
 */
router.get("/games", async (req: AuthenticatedRequest, res) => {
  const list = (await getAllGames(req.user?.id)).map(({ state }) => ({
    id: state.id,
    universeId: state.universeId,
    createdAt: state.createdAt,
    savedAt: state.savedAt,
  }));

  return res.json(list);
});

export { router as gameRouter };
