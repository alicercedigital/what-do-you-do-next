import { Router, Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

const router = Router();

/**
 * Badge definitions with thresholds
 */
const BADGE_DEFINITIONS = {
  // Universe count badges
  first_universe: {
    name: "First Steps",
    description: "Published your first universe",
    icon: "rocket",
    category: "creator",
    threshold: { universes: 1 },
  },
  prolific_creator: {
    name: "Prolific Creator",
    description: "Published 5 universes",
    icon: "books",
    category: "creator",
    threshold: { universes: 5 },
  },
  master_creator: {
    name: "Master Creator",
    description: "Published 20 universes",
    icon: "crown",
    category: "creator",
    threshold: { universes: 20 },
  },

  // Play count badges
  popular_100: {
    name: "Getting Popular",
    description: "Your universes reached 100 total plays",
    icon: "star",
    category: "popularity",
    threshold: { plays: 100 },
  },
  popular_1000: {
    name: "Rising Star",
    description: "Your universes reached 1,000 total plays",
    icon: "trending-up",
    category: "popularity",
    threshold: { plays: 1000 },
  },
  popular_10000: {
    name: "Community Favorite",
    description: "Your universes reached 10,000 total plays",
    icon: "trophy",
    category: "popularity",
    threshold: { plays: 10000 },
  },

  // Like badges
  liked_50: {
    name: "Appreciated",
    description: "Received 50 likes across your universes",
    icon: "heart",
    category: "engagement",
    threshold: { likes: 50 },
  },
  liked_500: {
    name: "Beloved",
    description: "Received 500 likes across your universes",
    icon: "hearts",
    category: "engagement",
    threshold: { likes: 500 },
  },

  // Follower badges
  followers_10: {
    name: "Building an Audience",
    description: "Gained 10 followers",
    icon: "users",
    category: "community",
    threshold: { followers: 10 },
  },
  followers_100: {
    name: "Influencer",
    description: "Gained 100 followers",
    icon: "users-plus",
    category: "community",
    threshold: { followers: 100 },
  },

  // Special badges (manually assigned)
  verified_creator: {
    name: "Verified Creator",
    description: "Verified content creator",
    icon: "badge-check",
    category: "special",
    threshold: null, // Manual assignment only
  },
  early_adopter: {
    name: "Early Adopter",
    description: "Joined during the beta period",
    icon: "zap",
    category: "special",
    threshold: null,
  },
} as const;

type BadgeId = keyof typeof BADGE_DEFINITIONS;

/**
 * Get all badges for a user
 * GET /api/badges/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ badges: [], available: Object.keys(BADGE_DEFINITIONS) });
  }

  try {
    const { data: badges, error } = await db
      .from("user_badges")
      .select("*")
      .eq("user_id", req.params.userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch badges:", error);
      return res.status(500).json({ error: "Failed to fetch badges" });
    }

    // Enrich with badge definitions
    const enrichedBadges = (badges || []).map((badge: { badge_id: string; earned_at: string }) => ({
      ...BADGE_DEFINITIONS[badge.badge_id as BadgeId],
      id: badge.badge_id,
      earnedAt: badge.earned_at,
    }));

    return res.json({
      badges: enrichedBadges,
      available: Object.keys(BADGE_DEFINITIONS),
    });
  } catch (err) {
    console.error("Badges fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get my badges
 * GET /api/badges/me
 */
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured() || !req.user?.id) {
    return res.json({ badges: [], newBadges: [] });
  }

  try {
    // Fetch current badges
    const { data: badges } = await db
      .from("user_badges")
      .select("*")
      .eq("user_id", req.user.id);

    const earnedBadgeIds = new Set((badges || []).map((b: { badge_id: string }) => b.badge_id));

    // Fetch user stats to check for new badges
    const stats = await getUserStats(req.user.id);

    // Check for newly earned badges
    const newBadges: BadgeId[] = [];

    for (const [badgeId, definition] of Object.entries(BADGE_DEFINITIONS)) {
      if (earnedBadgeIds.has(badgeId)) continue;
      if (!definition.threshold) continue;

      const threshold = definition.threshold;
      let earned = false;

      if ("universes" in threshold && stats.universeCount >= threshold.universes) {
        earned = true;
      }
      if ("plays" in threshold && stats.totalPlays >= threshold.plays) {
        earned = true;
      }
      if ("likes" in threshold && stats.totalLikes >= threshold.likes) {
        earned = true;
      }
      if ("followers" in threshold && stats.followerCount >= threshold.followers) {
        earned = true;
      }

      if (earned) {
        newBadges.push(badgeId as BadgeId);
      }
    }

    // Award new badges
    if (newBadges.length > 0) {
      const badgeInserts = newBadges.map((badgeId) => ({
        user_id: req.user!.id,
        badge_id: badgeId,
      }));

      await db.from("user_badges").insert(badgeInserts);
    }

    // Fetch updated badges
    const { data: updatedBadges } = await db
      .from("user_badges")
      .select("*")
      .eq("user_id", req.user.id)
      .order("earned_at", { ascending: false });

    const enrichedBadges = (updatedBadges || []).map((badge: { badge_id: string; earned_at: string }) => ({
      ...BADGE_DEFINITIONS[badge.badge_id as BadgeId],
      id: badge.badge_id,
      earnedAt: badge.earned_at,
    }));

    const enrichedNewBadges = newBadges.map((badgeId) => ({
      ...BADGE_DEFINITIONS[badgeId],
      id: badgeId,
    }));

    return res.json({
      badges: enrichedBadges,
      newBadges: enrichedNewBadges,
    });
  } catch (err) {
    console.error("Badges check error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get badge definitions
 * GET /api/badges/definitions
 */
router.get("/definitions", (_req, res) => {
  const definitions = Object.entries(BADGE_DEFINITIONS).map(([id, def]) => ({
    id,
    ...def,
  }));

  return res.json({ definitions });
});

/**
 * Check and award badges (called after actions that might earn badges)
 * POST /api/badges/check
 */
router.post("/check", requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured() || !req.user?.id) {
    return res.json({ newBadges: [] });
  }

  try {
    // Fetch current badges
    const { data: badges } = await db
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", req.user.id);

    const earnedBadgeIds = new Set((badges || []).map((b: { badge_id: string }) => b.badge_id));

    // Fetch user stats
    const stats = await getUserStats(req.user.id);

    // Check for newly earned badges
    const newBadges: BadgeId[] = [];

    for (const [badgeId, definition] of Object.entries(BADGE_DEFINITIONS)) {
      if (earnedBadgeIds.has(badgeId)) continue;
      if (!definition.threshold) continue;

      const threshold = definition.threshold;
      let earned = false;

      if ("universes" in threshold && stats.universeCount >= threshold.universes) {
        earned = true;
      }
      if ("plays" in threshold && stats.totalPlays >= threshold.plays) {
        earned = true;
      }
      if ("likes" in threshold && stats.totalLikes >= threshold.likes) {
        earned = true;
      }
      if ("followers" in threshold && stats.followerCount >= threshold.followers) {
        earned = true;
      }

      if (earned) {
        newBadges.push(badgeId as BadgeId);
      }
    }

    // Award new badges
    if (newBadges.length > 0) {
      const badgeInserts = newBadges.map((badgeId) => ({
        user_id: req.user!.id,
        badge_id: badgeId,
      }));

      await db.from("user_badges").insert(badgeInserts);

      // Create notifications for new badges
      const notifications = newBadges.map((badgeId) => ({
        user_id: req.user!.id,
        type: "badge_earned",
        data: {
          badge_id: badgeId,
          badge_name: BADGE_DEFINITIONS[badgeId].name,
        },
      }));

      await db.from("notifications").insert(notifications);
    }

    const enrichedNewBadges = newBadges.map((badgeId) => ({
      ...BADGE_DEFINITIONS[badgeId],
      id: badgeId,
    }));

    return res.json({ newBadges: enrichedNewBadges });
  } catch (err) {
    console.error("Badge check error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Helper: Get user stats for badge calculation
 */
async function getUserStats(userId: string) {
  // Get universe stats
  const { data: universes } = await db
    .from("universes")
    .select("play_count, like_count")
    .eq("owner_id", userId)
    .eq("is_published", true);

  const universeCount = universes?.length ?? 0;
  const totalPlays = universes?.reduce((sum: number, u: { play_count: number }) => sum + u.play_count, 0) ?? 0;
  const totalLikes = universes?.reduce((sum: number, u: { like_count: number }) => sum + u.like_count, 0) ?? 0;

  // Get follower count
  const { count: followerCount } = await db
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  return {
    universeCount,
    totalPlays,
    totalLikes,
    followerCount: followerCount ?? 0,
  };
}

export { router as badgesRouter };
