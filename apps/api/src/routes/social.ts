import { Router, type Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

// ============================================
// LIKES
// ============================================

/**
 * Toggle like on a target (universe, shared_content, or comment)
 * POST /api/social/like/:targetType/:targetId
 */
router.post(
  "/like/:targetType/:targetId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { targetType, targetId } = req.params;
    const userId = req.user!.id;

    const validTypes = ["universe", "shared_content", "comment"];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ error: "Invalid target type" });
    }

    try {
      // Check if already liked
      const { data: existingLike } = await db
        .from("likes")
        .select("*")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .single();

      if (existingLike) {
        // Unlike
        await db
          .from("likes")
          .delete()
          .eq("user_id", userId)
          .eq("target_type", targetType)
          .eq("target_id", targetId);

        // Update like count on target
        if (targetType === "universe") {
          await db.rpc("decrement_like_count", { universe_id: targetId });
        } else if (targetType === "comment") {
          await db.rpc("decrement_comment_like_count", { comment_id: targetId });
        }

        return res.json({ liked: false });
      } else {
        // Like
        await db.from("likes").insert({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
        });

        // Update like count on target
        if (targetType === "universe") {
          await db.rpc("increment_like_count", { universe_id: targetId });
        } else if (targetType === "comment") {
          await db.rpc("increment_comment_like_count", { comment_id: targetId });
        }

        // Create notification for universe owner (if liking universe)
        if (targetType === "universe") {
          const { data: universe } = await db
            .from("universes")
            .select("owner_id, name")
            .eq("id", targetId)
            .single();

          if (universe && universe.owner_id !== userId) {
            await db.from("notifications").insert({
              user_id: universe.owner_id,
              type: "like",
              actor_id: userId,
              target_type: targetType,
              target_id: targetId,
              data: { universe_name: universe.name },
            });
          }
        }

        return res.json({ liked: true });
      }
    } catch (err) {
      console.error("Like toggle error:", err);
      return res.status(500).json({ error: "Failed to toggle like" });
    }
  }
);

/**
 * Check if user has liked a target
 * GET /api/social/like/:targetType/:targetId
 */
router.get(
  "/like/:targetType/:targetId",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ liked: false });
    }

    const { targetType, targetId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ liked: false });
    }

    try {
      const { data: existingLike } = await db
        .from("likes")
        .select("*")
        .eq("user_id", userId)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .single();

      return res.json({ liked: !!existingLike });
    } catch {
      return res.json({ liked: false });
    }
  }
);

// ============================================
// BOOKMARKS
// ============================================

/**
 * Toggle bookmark on a universe
 * POST /api/social/bookmark/:universeId
 */
router.post(
  "/bookmark/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      // Check if already bookmarked
      const { data: existingBookmark } = await db
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .single();

      if (existingBookmark) {
        // Remove bookmark
        await db
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("universe_id", universeId);

        // Update bookmark count
        await db.rpc("decrement_bookmark_count", { universe_id: universeId });

        return res.json({ bookmarked: false });
      } else {
        // Add bookmark
        await db.from("bookmarks").insert({
          user_id: userId,
          universe_id: universeId,
        });

        // Update bookmark count
        await db.rpc("increment_bookmark_count", { universe_id: universeId });

        return res.json({ bookmarked: true });
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
      return res.status(500).json({ error: "Failed to toggle bookmark" });
    }
  }
);

/**
 * Check if user has bookmarked a universe
 * GET /api/social/bookmark/:universeId
 */
router.get(
  "/bookmark/:universeId",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ bookmarked: false });
    }

    const { universeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ bookmarked: false });
    }

    try {
      const { data: existingBookmark } = await db
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .single();

      return res.json({ bookmarked: !!existingBookmark });
    } catch {
      return res.json({ bookmarked: false });
    }
  }
);

/**
 * Get user's bookmarked universes
 * GET /api/social/bookmarks
 */
