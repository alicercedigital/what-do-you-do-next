import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { requireAdmin, logAdminAction } from "../middleware/admin";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";

const router = Router();

// Type-safe query helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

// Apply auth middleware to all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// ============================================================
// Dashboard & Analytics
// ============================================================

router.get("/admin/dashboard/overview", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        totalUsers: 0,
        activeUsers7d: 0,
        totalUniverses: 0,
        publishedUniverses: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        aiCreditsUsed: 0,
        totalPlays: 0,
      });
    }

    // Get user counts
    const { count: totalUsers } = await db
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get universe counts
    const { count: totalUniverses } = await db
      .from("universes")
      .select("*", { count: "exact", head: true });

    const { count: publishedUniverses } = await db
      .from("universes")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    // Get total plays
    const { data: playStats } = await db
      .from("universes")
      .select("play_count")
      .not("play_count", "is", null);

    const totalPlays = playStats?.reduce(
      (sum: number, u: { play_count: number }) => sum + (u.play_count || 0),
      0
    ) ?? 0;

    // Get AI credits usage (negative transactions)
    const { data: creditUsage } = await db
      .from("credit_transactions")
      .select("amount")
      .eq("type", "ai_usage");

    const aiCreditsUsed = creditUsage?.reduce(
      (sum: number, t: { amount: number }) => sum + Math.abs(t.amount || 0),
      0
    ) ?? 0;

    res.json({
      totalUsers: totalUsers || 0,
      activeUsers7d: Math.floor((totalUsers || 0) * 0.3), // Placeholder
      totalUniverses: totalUniverses || 0,
      publishedUniverses: publishedUniverses || 0,
      totalRevenue: 0, // Would need Stripe integration
      revenueThisMonth: 0,
      aiCreditsUsed,
      totalPlays,
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

router.get("/admin/dashboard/user-growth", async (req, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const days = parseInt(period) || 30;

    if (!isSupabaseConfigured()) {
      return res.json({ data: [] });
    }

    // Generate sample data for now
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        signups: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 100) + 50,
      });
    }

    res.json({ data });
  } catch (err) {
    console.error("User growth error:", err);
    res.status(500).json({ error: "Failed to load user growth data" });
  }
});

router.get("/admin/dashboard/revenue", async (req, res) => {
  try {
    const period = (req.query.period as string) || "30d";
    const days = parseInt(period) || 30;

    // Generate sample data for now
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        credits: Math.floor(Math.random() * 10000) + 1000,
        subscriptions: Math.floor(Math.random() * 5000) + 500,
      });
    }

    res.json({
      data,
      totals: {
        credits: data.reduce((sum, d) => sum + d.credits, 0),
        subscriptions: data.reduce((sum, d) => sum + d.subscriptions, 0),
      },
    });
  } catch (err) {
    console.error("Revenue error:", err);
    res.status(500).json({ error: "Failed to load revenue data" });
  }
});

// ============================================================
// System Configuration
// ============================================================

router.get("/admin/config", async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        credit_costs: { ai_generation: 5, image_generation: 10 },
        tier_limits: {
          free: { universes: 3, ai_per_day: 20 },
          creator: { universes: 10, ai_per_day: 100 },
          pro: { universes: -1, ai_per_day: -1 },
        },
        feature_flags: { new_editor: true, challenges: true },
        maintenance_mode: false,
      });
    }

    const { data: configs, error } = await db
      .from("system_config")
      .select("key, value");

    if (error) throw error;

    const config: Record<string, unknown> = {};
    for (const c of configs || []) {
      config[c.key] = c.value;
    }

    res.json(config);
  } catch (err) {
    console.error("Config fetch error:", err);
    res.status(500).json({ error: "Failed to load configuration" });
  }
});

router.put("/admin/config", async (req: AuthenticatedRequest, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: "Key and value are required" });
    }

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const { error } = await db
      .from("system_config")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: req.user?.id,
      });

    if (error) throw error;

    await logAdminAction(req.user!.id, "config.update", "config", null, {
      key,
      value,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Config update error:", err);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

// ============================================================
// User Management
// ============================================================

router.get("/admin/users", async (req, res) => {
  try {
    const search = req.query.search as string;
    const tier = req.query.tier as string;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured()) {
      return res.json({ users: [], total: 0 });
    }

    let query = db
      .from("profiles")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (tier) {
      query = query.eq("tier", tier);
    }

    if (status === "verified") {
      query = query.eq("is_verified", true);
    } else if (status === "admin") {
      query = query.eq("is_admin", true);
    }

    const { data: users, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Check ban status for each user
    const usersWithBanStatus = await Promise.all(
      (users || []).map(async (user: { id: string }) => {
        const { data: bans } = await db
          .from("user_bans")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1);

        return {
          ...user,
          is_banned: (bans?.length ?? 0) > 0,
        };
      })
    );

    res.json({
      users: usersWithBanStatus,
      total: count || 0,
    });
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ error: "Failed to load users" });
  }
});

