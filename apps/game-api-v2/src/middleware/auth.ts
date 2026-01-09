import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type Tables = Database["public"]["Tables"];
type Profile = Tables["profiles"]["Row"];
type CreditTransactionInsert = Tables["credit_transactions"]["Insert"];

// Type-safe query helper to work around Supabase type inference issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

/**
 * Extended request type with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    profile?: Profile;
  };
}

/**
 * Extract the access token from the Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Middleware that requires authentication.
 * Returns 401 if no valid token is provided.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isSupabaseConfigured()) {
    // In development without Supabase, allow anonymous access with a mock user
    if (process.env.NODE_ENV === "development") {
      req.user = {
        id: "dev-user-id",
        email: "dev@example.com",
      };
      return next();
    }
    res.status(503).json({ error: "Authentication service not configured" });
    return;
  }

  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * Middleware that optionally authenticates.
 * Attaches user if token is valid, but allows unauthenticated requests.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isSupabaseConfigured()) {
    // In development without Supabase, allow anonymous access
    return next();
  }

  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
      };
    }

    next();
  } catch {
    // Ignore auth errors for optional auth
    next();
  }
}

/**
 * Middleware that loads the user's profile from the database.
 * Should be used after requireAuth or optionalAuth.
 */
export async function loadProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user?.id || !isSupabaseConfigured()) {
    return next();
  }

  try {
    const { data: profile, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (!error && profile) {
      req.user.profile = profile as Profile;
    }

    next();
  } catch {
    // Continue even if profile fetch fails
    next();
  }
}

/**
 * Middleware that requires the user to have specific credits.
 * Returns 402 Payment Required if insufficient credits.
 */
export function requireCredits(minCredits: number) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user?.profile) {
      // Load profile if not already loaded
      await loadProfile(req, res, () => {});
    }

    const credits = req.user?.profile?.ai_credits ?? 0;

    if (credits < minCredits) {
      res.status(402).json({
        error: "Insufficient credits",
        required: minCredits,
        available: credits,
      });
      return;
    }

    next();
  };
}

/**
 * Deduct credits from a user's account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: CreditTransactionInsert["type"],
  description?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  try {
    // First check current balance
    const { data: profile } = await db
      .from("profiles")
      .select("ai_credits")
      .eq("id", userId)
      .single();

    const typedProfile = profile as Pick<Profile, "ai_credits"> | null;
    if (!typedProfile || typedProfile.ai_credits < amount) {
      return false;
    }

    // Deduct credits
    const { error: updateError } = await db
      .from("profiles")
      .update({ ai_credits: typedProfile.ai_credits - amount })
      .eq("id", userId);

    if (updateError) return false;

    // Record transaction
    const transaction: CreditTransactionInsert = {
      user_id: userId,
      amount: -amount,
      type,
      description,
    };

    await db.from("credit_transactions").insert(transaction);

    return true;
  } catch (err) {
    console.error("Failed to deduct credits:", err);
    return false;
  }
}
