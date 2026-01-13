import { Router } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import { optionalAuth, type AuthenticatedRequest } from "../middleware/auth";

type Tables = Database["public"]["Tables"];
type UniverseRow = Tables["universes"]["Row"];
type ProfileRow = Tables["profiles"]["Row"];

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

const router = Router();

// Apply optional auth to all routes
router.use(optionalAuth);

/**
 * Marketplace universe item for listing
 */
interface MarketplaceUniverse {
  id: string;
  name: string;
  description: string;
  theme: string;
  genre: string | null;
  difficulty: string | null;
  tags: string[];
  like_count: number;
  play_count: number;
  comment_count: number;
  is_premium: boolean;
  price_credits: number;
  published_at: string | null;
  creator: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
}

/**
 * Transform database row to marketplace item
 */
function toMarketplaceUniverse(
  universe: Partial<UniverseRow>,
  profile?: Partial<ProfileRow> | null
): MarketplaceUniverse {
  return {
    id: universe.id || "",
    name: universe.name || "",
    description: universe.description || "",
    theme: universe.theme || "",
    genre: universe.genre || null,
    difficulty: universe.difficulty || null,
    tags: (universe.tags as string[]) || [],
    like_count: universe.like_count || 0,
    play_count: universe.play_count || 0,
    comment_count: universe.comment_count || 0,
    is_premium: universe.is_premium || false,
    price_credits: universe.price_credits || 0,
    published_at: universe.published_at || null,
    creator: profile
      ? {
          id: profile.id || "",
          username: profile.username || "",
          display_name: profile.display_name || null,
          avatar_url: profile.avatar_url || null,
          is_verified: profile.is_verified || false,
        }
      : null,
  };
}

// =============================================================================
// FEATURED UNIVERSES
// =============================================================================

/**
 * Get featured universes (manually curated or top-liked)
 * GET /api/marketplace/featured
 */
