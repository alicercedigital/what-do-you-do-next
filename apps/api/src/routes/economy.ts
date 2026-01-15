import { Router, type Response } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import { requireAuth, loadProfile, type AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

// ============================================
// CREDITS
// ============================================

/**
 * Get user's credit balance
 * GET /api/economy/credits
 */
router.get(
  "/credits",
  requireAuth,
  loadProfile,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ balance: 100 }); // Default dev balance
    }

    const balance = req.user?.profile?.ai_credits ?? 0;
    return res.json({ balance });
  }
);

/**
 * Get credit transaction history
 * GET /api/economy/credits/transactions
 */
router.get(
  "/credits/transactions",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ transactions: [], total: 0 });
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const { data: transactions, error, count } = await db
        .from("credit_transactions")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return res.json({
        transactions: transactions || [],
        total: count || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get transactions error:", err);
      return res.status(500).json({ error: "Failed to get transactions" });
    }
  }
);

/**
 * Add credits (for testing or admin use)
 * POST /api/economy/credits/add
 */
router.post(
  "/credits/add",
  requireAuth,
  loadProfile,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ balance: 100, added: 0 });
    }

    const { amount, description } = req.body;
    const userId = req.user!.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    try {
      const currentBalance = req.user?.profile?.ai_credits ?? 0;
      const newBalance = currentBalance + amount;

      // Update balance
      await db
        .from("profiles")
        .update({ ai_credits: newBalance })
        .eq("id", userId);

      // Record transaction
      await db.from("credit_transactions").insert({
        user_id: userId,
        amount,
        type: "purchase",
        description: description || "Credits added",
      });

      return res.json({ balance: newBalance, added: amount });
    } catch (err) {
      console.error("Add credits error:", err);
      return res.status(500).json({ error: "Failed to add credits" });
    }
  }
);

// ============================================
// TIPS
// ============================================

/**
 * Send a tip to a creator
 * POST /api/economy/tips
 */
router.post(
  "/tips",
  requireAuth,
  loadProfile,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { receiverId, amount, universeId, message } = req.body;
    const senderId = req.user!.id;

    if (!receiverId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid tip data" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: "Cannot tip yourself" });
    }

    const currentBalance = req.user?.profile?.ai_credits ?? 0;
    if (currentBalance < amount) {
      return res.status(402).json({
        error: "Insufficient credits",
        required: amount,
        available: currentBalance,
      });
    }

    try {
      // Deduct from sender
      await db
        .from("profiles")
        .update({ ai_credits: currentBalance - amount })
        .eq("id", senderId);

      // Add to receiver
      const { data: receiver } = await db
        .from("profiles")
        .select("ai_credits")
        .eq("id", receiverId)
        .single();

      if (!receiver) {
        // Rollback sender deduction
        await db
          .from("profiles")
          .update({ ai_credits: currentBalance })
          .eq("id", senderId);
        return res.status(404).json({ error: "Receiver not found" });
      }

      await db
        .from("profiles")
        .update({ ai_credits: (receiver.ai_credits || 0) + amount })
        .eq("id", receiverId);

      // Record tip
      const { data: tip, error: tipError } = await db
        .from("tips")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          amount,
          universe_id: universeId || null,
          message: message || null,
        })
        .select()
        .single();

      if (tipError) throw tipError;

      // Record transactions
      await db.from("credit_transactions").insert([
        {
          user_id: senderId,
          amount: -amount,
          type: "tip_sent",
          reference_type: "tip",
          reference_id: tip.id,
          description: `Tip to creator`,
        },
        {
          user_id: receiverId,
          amount,
          type: "tip_received",
          reference_type: "tip",
          reference_id: tip.id,
          description: `Tip received`,
        },
      ]);

      // Create notification for receiver
      await db.from("notifications").insert({
        user_id: receiverId,
        type: "tip",
        actor_id: senderId,
        target_type: universeId ? "universe" : null,
        target_id: universeId || null,
        data: { amount, message },
      });

      return res.json({
        success: true,
        newBalance: currentBalance - amount,
        tipId: tip.id,
      });
    } catch (err) {
      console.error("Send tip error:", err);
      return res.status(500).json({ error: "Failed to send tip" });
    }
  }
);

/**
 * Get tips sent by user
 * GET /api/economy/tips/sent
 */
router.get(
  "/tips/sent",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ tips: [], total: 0 });
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const { data: tips, error, count } = await db
        .from("tips")
        .select(`
          id,
          amount,
          message,
          created_at,
          receiver:profiles!receiver_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          universe:universes (
            id,
            name
          )
        `, { count: "exact" })
        .eq("sender_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return res.json({
        tips: tips || [],
        total: count || 0,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get sent tips error:", err);
      return res.status(500).json({ error: "Failed to get tips" });
    }
  }
);

/**
 * Get tips received by user
 * GET /api/economy/tips/received
 */
router.get(
  "/tips/received",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ tips: [], total: 0, totalAmount: 0 });
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const { data: tips, error, count } = await db
        .from("tips")
        .select(`
          id,
          amount,
          message,
          created_at,
          sender:profiles!sender_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          universe:universes (
            id,
            name
          )
        `, { count: "exact" })
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Calculate total received
      const { data: totalData } = await db
        .from("tips")
        .select("amount")
        .eq("receiver_id", userId);

      const totalAmount = totalData?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;

      return res.json({
        tips: tips || [],
        total: count || 0,
        totalAmount,
        limit,
        offset,
      });
    } catch (err) {
      console.error("Get received tips error:", err);
      return res.status(500).json({ error: "Failed to get tips" });
    }
  }
);

// ============================================
// CONTENT PURCHASES
// ============================================

