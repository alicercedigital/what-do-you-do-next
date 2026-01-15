import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Supabase environment variables not set. Database features will not work."
  );
}

/**
 * Supabase admin client with service role key.
 * Use this for server-side operations that need to bypass RLS.
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create a Supabase client for a specific user session.
 * Use this for operations that should respect RLS.
 */
export function createUserClient(accessToken: string) {
  return createClient<Database>(supabaseUrl || "", supabaseServiceKey || "", {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
