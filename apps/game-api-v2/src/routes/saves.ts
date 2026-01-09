import { Router, type Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

// ============================================
// PLAY HISTORY
// ============================================

/**
 * Get user's play history
 * GET /api/saves/history
 */
router.get(
  "/history",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json([]);
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const { data: history, error, count } = await db
        .from("play_history")
        .select(`
          play_time_seconds,
          completed,
          last_played_at,
          universe:universes (
            id,
            name,
            description,
            theme,
            genre,
            difficulty,
            tags,
            like_count,
            play_count,
            is_premium,
            price_credits,
            published_at,
            creator:profiles!owner_id (
              id,
              username,
              display_name,
              avatar_url,
              is_verified
            )
          ),
          last_save:game_saves (
            id,
            name,
            slot,
            play_time_seconds,
            updated_at
          )
        `, { count: "exact" })
        .eq("user_id", userId)
        .order("last_played_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return res.json({
        history: history || [],
        total: count || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get play history error:", err);
      return res.status(500).json({ error: "Failed to get play history" });
    }
  }
);

/**
 * Update play history (called when starting/resuming a game)
 * POST /api/saves/history/:universeId
 */
router.post(
  "/history/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const { universeId } = req.params;
    const { saveId, playTimeSeconds, completed } = req.body;
    const userId = req.user!.id;

    try {
      // Check if entry exists
      const { data: existing } = await db
        .from("play_history")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .single();

      if (existing) {
        // Update existing entry
        const updateData: Record<string, unknown> = {
          last_played_at: new Date().toISOString(),
        };

        if (saveId !== undefined) updateData.last_save_id = saveId;
        if (playTimeSeconds !== undefined) {
          updateData.play_time_seconds = (existing.play_time_seconds || 0) + playTimeSeconds;
        }
        if (completed !== undefined) updateData.completed = completed;

        await db
          .from("play_history")
          .update(updateData)
          .eq("user_id", userId)
          .eq("universe_id", universeId);
      } else {
        // Create new entry
        await db.from("play_history").insert({
          user_id: userId,
          universe_id: universeId,
          last_save_id: saveId || null,
          play_time_seconds: playTimeSeconds || 0,
          completed: completed || false,
          last_played_at: new Date().toISOString(),
        });

        // Increment play count on universe (first play)
        await db.rpc("increment_play_count", { universe_id: universeId });
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("Update play history error:", err);
      return res.status(500).json({ error: "Failed to update play history" });
    }
  }
);

/**
 * Remove from play history
 * DELETE /api/saves/history/:universeId
 */
router.delete(
  "/history/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ deleted: true });
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      await db
        .from("play_history")
        .delete()
        .eq("user_id", userId)
        .eq("universe_id", universeId);

      return res.json({ deleted: true });
    } catch (err) {
      console.error("Remove from history error:", err);
      return res.status(500).json({ error: "Failed to remove from history" });
    }
  }
);

// ============================================
// GAME SAVES
// ============================================

/**
 * Get all saves for a universe
 * GET /api/saves/:universeId
 */
router.get(
  "/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json([]);
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      const { data: saves, error } = await db
        .from("game_saves")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .order("slot", { ascending: true });

      if (error) throw error;

      return res.json(saves || []);
    } catch (err) {
      console.error("Get saves error:", err);
      return res.status(500).json({ error: "Failed to get saves" });
    }
  }
);

/**
 * Get a specific save
 * GET /api/saves/:universeId/:slot
 */
router.get(
  "/:universeId/:slot",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(404).json({ error: "Save not found" });
    }

    const { universeId, slot } = req.params;
    const userId = req.user!.id;

    try {
      const { data: save, error } = await db
        .from("game_saves")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .eq("slot", parseInt(slot))
        .single();

      if (error || !save) {
        return res.status(404).json({ error: "Save not found" });
      }

      return res.json(save);
    } catch (err) {
      console.error("Get save error:", err);
      return res.status(500).json({ error: "Failed to get save" });
    }
  }
);