/**
 * Purchase premium content
 * POST /api/economy/purchase/:universeId
 */
router.post(
  "/purchase/:universeId",
  requireAuth,
  loadProfile,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      // Check if already purchased
      const { data: existing } = await db
        .from("content_purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .single();

      if (existing) {
        return res.json({ success: true, alreadyPurchased: true });
      }

      // Get universe info
      const { data: universe } = await db
        .from("universes")
        .select("owner_id, name, is_premium, price_credits")
        .eq("id", universeId)
        .single();

      if (!universe) {
        return res.status(404).json({ error: "Universe not found" });
      }

      if (!universe.is_premium || universe.price_credits === 0) {
        return res.json({ success: true, free: true });
      }

      const price = universe.price_credits;
      const currentBalance = req.user?.profile?.ai_credits ?? 0;

      if (currentBalance < price) {
        return res.status(402).json({
          error: "Insufficient credits",
          required: price,
          available: currentBalance,
        });
      }

      // Deduct from buyer
      await db
        .from("profiles")
        .update({ ai_credits: currentBalance - price })
        .eq("id", userId);

      // Add to creator (if not buying own content)
      if (universe.owner_id !== userId) {
        const { data: creator } = await db
          .from("profiles")
          .select("ai_credits")
          .eq("id", universe.owner_id)
          .single();

        if (creator) {
          // Creator gets 70% of the price
          const creatorShare = Math.floor(price * 0.7);
          await db
            .from("profiles")
            .update({ ai_credits: (creator.ai_credits || 0) + creatorShare })
            .eq("id", universe.owner_id);

          // Record creator's earning
          await db.from("credit_transactions").insert({
            user_id: universe.owner_id,
            amount: creatorShare,
            type: "content_sale",
            reference_type: "universe",
            reference_id: universeId,
            description: `Sale of ${universe.name}`,
          });
        }
      }

      // Record purchase
      await db.from("content_purchases").insert({
        user_id: userId,
        universe_id: universeId,
        price_paid: price,
      });

      // Record transaction
      await db.from("credit_transactions").insert({
        user_id: userId,
        amount: -price,
        type: "content_purchase",
        reference_type: "universe",
        reference_id: universeId,
        description: `Purchase: ${universe.name}`,
      });

      return res.json({
        success: true,
        newBalance: currentBalance - price,
        pricePaid: price,
      });
    } catch (err) {
      console.error("Purchase error:", err);
      return res.status(500).json({ error: "Failed to complete purchase" });
    }
  }
);

/**
 * Check if user owns/purchased a universe
 * GET /api/economy/owns/:universeId
 */
router.get(
  "/owns/:universeId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({ owns: true }); // Default to true in dev
    }

    const { universeId } = req.params;
    const userId = req.user!.id;

    try {
      // Check if user is owner
      const { data: universe } = await db
        .from("universes")
        .select("owner_id, is_premium, price_credits")
        .eq("id", universeId)
        .single();

      if (!universe) {
        return res.status(404).json({ error: "Universe not found" });
      }

      // Owner always has access
      if (universe.owner_id === userId) {
        return res.json({ owns: true, isOwner: true });
      }

      // Free content
      if (!universe.is_premium || universe.price_credits === 0) {
        return res.json({ owns: true, free: true });
      }

      // Check purchase
      const { data: purchase } = await db
        .from("content_purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("universe_id", universeId)
        .single();

      return res.json({
        owns: !!purchase,
        purchased: !!purchase,
        price: universe.price_credits,
      });
    } catch (err) {
      console.error("Check ownership error:", err);
      return res.status(500).json({ error: "Failed to check ownership" });
    }
  }
);

/**
 * Get user's purchased universes
 * GET /api/economy/purchases
 */
router.get(
  "/purchases",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json([]);
    }

    const userId = req.user!.id;

    try {
      const { data: purchases, error } = await db
        .from("content_purchases")
        .select(`
          price_paid,
          purchased_at,
          universe:universes (
            id,
            name,
            description,
            theme,
            genre,
            tags,
            creator:profiles!owner_id (
              id,
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });

      if (error) throw error;

      return res.json(purchases || []);
    } catch (err) {
      console.error("Get purchases error:", err);
      return res.status(500).json({ error: "Failed to get purchases" });
    }
  }
);

// ============================================
// CREATOR EARNINGS
// ============================================

/**
 * Get creator earnings summary
 * GET /api/economy/earnings
 */
router.get(
  "/earnings",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!isSupabaseConfigured()) {
      return res.json({
        totalEarnings: 0,
        tipsReceived: 0,
        salesRevenue: 0,
        thisMonth: 0,
      });
    }

    const userId = req.user!.id;

    try {
      // Get all positive credit transactions
      const { data: transactions } = await db
        .from("credit_transactions")
        .select("amount, type, created_at")
        .eq("user_id", userId)
        .in("type", ["tip_received", "content_sale"]);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let tipsReceived = 0;
      let salesRevenue = 0;
      let thisMonth = 0;

      transactions?.forEach((t: { amount: number; type: string; created_at: string }) => {
        if (t.type === "tip_received") {
          tipsReceived += t.amount;
        } else if (t.type === "content_sale") {
          salesRevenue += t.amount;
        }

        if (new Date(t.created_at) >= monthStart) {
          thisMonth += t.amount;
        }
      });

      return res.json({
        totalEarnings: tipsReceived + salesRevenue,
        tipsReceived,
        salesRevenue,
        thisMonth,
      });
    } catch (err) {
      console.error("Get earnings error:", err);
      return res.status(500).json({ error: "Failed to get earnings" });
    }
  }
);

export { router as economyRouter };
