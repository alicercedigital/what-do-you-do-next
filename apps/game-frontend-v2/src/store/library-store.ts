import { create } from "zustand";
import { MarketplaceCreator } from "./marketplace-store";

/**
 * Universe info in play history
 */
export interface HistoryUniverse {
  id: string;
  name: string;
  description: string;
  theme: string;
  genre: string | null;
  difficulty: string | null;
  tags: string[];
  like_count: number;
  play_count: number;
  is_premium: boolean;
  price_credits: number;
  published_at: string | null;
  creator: MarketplaceCreator | null;
}

/**
 * Game save info
 */
export interface GameSave {
  id: string;
  name: string;
  slot: number;
  play_time_seconds: number;
  updated_at: string;
}

/**
 * Play history entry
 */
export interface PlayHistoryEntry {
  play_time_seconds: number;
  completed: boolean;
  last_played_at: string;
  universe: HistoryUniverse;
  last_save: GameSave | null;
}

/**
 * Full game save with state
 */
export interface FullGameSave {
  id: string;
  user_id: string;
  universe_id: string;
  universe_version: number;
  name: string;
  slot: number;
  state: Record<string, unknown>;
  play_time_seconds: number;
  created_at: string;
  updated_at: string;
}

/**
 * Library store state
 */
interface LibraryState {
  // Play history
  history: PlayHistoryEntry[];
  totalHistory: number;
  isLoadingHistory: boolean;

  // Saves for current universe
  currentUniverseSaves: FullGameSave[];
  isLoadingSaves: boolean;

  // Bookmarks are loaded from social store

  // Error
  error: string | null;
}

/**
 * Library store actions
 */
interface LibraryActions {
  // Play history
  loadHistory: (offset?: number) => Promise<void>;
  updateHistory: (
    universeId: string,
    data: { saveId?: string; playTimeSeconds?: number; completed?: boolean }
  ) => Promise<void>;
  removeFromHistory: (universeId: string) => Promise<void>;

  // Saves
  loadSaves: (universeId: string) => Promise<void>;
  loadLatestSave: (universeId: string) => Promise<FullGameSave | null>;
  saveGame: (
    universeId: string,
    data: {
      slot?: number;
      name?: string;
      state: Record<string, unknown>;
      universeVersion?: number;
      playTimeSeconds?: number;
    }
  ) => Promise<FullGameSave | null>;
  deleteSave: (universeId: string, slot: number) => Promise<boolean>;
  deleteAllSaves: (universeId: string) => Promise<boolean>;

  // Reset
  reset: () => void;
  setError: (error: string | null) => void;
}

type LibraryStore = LibraryState & LibraryActions;

const API_BASE = "/api/saves";

const initialState: LibraryState = {
  history: [],
  totalHistory: 0,
  isLoadingHistory: false,
  currentUniverseSaves: [],
  isLoadingSaves: false,
  error: null,
};

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  ...initialState,

  // ============================================
  // PLAY HISTORY
  // ============================================

  loadHistory: async (offset = 0) => {
    set({ isLoadingHistory: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/history?limit=20&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load history");
      const data = await response.json();

      set((state) => ({
        history:
          offset > 0 ? [...state.history, ...data.history] : data.history,
        totalHistory: data.total,
        isLoadingHistory: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load history",
        isLoadingHistory: false,
      });
    }
  },

  updateHistory: async (universeId, data) => {
    try {
      const response = await fetch(`${API_BASE}/history/${universeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update history");
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update history" });
    }
  },

  removeFromHistory: async (universeId) => {
    try {
      const response = await fetch(`${API_BASE}/history/${universeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to remove from history");

      set((state) => ({
        history: state.history.filter((h) => h.universe.id !== universeId),
        totalHistory: state.totalHistory - 1,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to remove from history" });
    }
  },

  // ============================================
  // SAVES
  // ============================================

  loadSaves: async (universeId) => {
    set({ isLoadingSaves: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/${universeId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load saves");
      const saves = await response.json();

      set({
        currentUniverseSaves: saves,
        isLoadingSaves: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load saves",
        isLoadingSaves: false,
      });
    }
  },

  loadLatestSave: async (universeId) => {
    try {
      const response = await fetch(`${API_BASE}/${universeId}/latest`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to load save");
      }

      return await response.json();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load save" });
      return null;
    }
  },

  saveGame: async (universeId, data) => {
    try {
      const response = await fetch(`${API_BASE}/${universeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save game");
      const save: FullGameSave = await response.json();

      // Update saves list if we have it loaded
      set((state) => {
        const existingIndex = state.currentUniverseSaves.findIndex(
          (s) => s.slot === save.slot
        );
        if (existingIndex >= 0) {
          const newSaves = [...state.currentUniverseSaves];
          newSaves[existingIndex] = save;
          return { currentUniverseSaves: newSaves };
        } else {
          return { currentUniverseSaves: [...state.currentUniverseSaves, save] };
        }
      });

      return save;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to save game" });
      return null;
    }
  },

  deleteSave: async (universeId, slot) => {
    try {
      const response = await fetch(`${API_BASE}/${universeId}/${slot}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete save");

      set((state) => ({
        currentUniverseSaves: state.currentUniverseSaves.filter(
          (s) => s.slot !== slot
        ),
      }));

      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete save" });
      return false;
    }
  },

  deleteAllSaves: async (universeId) => {
    try {
      const response = await fetch(`${API_BASE}/${universeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete saves");

      set({ currentUniverseSaves: [] });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete saves" });
      return false;
    }
  },

  // Reset store
  reset: () => {
    set(initialState);
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// Selectors
export const usePlayHistory = () => useLibraryStore((state) => state.history);
export const useCurrentUniverseSaves = () =>
  useLibraryStore((state) => state.currentUniverseSaves);
export const useLibraryError = () => useLibraryStore((state) => state.error);

// Helper to format play time
export function formatPlayTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