router.get("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(404).json({ error: "User not found" });
    }

    const { data: user, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check ban status
    const { data: bans } = await db
      .from("user_bans")
      .select("id")
      .eq("user_id", id)
      .eq("is_active", true)
      .limit(1);

    res.json({
      ...user,
      is_banned: (bans?.length ?? 0) > 0,
    });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ error: "Failed to load user" });
  }
});

router.put("/admin/users/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    // Only allow specific fields to be updated
    const allowedFields = ["tier", "is_verified", "is_admin", "is_featured"];
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    const { error } = await db
      .from("profiles")
      .update(sanitizedUpdates)
      .eq("id", id);

    if (error) throw error;

    await logAdminAction(req.user!.id, "user.update", "user", id, sanitizedUpdates);

    res.json({ success: true });
  } catch (err) {
    console.error("User update error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.post("/admin/users/:id/credits", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({ error: "Amount and reason are required" });
    }

    if (!isSupabaseConfigured()) {
      return res.json({ success: true, newBalance: 0 });
    }

    // Get current balance
    const { data: user, error: userError } = await db
      .from("profiles")
      .select("ai_credits")
      .eq("id", id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newBalance = (user.ai_credits || 0) + amount;

    // Update balance
    const { error: updateError } = await db
      .from("profiles")
      .update({ ai_credits: newBalance })
      .eq("id", id);

    if (updateError) throw updateError;

    // Record transaction
    await db.from("credit_transactions").insert({
      user_id: id,
      amount,
      type: amount > 0 ? "bonus" : "ai_usage",
      description: `Admin adjustment: ${reason}`,
    });

    await logAdminAction(req.user!.id, "user.credit_adjust", "user", id, {
      amount,
      reason,
      newBalance,
    });

    res.json({ success: true, newBalance });
  } catch (err) {
    console.error("Credit adjustment error:", err);
    res.status(500).json({ error: "Failed to adjust credits" });
  }
});

router.post("/admin/users/:id/ban", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { reason, duration_days } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const expiresAt = duration_days
      ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await db.from("user_bans").insert({
      user_id: id,
      banned_by: req.user!.id,
      reason,
      expires_at: expiresAt,
    });

    if (error) throw error;

    await logAdminAction(req.user!.id, "user.ban", "user", id, {
      reason,
      duration_days,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Ban user error:", err);
    res.status(500).json({ error: "Failed to ban user" });
  }
});

router.post("/admin/users/:id/unban", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const { error } = await db
      .from("user_bans")
      .update({
        is_active: false,
        lifted_at: new Date().toISOString(),
        lifted_by: req.user!.id,
      })
      .eq("user_id", id)
      .eq("is_active", true);

    if (error) throw error;

    await logAdminAction(req.user!.id, "user.unban", "user", id, {});

    res.json({ success: true });
  } catch (err) {
    console.error("Unban user error:", err);
    res.status(500).json({ error: "Failed to unban user" });
  }
});

// ============================================================
// Universe Management
// ============================================================

router.get("/admin/universes", async (req, res) => {
  try {
    const search = req.query.search as string;
    const visibility = req.query.visibility as string;
    const featured = req.query.featured as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured()) {
      return res.json({ universes: [], total: 0 });
    }

    let query = db
      .from("universes")
      .select("id, name, description, owner_id, visibility, is_published, is_featured, play_count, like_count, created_at, updated_at", { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (visibility) {
      query = query.eq("visibility", visibility);
    }

    if (featured === "true") {
      query = query.eq("is_featured", true);
    } else if (featured === "false") {
      query = query.eq("is_featured", false);
    }

    const { data: universes, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get owner info for each universe
    const universesWithOwners = await Promise.all(
      (universes || []).map(async (universe: { owner_id: string }) => {
        const { data: owner } = await db
          .from("profiles")
          .select("id, username")
          .eq("id", universe.owner_id)
          .single();

        return {
          ...universe,
          owner: owner || { id: universe.owner_id, username: "Unknown" },
          report_count: 0, // Would need to count from content_reports
        };
      })
    );

    res.json({
      universes: universesWithOwners,
      total: count || 0,
    });
  } catch (err) {
    console.error("Universes fetch error:", err);
    res.status(500).json({ error: "Failed to load universes" });
  }
});

router.put("/admin/universes/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    // Only allow specific fields to be updated
    const allowedFields = ["is_featured", "is_published", "visibility"];
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    const { error } = await db
      .from("universes")
      .update(sanitizedUpdates)
      .eq("id", id);

    if (error) throw error;

    await logAdminAction(req.user!.id, "universe.update", "universe", id, sanitizedUpdates);

    res.json({ success: true });
  } catch (err) {
    console.error("Universe update error:", err);
    res.status(500).json({ error: "Failed to update universe" });
  }
});

