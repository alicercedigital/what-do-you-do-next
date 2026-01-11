import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/database.types";

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface UserStoreState {
  settings: UserSettings | null;
  subscription: Subscription | null;
  stats: {
    universeCount: number;
    followerCount: number;
    followingCount: number;
    totalPlays: number;
    totalLikes: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

interface UserStoreActions {
  loadSettings: (userId: string) => Promise<void>;
  updateSettings: (
    userId: string,
    updates: Partial<UserSettings>
  ) => Promise<{ success: boolean; error?: string }>;
  loadSubscription: (userId: string) => Promise<void>;
  loadStats: (userId: string) => Promise<void>;
  reset: () => void;
}

type UserStore = UserStoreState & UserStoreActions;

const initialState: UserStoreState = {
  settings: null,
  subscription: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  immer((set) => ({
    ...initialState,

    loadSettings: async (userId: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          throw error;
        }

        set((state) => {
          state.settings = data;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : "Failed to load settings";
          state.isLoading = false;
        });
      }
    },

    updateSettings: async (userId: string, updates: Partial<UserSettings>) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Upsert settings (create if not exists)
        const { data, error } = await supabase
          .from("user_settings")
          .upsert(
            {
              user_id: userId,
              ...updates,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          )
          .select()
          .single();

        if (error) throw error;

        set((state) => {
          state.settings = data;
          state.isLoading = false;
        });

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update settings";
        set((state) => {
          state.error = errorMessage;
          state.isLoading = false;
        });
        return { success: false, error: errorMessage };
      }
    },

    loadSubscription: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        set((state) => {
          state.subscription = data;
        });
      } catch (error) {
        console.error("Failed to load subscription:", error);
      }
    },

    loadStats: async (userId: string) => {
      try {
        // Get universe count and aggregated stats
        const { data: universes, error: universeError } = await supabase
          .from("universes")
          .select("id, play_count, like_count")
          .eq("owner_id", userId);

        if (universeError) throw universeError;

        // Get follower count
        const { count: followerCount, error: followerError } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);

        if (followerError) throw followerError;

        // Get following count
        const { count: followingCount, error: followingError } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", userId);

        if (followingError) throw followingError;

        const totalPlays = universes?.reduce((sum, u) => sum + u.play_count, 0) ?? 0;
        const totalLikes = universes?.reduce((sum, u) => sum + u.like_count, 0) ?? 0;

        set((state) => {
          state.stats = {
            universeCount: universes?.length ?? 0,
            followerCount: followerCount ?? 0,
            followingCount: followingCount ?? 0,
            totalPlays,
            totalLikes,
          };
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// Selectors
export const useUserSettings = () => useUserStore((state) => state.settings);
export const useUserSubscription = () => useUserStore((state) => state.subscription);
export const useUserStats = () => useUserStore((state) => state.stats);
