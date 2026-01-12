import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type AdminProfile } from "@/shared/lib/supabase";

/**
 * Admin auth store state
 */
interface AdminAuthStoreState {
  user: User | null;
  session: Session | null;
  profile: AdminProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Admin auth store actions
 */
interface AdminAuthStoreActions {
  initialize: () => Promise<void>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AdminAuthStore = AdminAuthStoreState & AdminAuthStoreActions;

const initialState: AdminAuthStoreState = {
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAdminAuthStore = create<AdminAuthStore>()(
  immer((set, get) => ({
    ...initialState,

    initialize: async () => {
      if (get().isInitialized) return;

      set((state) => {
        state.isLoading = true;
      });

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          set((state) => {
            state.session = session;
            state.user = session.user;
          });

          await get().loadProfile();
        }

        // Set up auth state change listener
        supabase.auth.onAuthStateChange(async (event, session) => {
          set((state) => {
            state.session = session;
            state.user = session?.user ?? null;
          });

          if (event === "SIGNED_IN" && session) {
            await get().loadProfile();
          }

          if (event === "SIGNED_OUT") {
            set((state) => {
              state.profile = null;
            });
          }
        });

        set((state) => {
          state.isInitialized = true;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "Failed to initialize auth";
          state.isLoading = false;
          state.isInitialized = true;
        });
      }
    },

    signIn: async (email, password) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        set((state) => {
          state.session = data.session;
          state.user = data.user;
          state.isLoading = false;
        });

        await get().loadProfile();

        // Check if user is admin
        const { profile } = get();
        if (!profile?.is_admin) {
          await supabase.auth.signOut();
          set((state) => {
            state.session = null;
            state.user = null;
            state.profile = null;
            state.error = "Access denied. Admin privileges required.";
          });
          return { success: false, error: "Access denied. Admin privileges required." };
        }

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to sign in";
        set((state) => {
          state.error = errorMessage;
          state.isLoading = false;
        });
        return { success: false, error: errorMessage };
      }
    },

    signOut: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set((state) => {
          state.session = null;
          state.user = null;
          state.profile = null;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Failed to sign out";
          state.isLoading = false;
        });
      }
    },

    loadProfile: async () => {
      const { user } = get();
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, is_admin, tier, ai_credits, created_at")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        set((state) => {
          state.profile = profile as AdminProfile;
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    },

    setError: (error) => {
      set((state) => {
        state.error = error;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);

// Selectors
export const useIsAuthenticated = () =>
  useAdminAuthStore((state) => Boolean(state.session));
export const useIsAdmin = () =>
  useAdminAuthStore((state) => state.profile?.is_admin ?? false);
export const useAdminUser = () => useAdminAuthStore((state) => state.user);
export const useAdminProfile = () => useAdminAuthStore((state) => state.profile);
export const useAdminAuthLoading = () =>
  useAdminAuthStore((state) => state.isLoading);
export const useAdminAuthError = () =>
  useAdminAuthStore((state) => state.error);
