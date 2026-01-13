import { Router, type Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

/**
 * Get creator's overview stats
 * GET /api/analytics/overview
 */
router.get(
  "/overview",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({
        totalLikes: 0,
        totalPlays: 0,
        totalFollowers: 0,
        totalUniverses: 0,
      });
    }

    const userId = req.user!.id;

    try {
      // Get aggregate stats from all universes
      const { data: universes } = await db
        .from("universes")
        .select("like_count, play_count")
        .eq("owner_id", userId)
        .eq("is_published", true);

      const totalLikes = universes?.reduce((sum: number, u: { like_count: number }) => sum + u.like_count, 0) || 0;
      const totalPlays = universes?.reduce((sum: number, u: { play_count: number }) => sum + u.play_count, 0) || 0;
      const totalUniverses = universes?.length || 0;

      // Get follower count
      const { count: totalFollowers } = await db
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      return res.json({
        totalLikes,
        totalPlays,
        totalFollowers: totalFollowers || 0,
        totalUniverses,
      });
    } catch (err) {
      console.error("Get overview error:", err);
      return res.status(500).json({ error: "Failed to get overview" });
    }
  }
);

/**
 * Get per-universe stats
 * GET /api/analytics/universes
 */
router.get(
  "/universes",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json([]);
    }

    const userId = req.user!.id;
    const sortBy = (req.query.sort as string) || "plays";
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      let query = db
        .from("universes")
        .select(`
          id,
          name,
          description,
          theme,
          like_count,
          play_count,
          comment_count,
          bookmark_count,
          is_published,
          visibility,
          published_at,
          created_at
        `)
        .eq("owner_id", userId);

      // Sort based on parameter
      switch (sortBy) {
        case "likes":
          query = query.order("like_count", { ascending: false });
          break;
        case "comments":
          query = query.order("comment_count", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "plays":
        default:
          query = query.order("play_count", { ascending: false });
          break;
      }

      const { data: universes, error } = await query.limit(limit);

      if (error) throw error;

      return res.json(universes || []);
    } catch (err) {
      console.error("Get universe stats error:", err);
      return res.status(500).json({ error: "Failed to get universe stats" });
    }
  }
);

/**
 * Get detailed stats for a specific universe
 * GET /api/analytics/universe/:id
 */
router.get(
  "/universe/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json(null);
    }

    const { id } = req.params;
    const userId = req.user!.id;

    try {
      // Get universe with owner check
      const { data: universe, error } = await db
        .from("universes")
        .select(`
          id,
          name,
          description,
          theme,
          like_count,
          play_count,
          comment_count,
          bookmark_count,
          is_published,
          visibility,
          published_at,
          created_at
        `)
        .eq("id", id)
        .eq("owner_id", userId)
        .single();

      if (error || !universe) {
        return res.status(404).json({ error: "Universe not found" });
      }

      // Get recent activity (comments, likes)
      const { data: recentComments } = await db
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user:profiles!user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("target_type", "universe")
        .eq("target_id", id)
        .order("created_at", { ascending: false })
        .limit(5);

      return res.json({
        ...universe,
        recentComments: recentComments || [],
      });
    } catch (err) {
      console.error("Get universe detail error:", err);
      return res.status(500).json({ error: "Failed to get universe details" });
    }
  }
);

/**
 * Get recent activity feed for creator
 * GET /api/analytics/activity
 */
router.get(
  "/activity",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json([]);
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
      // Get recent notifications for this user (as receiver)
      const { data: activity, error } = await db
        .from("notifications")
        .select(`
          id,
          type,
          target_type,
          target_id,
          data,
          created_at,
          actor:profiles!actor_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .in("type", ["like", "comment", "follow", "tip"])
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return res.json(activity || []);
    } catch (err) {
      console.error("Get activity error:", err);
      return res.status(500).json({ error: "Failed to get activity" });
    }
  }
);

/**
 * Get trending stats over time (simplified - last 7 days aggregates)
 * GET /api/analytics/trends
 */
router.get(
  "/trends",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({
        period: "7d",
        likes: 0,
        plays: 0,
        comments: 0,
        followers: 0,
      });
    }

    const userId = req.user!.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      // Count recent likes on user's universes
      const { data: userUniverses } = await db
        .from("universes")
        .select("id")
        .eq("owner_id", userId);

      const universeIds = userUniverses?.map((u: { id: string }) => u.id) || [];

      let recentLikes = 0;
      let recentComments = 0;

      if (universeIds.length > 0) {
        const { count: likesCount } = await db
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("target_type", "universe")
          .in("target_id", universeIds)
          .gte("created_at", sevenDaysAgo.toISOString());

        recentLikes = likesCount || 0;

        const { count: commentsCount } = await db
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("target_type", "universe")
          .in("target_id", universeIds)
          .gte("created_at", sevenDaysAgo.toISOString());

        recentComments = commentsCount || 0;
      }

      // Count recent followers
      const { count: recentFollowers } = await db
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId)
        .gte("created_at", sevenDaysAgo.toISOString());

      // Count recent plays (from play_history)
      let recentPlays = 0;
      if (universeIds.length > 0) {
        const { count: playsCount } = await db
          .from("play_history")
          .select("*", { count: "exact", head: true })
          .in("universe_id", universeIds)
          .gte("last_played_at", sevenDaysAgo.toISOString());

        recentPlays = playsCount || 0;
      }

      return res.json({
        period: "7d",
        likes: recentLikes,
        plays: recentPlays,
        comments: recentComments,
        followers: recentFollowers || 0,
      });
    } catch (err) {
      console.error("Get trends error:", err);
      return res.status(500).json({ error: "Failed to get trends" });
    }
  }
);

export { router as analyticsRouter };