router.get(
  "/bookmarks",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json([]);
    }

    const userId = req.user!.id;

    try {
      const { data: bookmarks, error } = await db
        .from("bookmarks")
        .select(`
          created_at,
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
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to flat array of universes
      const universes = bookmarks
        ?.map((b: { universe: unknown }) => b.universe)
        .filter(Boolean);

      return res.json(universes || []);
    } catch (err) {
      console.error("Get bookmarks error:", err);
      return res.status(500).json({ error: "Failed to get bookmarks" });
    }
  }
);

// ============================================
// COMMENTS
// ============================================

/**
 * Get comments for a target
 * GET /api/social/comments/:targetType/:targetId
 */
router.get(
  "/comments/:targetType/:targetId",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ comments: [], total: 0 });
    }

    const { targetType, targetId } = req.params;
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      // Get top-level comments (no parent)
      const { data: comments, error, count } = await db
        .from("comments")
        .select(`
          id,
          content,
          like_count,
          created_at,
          parent_id,
          user:profiles!user_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `, { count: "exact" })
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        (comments || []).map(async (comment: { id: string }) => {
          const { data: replies } = await db
            .from("comments")
            .select(`
              id,
              content,
              like_count,
              created_at,
              user:profiles!user_id (
                id,
                username,
                display_name,
                avatar_url,
                is_verified
              )
            `)
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true })
            .limit(5);

          // Check if user liked this comment
          let userLiked = false;
          if (userId) {
            const { data: like } = await db
              .from("likes")
              .select("*")
              .eq("user_id", userId)
              .eq("target_type", "comment")
              .eq("target_id", comment.id)
              .single();
            userLiked = !!like;
          }

          return {
            ...comment,
            replies: replies || [],
            userLiked,
          };
        })
      );

      return res.json({
        comments: commentsWithReplies,
        total: count || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get comments error:", err);
      return res.status(500).json({ error: "Failed to get comments" });
    }
  }
);

/**
 * Post a comment
 * POST /api/social/comments/:targetType/:targetId
 */
router.post(
  "/comments/:targetType/:targetId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { targetType, targetId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: "Comment too long (max 2000 characters)" });
    }

    try {
      const { data: comment, error } = await db
        .from("comments")
        .insert({
          user_id: userId,
          target_type: targetType,
          target_id: targetId,
          parent_id: parentId || null,
          content: content.trim(),
        })
        .select(`
          id,
          content,
          like_count,
          created_at,
          parent_id,
          user:profiles!user_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .single();

      if (error) throw error;

      // Update comment count on universe
      if (targetType === "universe") {
        await db.rpc("increment_comment_count", { universe_id: targetId });

        // Create notification for universe owner
        const { data: universe } = await db
          .from("universes")
          .select("owner_id, name")
          .eq("id", targetId)
          .single();

        if (universe && universe.owner_id !== userId) {
          await db.from("notifications").insert({
            user_id: universe.owner_id,
            type: "comment",
            actor_id: userId,
            target_type: targetType,
            target_id: targetId,
            data: { universe_name: universe.name, comment_preview: content.substring(0, 100) },
          });
        }
      }

      // If it's a reply, notify the parent comment author
      if (parentId) {
        const { data: parentComment } = await db
          .from("comments")
          .select("user_id")
          .eq("id", parentId)
          .single();

        if (parentComment && parentComment.user_id !== userId) {
          await db.from("notifications").insert({
            user_id: parentComment.user_id,
            type: "reply",
            actor_id: userId,
            target_type: "comment",
            target_id: parentId,
            data: { comment_preview: content.substring(0, 100) },
          });
        }
      }

      return res.status(201).json(comment);
    } catch (err) {
      console.error("Post comment error:", err);
      return res.status(500).json({ error: "Failed to post comment" });
    }
  }
);

/**
 * Update a comment
 * PUT /api/social/comments/:commentId
 */
router.put(
  "/comments/:commentId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    try {
      // Check if user owns the comment
      const { data: existing } = await db
        .from("comments")
        .select("user_id")
        .eq("id", commentId)
        .single();

      if (!existing || existing.user_id !== userId) {
        return res.status(403).json({ error: "You can only edit your own comments" });
      }

      const { data: comment, error } = await db
        .from("comments")
        .update({ content: content.trim() })
        .eq("id", commentId)
        .select()
        .single();

      if (error) throw error;

      return res.json(comment);
    } catch (err) {
      console.error("Update comment error:", err);
      return res.status(500).json({ error: "Failed to update comment" });
    }
  }
);

/**
 * Delete a comment
 * DELETE /api/social/comments/:commentId
 */