/**
 * Get the latest save for a universe (for resume functionality)
 * GET /api/saves/:universeId/latest
 */
router.get(
  "/:universeId/latest",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(404).json({ error: "No saves found" });
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      const { data: save, error } = await db
        .from("game_saves")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !save) {
        return res.status(404).json({ error: "No saves found" });
      }

      return res.json(save);
    } catch (err) {
      console.error("Get latest save error:", err);
      return res.status(500).json({ error: "Failed to get latest save" });
    }
  }
);

/**
 * Create or update a save
 * POST /api/saves/:universeId
 */
router.post(
  "/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { universeId } = req.params;
    const { slot = 0, name, state, universeVersion, playTimeSeconds } = req.body;
    const userId = req.user!.id;

    if (!state) {
      return res.status(400).json({ error: "Game state is required" });
    }

    try {
      // Check if save exists for this slot
      const { data: existing } = await db
        .from("game_saves")
        .select("id")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .eq("slot", slot)
        .single();

      let save;
      if (existing) {
        // Update existing save
        const { data, error } = await db
          .from("game_saves")
          .update({
            name: name || `Save ${slot}`,
            state,
            universe_version: universeVersion || 1,
            play_time_seconds: playTimeSeconds || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        save = data;
      } else {
        // Create new save
        const { data, error } = await db
          .from("game_saves")
          .insert({
            user_id: userId,
            universe_id: universeId,
            slot,
            name: name || (slot === 0 ? "Autosave" : `Save ${slot}`),
            state,
            universe_version: universeVersion || 1,
            play_time_seconds: playTimeSeconds || 0,
          })
          .select()
          .single();

        if (error) throw error;
        save = data;
      }

      // Update play history with this save
      await db
        .from("play_history")
        .upsert({
          user_id: userId,
          universe_id: universeId,
          last_save_id: save.id,
          last_played_at: new Date().toISOString(),
        }, { onConflict: "user_id,universe_id" });

      return res.json(save);
    } catch (err) {
      console.error("Save game error:", err);
      return res.status(500).json({ error: "Failed to save game" });
    }
  }
);

/**
 * Update a save
 * PUT /api/saves/:universeId/:slot
 */
router.put(
  "/:universeId/:slot",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { universeId, slot } = req.params;
    const { name, state, playTimeSeconds } = req.body;
    const userId = req.user!.id;

    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (name !== undefined) updateData.name = name;
      if (state !== undefined) updateData.state = state;
      if (playTimeSeconds !== undefined) updateData.play_time_seconds = playTimeSeconds;

      const { data: save, error } = await db
        .from("game_saves")
        .update(updateData)
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .eq("slot", parseInt(slot))
        .select()
        .single();

      if (error || !save) {
        return res.status(404).json({ error: "Save not found" });
      }

      return res.json(save);
    } catch (err) {
      console.error("Update save error:", err);
      return res.status(500).json({ error: "Failed to update save" });
    }
  }
);

/**
 * Delete a save
 * DELETE /api/saves/:universeId/:slot
 */
router.delete(
  "/:universeId/:slot",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ deleted: true });
    }

    const { universeId, slot } = req.params;
    const userId = req.user!.id;

    try {
      const { error } = await db
        .from("game_saves")
        .delete()
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .eq("slot", parseInt(slot));

      if (error) throw error;

      return res.json({ deleted: true });
    } catch (err) {
      console.error("Delete save error:", err);
      return res.status(500).json({ error: "Failed to delete save" });
    }
  }
);

/**
 * Delete all saves for a universe
 * DELETE /api/saves/:universeId
 */
router.delete(
  "/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ deleted: true });
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      const { error } = await db
        .from("game_saves")
        .delete()
        .eq("user_id", userId)
        .eq("universe_id", universeId);

      if (error) throw error;

      return res.json({ deleted: true });
    } catch (err) {
      console.error("Delete all saves error:", err);
      return res.status(500).json({ error: "Failed to delete saves" });
    }
  }
);

export { router as savesRouter };
