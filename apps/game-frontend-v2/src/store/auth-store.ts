import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type Profile } from "@/shared/lib/supabase";

/**
 * Auth store state
 */
interface AuthStoreState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Auth store actions
 */
interface AuthStoreActions {
  // Initialization
  initialize: () => Promise<void>;

  // Authentication
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (
    provider: "google" | "github" | "discord"
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Password recovery
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Profile
  loadProfile: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ success: boolean; error?: string }>;

  // State management
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

const initialState: AuthStoreState = {
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      initialize: async () => {
        if (get().isInitialized) return;

        set((state) => {
          state.isLoading = true;
        });

        try {
          // Get current session
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

            // Load profile
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

      signUp: async (email, password, username) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Check if username is available
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .single();

          if (existingUser) {
            set((state) => {
              state.isLoading = false;
            });
            return { success: false, error: "Username already taken" };
          }

          // Sign up
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });

          if (error) throw error;

          if (data.session) {
            set((state) => {
              state.session = data.session;
              state.user = data.user;
              state.isLoading = false;
            });

            await get().loadProfile();
          } else {
            // Email confirmation required
            set((state) => {
              state.isLoading = false;
            });
          }

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sign up";
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          return { success: false, error: errorMessage };
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

      signInWithOAuth: async (provider) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;

          // OAuth redirects to provider, so we don't need to do anything else
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to sign in with OAuth";
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

      forgotPassword: async (email) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;

          set((state) => {
            state.isLoading = false;
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to send reset email";
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          return { success: false, error: errorMessage };
        }
      },

      resetPassword: async (newPassword) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;

          set((state) => {
            state.isLoading = false;
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to reset password";
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          return { success: false, error: errorMessage };
        }
      },

      loadProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          set((state) => {
            state.profile = profile;
          });
        } catch (error) {
          console.error("Failed to load profile:", error);
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { success: false, error: "Not authenticated" };

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Use type assertion to work around Supabase type inference issues
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: profile, error } = await (supabase as any)
            .from("profiles")
            .update(updates)
            .eq("id", user.id)
            .select()
            .single();

          if (error) throw error;

          set((state) => {
            state.profile = profile as Profile;
            state.isLoading = false;
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update profile";
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          return { success: false, error: errorMessage };
        }
      },

      setSession: (session) => {
        set((state) => {
          state.session = session;
          state.user = session?.user ?? null;
        });
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
    })),
    {
      name: "wdydn-auth",
      partialize: () => ({}), // Don't persist any auth state (security)
    }
  )
);

// Selectors
export const useIsAuthenticated = () =>
  useAuthStore((state) => Boolean(state.session));
export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useCredits = () =>
  useAuthStore((state) => state.profile?.ai_credits ?? 0);