router.delete("/admin/universes/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const { error } = await db.from("universes").delete().eq("id", id);

    if (error) throw error;

    await logAdminAction(req.user!.id, "universe.delete", "universe", id, {});

    res.json({ success: true });
  } catch (err) {
    console.error("Universe delete error:", err);
    res.status(500).json({ error: "Failed to delete universe" });
  }
});

// ============================================================
// Economy
// ============================================================

router.get("/admin/economy/transactions", async (req, res) => {
  try {
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured()) {
      return res.json({ transactions: [], total: 0 });
    }

    let query = db
      .from("credit_transactions")
      .select("*", { count: "exact" });

    if (type) {
      query = query.eq("type", type);
    }

    const { data: transactions, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get usernames
    const transactionsWithUsernames = await Promise.all(
      (transactions || []).map(async (tx: { user_id: string }) => {
        const { data: user } = await db
          .from("profiles")
          .select("username")
          .eq("id", tx.user_id)
          .single();

        return {
          ...tx,
          username: user?.username || "Unknown",
        };
      })
    );

    res.json({
      transactions: transactionsWithUsernames,
      total: count || 0,
    });
  } catch (err) {
    console.error("Transactions fetch error:", err);
    res.status(500).json({ error: "Failed to load transactions" });
  }
});

router.get("/admin/economy/subscriptions", async (req, res) => {
  try {
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured()) {
      return res.json({ subscriptions: [], total: 0 });
    }

    let query = db
      .from("subscriptions")
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: subscriptions, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get usernames
    const subscriptionsWithUsernames = await Promise.all(
      (subscriptions || []).map(async (sub: { user_id: string }) => {
        const { data: user } = await db
          .from("profiles")
          .select("username")
          .eq("id", sub.user_id)
          .single();

        return {
          ...sub,
          username: user?.username || "Unknown",
        };
      })
    );

    res.json({
      subscriptions: subscriptionsWithUsernames,
      total: count || 0,
    });
  } catch (err) {
    console.error("Subscriptions fetch error:", err);
    res.status(500).json({ error: "Failed to load subscriptions" });
  }
});

// ============================================================
// Moderation
// ============================================================

router.get("/admin/moderation/reports", async (req, res) => {
  try {
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured()) {
      return res.json({ reports: [], total: 0 });
    }

    let query = db
      .from("content_reports")
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: reports, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get reporter info
    const reportsWithReporters = await Promise.all(
      (reports || []).map(async (report: { reporter_id: string }) => {
        const { data: reporter } = await db
          .from("profiles")
          .select("id, username")
          .eq("id", report.reporter_id)
          .single();

        return {
          ...report,
          reporter: reporter || { id: report.reporter_id, username: "Unknown" },
        };
      })
    );

    res.json({
      reports: reportsWithReporters,
      total: count || 0,
    });
  } catch (err) {
    console.error("Reports fetch error:", err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

router.put("/admin/moderation/reports/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    if (!isSupabaseConfigured()) {
      return res.json({ success: true });
    }

    const { error } = await db
      .from("content_reports")
      .update({
        status,
        resolution_notes: notes,
        resolved_by: req.user!.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    await logAdminAction(req.user!.id, "report.resolve", "report", id, {
      status,
      notes,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Report resolution error:", err);
    res.status(500).json({ error: "Failed to resolve report" });
  }
});

// ============================================================
// Audit Logs
// ============================================================

router.get("/admin/audit", async (req, res) => {
  try {
    const action = req.query.action as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured()) {
      return res.json({ logs: [], total: 0 });
    }

    let query = db
      .from("admin_audit_logs")
      .select("*", { count: "exact" });

    if (action) {
      query = query.ilike("action", `%${action}%`);
    }

    const { data: logs, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get admin info
    const logsWithAdmins = await Promise.all(
      (logs || []).map(async (log: { admin_id: string }) => {
        const { data: admin } = await db
          .from("profiles")
          .select("id, username")
          .eq("id", log.admin_id)
          .single();

        return {
          ...log,
          admin: admin || { id: log.admin_id, username: "Unknown" },
        };
      })
    );

    res.json({
      logs: logsWithAdmins,
      total: count || 0,
    });
  } catch (err) {
    console.error("Audit logs fetch error:", err);
    res.status(500).json({ error: "Failed to load audit logs" });
  }
});

export { router as adminRouter };
