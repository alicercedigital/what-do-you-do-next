import { Router } from "express";
import type { v2 } from "@wdydn/shared";
type Universe = v2.Universe;
import { GameEngine } from "../engine";
import {
  games,
  universes,
  getGame,
  saveGame,
  deleteGame,
  getUniverse,
  saveUniverse,
  deleteUniverse,
  getAllUniverses,
  getAllGames,
} from "../storage";

const router = Router();

/**
 * Register a universe (for testing/development)
 * POST /api/universe
 */
router.post("/universe", (req, res) => {
  try {
    const universe: Universe = req.body;

    if (!universe.id) {
      return res.status(400).json({ error: "Universe ID is required" });
    }

    saveUniverse(universe);

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
router.get("/universe/:id", (req, res) => {
  const universe = getUniverse(req.params.id);

  if (!universe) {
    return res.status(404).json({ error: "Universe not found" });
  }

  return res.json(universe);
});

/**
 * List all universes
 * GET /api/universes
 */
router.get("/universes", (_req, res) => {
  const list = getAllUniverses().map((u) => ({
    id: u.id,
    name: u.name,
    description: u.description,
    theme: u.theme,
  }));

  return res.json(list);
});

/**
 * Update a universe
 * PUT /api/universe/:id
 */
router.put("/universe/:id", (req, res) => {
  try {
    const existingUniverse = getUniverse(req.params.id);

    if (!existingUniverse) {
      return res.status(404).json({ error: "Universe not found" });
    }

    const universe: Universe = req.body;

    if (universe.id !== req.params.id) {
      return res.status(400).json({ error: "Universe ID mismatch" });
    }

    saveUniverse(universe);

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
router.delete("/universe/:id", (req, res) => {
  try {
    const existed = deleteUniverse(req.params.id);

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
router.post("/universe/:id/duplicate", (req, res) => {
  try {
    const sourceUniverse = getUniverse(req.params.id);

    if (!sourceUniverse) {
      return res.status(404).json({ error: "Universe not found" });
    }

    // Deep clone the universe
    const newUniverse: Universe = JSON.parse(JSON.stringify(sourceUniverse));

    // Generate new ID and update name
    newUniverse.id = `${sourceUniverse.id}-copy-${Date.now()}`;
    newUniverse.name = `${sourceUniverse.name} (Copy)`;
    newUniverse.version = 1;

    saveUniverse(newUniverse);

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
router.post("/game/create", (req, res) => {
  try {
    const { universeId, characterId } = req.body;

    const universe = getUniverse(universeId);
    if (!universe) {
      return res.status(404).json({ error: "Universe not found" });
    }

    const engine = GameEngine.createGame({
      universe,
      playerId: characterId,
    });

    const state = engine.getState();

    // Store the game
    saveGame({ state, universe });

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
router.get("/game/:id", (req, res) => {
  const game = getGame(req.params.id);

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
router.put("/game/:id/save", (req, res) => {
  const game = getGame(req.params.id);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const engine = GameEngine.loadGame(game.state, game.universe);
  const savedState = engine.save();

  saveGame({ state: savedState, universe: game.universe });

  return res.json({
    success: true,
    savedAt: savedState.savedAt,
  });
});

/**
 * Delete a game
 * DELETE /api/game/:id
 */
router.delete("/game/:id", (req, res) => {
  const existed = deleteGame(req.params.id);

  return res.json({
    success: existed,
  });
});

/**
 * List all games
 * GET /api/games
 */
router.get("/games", (_req, res) => {
  const list = getAllGames().map(({ state }) => ({
    id: state.id,
    universeId: state.universeId,
    createdAt: state.createdAt,
    savedAt: state.savedAt,
  }));

  return res.json(list);
});

export { router as gameRouter };