router.delete(
  "/comments/:commentId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { commentId } = req.params;
    const userId = req.user!.id;

    try {
      // Check if user owns the comment
      const { data: existing } = await db
        .from("comments")
        .select("user_id, target_type, target_id")
        .eq("id", commentId)
        .single();

      if (!existing || existing.user_id !== userId) {
        return res.status(403).json({ error: "You can only delete your own comments" });
      }

      // Delete the comment (and replies via cascade)
      const { error } = await db
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      // Update comment count on universe
      if (existing.target_type === "universe") {
        await db.rpc("decrement_comment_count", { universe_id: existing.target_id });
      }

      return res.json({ deleted: true });
    } catch (err) {
      console.error("Delete comment error:", err);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

// ============================================
// FOLLOWS
// ============================================

/**
 * Toggle follow on a user
 * POST /api/social/follow/:userId
 */
router.post(
  "/follow/:userId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { userId: followingId } = req.params;
    const followerId = req.user!.id;

    if (followerId === followingId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    try {
      // Check if already following
      const { data: existingFollow } = await db
        .from("follows")
        .select("*")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .single();

      if (existingFollow) {
        // Unfollow
        await db
          .from("follows")
          .delete()
          .eq("follower_id", followerId)
          .eq("following_id", followingId);

        // Update follower count
        await db.rpc("decrement_follower_count", { user_id: followingId });

        return res.json({ following: false });
      } else {
        // Follow
        await db.from("follows").insert({
          follower_id: followerId,
          following_id: followingId,
        });

        // Update follower count
        await db.rpc("increment_follower_count", { user_id: followingId });

        // Create notification for followed user
        await db.from("notifications").insert({
          user_id: followingId,
          type: "follow",
          actor_id: followerId,
        });

        return res.json({ following: true });
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      return res.status(500).json({ error: "Failed to toggle follow" });
    }
  }
);

/**
 * Check if current user follows another user
 * GET /api/social/follow/:userId
 */
router.get(
  "/follow/:userId",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ following: false });
    }

    const { userId: followingId } = req.params;
    const followerId = req.user?.id;

    if (!followerId) {
      return res.json({ following: false });
    }

    try {
      const { data: existingFollow } = await db
        .from("follows")
        .select("*")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .single();

      return res.json({ following: !!existingFollow });
    } catch {
      return res.json({ following: false });
    }
  }
);

/**
 * Get user's followers
 * GET /api/social/followers/:userId
 */
router.get(
  "/followers/:userId",
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ followers: [], total: 0 });
    }

    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const { data: followers, error, count } = await db
        .from("follows")
        .select(`
          created_at,
          follower:profiles!follower_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `, { count: "exact" })
        .eq("following_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return res.json({
        followers: followers?.map((f: { follower: unknown }) => f.follower) || [],
        total: count || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get followers error:", err);
      return res.status(500).json({ error: "Failed to get followers" });
    }
  }
);

/**
 * Get users that a user follows
 * GET /api/social/following/:userId
 */
router.get(
  "/following/:userId",
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ following: [], total: 0 });
    }

    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const { data: following, error, count } = await db
        .from("follows")
        .select(`
          created_at,
          following:profiles!following_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `, { count: "exact" })
        .eq("follower_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return res.json({
        following: following?.map((f: { following: unknown }) => f.following) || [],
        total: count || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get following error:", err);
      return res.status(500).json({ error: "Failed to get following" });
    }
  }
);

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Get user's notifications
 * GET /api/social/notifications
 */
router.get(
  "/notifications",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread === "true";

    try {
      let query = db
        .from("notifications")
        .select(`
          id,
          type,
          target_type,
          target_id,
          data,
          is_read,
          created_at,
          actor:profiles!actor_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `, { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (unreadOnly) {
        query = query.eq("is_read", false);
      }

      const { data: notifications, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get unread count
      const { count: unreadCount } = await db
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      return res.json({
        notifications: notifications || [],
        total: count || 0,
        unreadCount: unreadCount || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get notifications error:", err);
      return res.status(500).json({ error: "Failed to get notifications" });
    }
  }
);

/**
 * Mark notifications as read
 * POST /api/social/notifications/mark-read
 */
router.post(
  "/notifications/mark-read",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const userId = req.user!.id;
    const { ids } = req.body; // Optional: specific notification IDs

    try {
      let query = db
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId);

      if (ids && Array.isArray(ids) && ids.length > 0) {
        query = query.in("id", ids);
      }

      const { error } = await query;

      if (error) throw error;

      return res.json({ success: true });
    } catch (err) {
      console.error("Mark notifications read error:", err);
      return res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  }
);

/**
 * Delete a notification
 * DELETE /api/social/notifications/:notificationId
 */
router.delete(
  "/notifications/:notificationId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ deleted: true });
    }

    const { notificationId } = req.params;
    const userId = req.user!.id;

    try {
      const { error } = await db
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;

      return res.json({ deleted: true });
    } catch (err) {
      console.error("Delete notification error:", err);
      return res.status(500).json({ error: "Failed to delete notification" });
    }
  }
);

export { router as socialRouter };
