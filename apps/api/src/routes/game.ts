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
  getUniverseWithMetadata,
  publishUniverse,
  unpublishUniverse,
  updateUniverseVisibility,
  getUniverseVersions,
  createUniverseVersion,
  getUniverseVersion,
} from "../storage";
import { requireAuth } from "../middleware/auth";
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

// =============================================================================
// UNIVERSE METADATA & PUBLISHING
// =============================================================================

/**
 * Get universe with metadata
 * GET /api/universe/:id/metadata
 */
router.get("/universe/:id/metadata", async (req: AuthenticatedRequest, res) => {
  const metadata = await getUniverseWithMetadata(req.params.id);

  if (!metadata) {
    return res.status(404).json({ error: "Universe not found" });
  }

  // Check if user can view this universe
  const isOwner = req.user?.id === metadata.owner_id;
  const isPublic = metadata.visibility === "public" && metadata.is_published;

  if (!isOwner && !isPublic) {
    return res.status(403).json({ error: "Not authorized to view this universe" });
  }

  return res.json({
    ...metadata,
    isOwner,
  });
});

/**
 * Publish a universe
 * POST /api/universe/:id/publish
 */
router.post("/universe/:id/publish", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const result = await publishUniverse(req.params.id, req.user.id);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true });
});

/**
 * Unpublish a universe
 * POST /api/universe/:id/unpublish
 */
router.post("/universe/:id/unpublish", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const result = await unpublishUniverse(req.params.id, req.user.id);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true });
});

/**
 * Update universe visibility
 * PUT /api/universe/:id/visibility
 */
router.put("/universe/:id/visibility", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { visibility } = req.body;

  if (!visibility || !["private", "unlisted", "public"].includes(visibility)) {
    return res.status(400).json({ error: "Invalid visibility value" });
  }

  const result = await updateUniverseVisibility(req.params.id, req.user.id, visibility);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true });
});

// =============================================================================
// UNIVERSE VERSIONING
// =============================================================================

/**
 * Get version history
 * GET /api/universe/:id/versions
 */
router.get("/universe/:id/versions", async (req: AuthenticatedRequest, res) => {
  const metadata = await getUniverseWithMetadata(req.params.id);

  if (!metadata) {
    return res.status(404).json({ error: "Universe not found" });
  }

  // Check if user can view versions
  const isOwner = req.user?.id === metadata.owner_id;
  const isPublic = metadata.visibility === "public" && metadata.is_published;

  if (!isOwner && !isPublic) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const versions = await getUniverseVersions(req.params.id);
  return res.json(versions);
});

/**
 * Create a new version
 * POST /api/universe/:id/version
 */
router.post("/universe/:id/version", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { changelog } = req.body;
  const result = await createUniverseVersion(req.params.id, req.user.id, changelog);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true, version: result.version });
});

/**
 * Get a specific version
 * GET /api/universe/:id/version/:version
 */
router.get("/universe/:id/version/:version", async (req: AuthenticatedRequest, res) => {
  const metadata = await getUniverseWithMetadata(req.params.id);

  if (!metadata) {
    return res.status(404).json({ error: "Universe not found" });
  }

  // Check if user can view this version
  const isOwner = req.user?.id === metadata.owner_id;
  const isPublic = metadata.visibility === "public" && metadata.is_published;

  if (!isOwner && !isPublic) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const versionNum = parseInt(req.params.version, 10);
  if (isNaN(versionNum)) {
    return res.status(400).json({ error: "Invalid version number" });
  }

  const universe = await getUniverseVersion(req.params.id, versionNum);

  if (!universe) {
    return res.status(404).json({ error: "Version not found" });
  }

  return res.json(universe);
});

// =============================================================================
// EXPORT / IMPORT
// =============================================================================

/**
 * Export a universe as JSON
 * GET /api/universe/:id/export
 */
router.get("/universe/:id/export", async (req: AuthenticatedRequest, res) => {
  const metadata = await getUniverseWithMetadata(req.params.id);

  if (!metadata) {
    return res.status(404).json({ error: "Universe not found" });
  }

  // Check if user can export this universe
  const isOwner = req.user?.id === metadata.owner_id;
  const isPublic = metadata.visibility === "public" && metadata.is_published;

  if (!isOwner && !isPublic) {
    return res.status(403).json({ error: "Not authorized to export this universe" });
  }

  const universe = await getUniverse(req.params.id);

  if (!universe) {
    return res.status(404).json({ error: "Universe not found" });
  }

  // Return as downloadable JSON
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${universe.name.replace(/[^a-z0-9]/gi, "_")}.json"`
  );

  return res.json({
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    universe,
  });
});

/**
 * Import a universe from JSON
 * POST /api/universe/import
 */
router.post("/universe/import", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { universe: importedUniverse } = req.body;

    if (!importedUniverse) {
      return res.status(400).json({ error: "No universe data provided" });
    }

    if (!importedUniverse.id || !importedUniverse.name) {
      return res.status(400).json({ error: "Invalid universe data" });
    }

    // Generate new ID to avoid conflicts
    const newUniverse: Universe = {
      ...importedUniverse,
      id: `${importedUniverse.id}-import-${Date.now()}`,
      name: `${importedUniverse.name} (Imported)`,
      version: 1,
    };

    await saveUniverse(newUniverse, req.user.id);

    return res.json({
      success: true,
      universeId: newUniverse.id,
      message: `Imported universe "${newUniverse.name}"`,
    });
  } catch (error) {
    console.error("Failed to import universe:", error);
    return res.status(500).json({ error: "Failed to import universe" });
  }
});

export { router as gameRouter };
