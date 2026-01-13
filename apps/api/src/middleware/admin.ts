import type { Response, NextFunction } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import type { AuthenticatedRequest } from "./auth";

// Type-safe query helper to work around Supabase type inference issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

/**
 * Middleware that requires admin access.
 * Must be used after requireAuth middleware.
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isSupabaseConfigured()) {
    // In development without Supabase, allow admin access for dev user
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    res.status(503).json({ error: "Admin service not configured" });
    return;
  }

  if (!req.user?.id) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    // Check if user has admin flag
    const { data: profile, error } = await db
      .from("profiles")
      .select("is_admin")
      .eq("id", req.user.id)
      .single();

    if (error || !profile?.is_admin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ error: "Authorization error" });
  }
}

/**
 * Log admin action to audit table
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string | null,
  targetId: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await db.from("admin_audit_logs").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
}

/**
 * Check if a user is banned
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { data, error } = await db
      .from("user_bans")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .or("expires_at.is.null,expires_at.gt.now()")
      .limit(1);

    if (error) return false;
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}
