import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables not set. Auth and database features will not work."
  );
}

/**
 * Supabase client for the frontend.
 * Uses the anon key which respects RLS policies.
 */
export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Re-export types for convenience
export type { Database };
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Universe = Database["public"]["Tables"]["universes"]["Row"];
export type GameSave = Database["public"]["Tables"]["game_saves"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