router.get("/featured", async (_req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    // Get featured universes (using is_featured on profiles or high like count)
    const { data, error } = await db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count,
        is_premium, price_credits, published_at, owner_id,
        profiles!universes_owner_id_fkey (
          id, username, display_name, avatar_url, is_verified, is_featured
        )
      `
      )
      .eq("visibility", "public")
      .eq("is_published", true)
      .order("like_count", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Failed to get featured universes:", error);
      return res.status(500).json({ error: "Failed to fetch featured universes" });
    }

    // Filter for featured creators first, then fall back to high likes
    const featured = (data || [])
      .sort((a: any, b: any) => {
        const aFeatured = a.profiles?.is_featured ? 1 : 0;
        const bFeatured = b.profiles?.is_featured ? 1 : 0;
        if (aFeatured !== bFeatured) return bFeatured - aFeatured;
        return (b.like_count || 0) - (a.like_count || 0);
      })
      .slice(0, 8)
      .map((u: any) => toMarketplaceUniverse(u, u.profiles));

    return res.json(featured);
  } catch (err) {
    console.error("Featured universes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// TRENDING UNIVERSES
// =============================================================================

/**
 * Get trending universes (recent engagement score)
 * GET /api/marketplace/trending
 */
router.get("/trending", async (_req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    // Get recently published universes with high engagement
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count,
        is_premium, price_credits, published_at, owner_id,
        profiles!universes_owner_id_fkey (
          id, username, display_name, avatar_url, is_verified
        )
      `
      )
      .eq("visibility", "public")
      .eq("is_published", true)
      .gte("published_at", oneWeekAgo.toISOString())
      .order("play_count", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Failed to get trending universes:", error);
      return res.status(500).json({ error: "Failed to fetch trending universes" });
    }

    const trending = (data || []).map((u: any) => toMarketplaceUniverse(u, u.profiles));

    return res.json(trending);
  } catch (err) {
    console.error("Trending universes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// NEW UNIVERSES
// =============================================================================

/**
 * Get newly published universes
 * GET /api/marketplace/new
 */
router.get("/new", async (_req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    const { data, error } = await db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count,
        is_premium, price_credits, published_at, owner_id,
        profiles!universes_owner_id_fkey (
          id, username, display_name, avatar_url, is_verified
        )
      `
      )
      .eq("visibility", "public")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Failed to get new universes:", error);
      return res.status(500).json({ error: "Failed to fetch new universes" });
    }

    const newUniverses = (data || []).map((u: any) => toMarketplaceUniverse(u, u.profiles));

    return res.json(newUniverses);
  } catch (err) {
    console.error("New universes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// TOP UNIVERSES
// =============================================================================

/**
 * Get top-rated universes (all-time highest liked)
 * GET /api/marketplace/top
 */
router.get("/top", async (_req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.json([]);
  }

  try {
    const { data, error } = await db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count,
        is_premium, price_credits, published_at, owner_id,
        profiles!universes_owner_id_fkey (
          id, username, display_name, avatar_url, is_verified
        )
      `
      )
      .eq("visibility", "public")
      .eq("is_published", true)
      .order("like_count", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to get top universes:", error);
      return res.status(500).json({ error: "Failed to fetch top universes" });
    }

    const topUniverses = (data || []).map((u: any) => toMarketplaceUniverse(u, u.profiles));

    return res.json(topUniverses);
  } catch (err) {
    console.error("Top universes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// SEARCH
// =============================================================================

/**
 * Search universes with filters
 * GET /api/marketplace/search
 *
 * Query params:
 * - q: search query (searches name, description)
 * - genre: filter by genre
 * - tags: comma-separated tags
 * - difficulty: easy, medium, hard, expert
 * - sort: newest, popular, likes, plays
 * - premium: true/false
 * - limit: number (default 20, max 50)
 * - offset: number (default 0)
 */
router.get("/search", async (req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({ results: [], total: 0 });
  }

  try {
    const {
      q,
      genre,
      tags,
      difficulty,
      sort = "popular",
      premium,
      limit = "20",
      offset = "0",
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 50);
    const offsetNum = parseInt(offset as string, 10) || 0;

    // Build query
    let query = db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count,
        is_premium, price_credits, published_at, owner_id,
        profiles!universes_owner_id_fkey (
          id, username, display_name, avatar_url, is_verified
        )
      `,
        { count: "exact" }
      )
      .eq("visibility", "public")
      .eq("is_published", true);

    // Text search
    if (q && typeof q === "string" && q.trim()) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Genre filter
    if (genre && typeof genre === "string") {
      query = query.eq("genre", genre);
    }

    // Difficulty filter
    if (difficulty && typeof difficulty === "string") {
      query = query.eq("difficulty", difficulty);
    }

    // Premium filter
    if (premium === "true") {
      query = query.eq("is_premium", true);
    } else if (premium === "false") {
      query = query.eq("is_premium", false);
    }

    // Tags filter (contains any of the tags)
    if (tags && typeof tags === "string") {
      const tagList = tags.split(",").map((t) => t.trim());
      query = query.contains("tags", tagList);
    }

    // Sorting
    switch (sort) {
      case "newest":
        query = query.order("published_at", { ascending: false });
        break;
      case "likes":
        query = query.order("like_count", { ascending: false });
        break;
      case "plays":
        query = query.order("play_count", { ascending: false });
        break;
      case "popular":
      default:
        // Popular = combination of plays and likes
        query = query.order("play_count", { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Search error:", error);
      return res.status(500).json({ error: "Search failed" });
    }

    const results = (data || []).map((u: any) => toMarketplaceUniverse(u, u.profiles));

    return res.json({
      results,
      total: count || 0,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// UNIVERSE DETAIL (public view)
// =============================================================================

/**
 * Get public universe detail
 * GET /api/marketplace/universe/:id
 */
router.get("/universe/:id", async (req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(404).json({ error: "Universe not found" });
  }

  try {
    const { data, error } = await db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count, bookmark_count,
        is_premium, price_credits, published_at,
        estimated_playtime_minutes, owner_id,
        profiles!universes_owner_id_fkey (
          id, username, display_name, avatar_url, bio, is_verified
        )
      `
      )
      .eq("id", req.params.id)
      .eq("visibility", "public")
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Universe not found" });
    }

    const universe = {
      ...toMarketplaceUniverse(data, data.profiles),
      bookmark_count: data.bookmark_count || 0,
      estimated_playtime_minutes: data.estimated_playtime_minutes,
    };

    // Check if current user has liked/bookmarked
    let userInteraction = { liked: false, bookmarked: false };
    if (req.user?.id) {
      const [likeResult, bookmarkResult] = await Promise.all([
        db
          .from("likes")
          .select("id")
          .eq("user_id", req.user.id)
          .eq("target_type", "universe")
          .eq("target_id", req.params.id)
          .single(),
        db
          .from("bookmarks")
          .select("id")
          .eq("user_id", req.user.id)
          .eq("universe_id", req.params.id)
          .single(),
      ]);

      userInteraction = {
        liked: !!likeResult.data,
        bookmarked: !!bookmarkResult.data,
      };
    }

    return res.json({
      ...universe,
      userInteraction,
    });
  } catch (err) {
    console.error("Universe detail error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// CREATOR PROFILE (public view)
// =============================================================================

/**
 * Get creator profile with their public universes
 * GET /api/marketplace/creator/:username
 */
router.get("/creator/:username", async (req: AuthenticatedRequest, res) => {
  if (!isSupabaseConfigured()) {
    return res.status(404).json({ error: "Creator not found" });
  }

  try {
    // Get profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, website, is_verified, is_featured, created_at")
      .eq("username", req.params.username)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: "Creator not found" });
    }

    // Get their public universes
    const { data: universes, error: universesError } = await db
      .from("universes")
      .select(
        `
        id, name, description, theme, genre, difficulty, tags,
        like_count, play_count, comment_count,
        is_premium, price_credits, published_at
      `
      )
      .eq("owner_id", profile.id)
      .eq("visibility", "public")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (universesError) {
      console.error("Failed to get creator universes:", universesError);
    }

    // Get follower count
    const { count: followerCount } = await db
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profile.id);

    // Check if current user follows this creator
    let isFollowing = false;
    if (req.user?.id && req.user.id !== profile.id) {
      const { data: followData } = await db
        .from("follows")
        .select("follower_id")
        .eq("follower_id", req.user.id)
        .eq("following_id", profile.id)
        .single();
      isFollowing = !!followData;
    }

    return res.json({
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        website: profile.website,
        is_verified: profile.is_verified,
        is_featured: profile.is_featured,
        created_at: profile.created_at,
        follower_count: followerCount || 0,
      },
      universes: (universes || []).map((u: any) => toMarketplaceUniverse(u, null)),
      isFollowing,
    });
  } catch (err) {
    console.error("Creator profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// GENRES
// =============================================================================

/**
 * Get list of available genres
 * GET /api/marketplace/genres
 */
router.get("/genres", async (_req: AuthenticatedRequest, res) => {
  // Static list of genres for now
  const genres = [
    { id: "fantasy", name: "Fantasy", icon: "🧙" },
    { id: "sci-fi", name: "Sci-Fi", icon: "🚀" },
    { id: "horror", name: "Horror", icon: "👻" },
    { id: "mystery", name: "Mystery", icon: "🔍" },
    { id: "romance", name: "Romance", icon: "💕" },
    { id: "adventure", name: "Adventure", icon: "⚔️" },
    { id: "comedy", name: "Comedy", icon: "😄" },
    { id: "drama", name: "Drama", icon: "🎭" },
    { id: "historical", name: "Historical", icon: "📜" },
    { id: "slice-of-life", name: "Slice of Life", icon: "☕" },
  ];

  return res.json(genres);
});

export { router as marketplaceRouter };
