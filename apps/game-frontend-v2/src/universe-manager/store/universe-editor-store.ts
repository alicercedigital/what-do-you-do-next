import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { v2 } from "@wdydn/shared";

type Universe = v2.Universe;
type Stat = v2.Stat;
type Character = v2.Character;
type Location = v2.Location;
type Item = v2.Item;
type Challenge = v2.Challenge;
type Moment = v2.Moment;

export type EditorTab =
  | "helper"
  | "overview"
  | "stats"
  | "characters"
  | "locations"
  | "items"
  | "challenges"
  | "moments";

export type EntityType =
  | "stats"
  | "characters"
  | "locations"
  | "items"
  | "challenges"
  | "moments";

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Universe editor store state
 */
interface UniverseEditorState {
  // Core state
  universe: Universe | null;
  originalUniverse: Universe | null;
  metadata: UniverseMetadata | null;

  // UI state
  activeTab: EditorTab;
  selectedEntityId: string | null;

  // Edit tracking
  isDirty: boolean;
  lastSaved: number | null;
  isSaving: boolean;
  isLoading: boolean;
  isPublishing: boolean;
  error: string | null;

  // Validation
  validationErrors: ValidationError[];
}

/**
 * Universe metadata from API
 */
export interface UniverseMetadata {
  id: string;
  name: string;
  description: string;
  theme: string;
  visibility: "private" | "unlisted" | "public";
  is_published: boolean;
  published_at: string | null;
  version: number;
  owner_id: string;
}

/**
 * Universe editor store actions
 */
interface UniverseEditorActions {
  // Load/save
  loadUniverse: (id: string) => Promise<void>;
  loadUniverseMetadata: (id: string) => Promise<UniverseMetadata | null>;
  createUniverse: (data: Partial<Universe>) => Promise<string>;
  saveUniverse: () => Promise<void>;
  deleteUniverse: (id: string) => Promise<void>;
  duplicateUniverse: (id: string) => Promise<string>;

  // Publishing
  publishUniverse: () => Promise<boolean>;
  unpublishUniverse: () => Promise<boolean>;
  updateVisibility: (visibility: "private" | "unlisted" | "public") => Promise<boolean>;

  // Navigation
  setActiveTab: (tab: EditorTab) => void;
  selectEntity: (id: string | null) => void;

  // Universe updates
  updateUniverse: (updates: Partial<Universe>) => void;
  updateConfig: (updates: Partial<Universe["config"]>) => void;

  // Entity CRUD
  addStat: (stat: Stat) => void;
  updateStat: (id: string, updates: Partial<Stat>) => void;
  deleteStat: (id: string) => void;

  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addChallenge: (challenge: Challenge) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;

  addMoment: (moment: Moment) => void;
  updateMoment: (id: string, updates: Partial<Moment>) => void;
  deleteMoment: (id: string) => void;

  // Validation
  validate: () => ValidationError[];
  clearErrors: () => void;

  // Reset
  reset: () => void;
  setError: (error: string | null) => void;
}

type UniverseEditorStore = UniverseEditorState & UniverseEditorActions;

const API_BASE = "/api";

/**
 * Generate a readable entity ID
 * Format: {type}_{slug}_{shortId}
 * Example: char_elena_a3f2b1
 */
export function generateEntityId(type: string, name?: string): string {
  const shortId = Math.random().toString(36).slice(2, 8);
  if (name && name.trim()) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 20);
    return slug ? `${type}_${slug}_${shortId}` : `${type}_${shortId}`;
  }
  return `${type}_${shortId}`;
}

const initialState: UniverseEditorState = {
  universe: null,
  originalUniverse: null,
  metadata: null,
  activeTab: "overview",
  selectedEntityId: null,
  isDirty: false,
  lastSaved: null,
  isSaving: false,
  isLoading: false,
  isPublishing: false,
  error: null,
  validationErrors: [],
};

// Helper to create a default universe
function createDefaultUniverse(data: Partial<Universe>): Universe {
  return {
    id: data.id || `universe-${Date.now()}`,
    name: data.name || "New Universe",
    description: data.description || "",
    theme: data.theme || "fantasy",
    version: 1,
    config: {
      startingPoints: 10,
      pointsPerLevel: 5,
      experiencePerLevel: 100,
      equipmentSlots: ["weapon", "armor", "accessory"],
      ...data.config,
    },
    stats: data.stats || [],
    items: data.items || [],
    characters: data.characters || [],
    locations: data.locations || [],
    challenges: data.challenges || [],
    moments: data.moments || [],
  };
}

export const useUniverseEditorStore = create<UniverseEditorStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Load/save
      loadUniverse: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`${API_BASE}/universe/${id}`);
          if (!response.ok) {
            throw new Error("Failed to load universe");
          }
          const universe = await response.json();

          set((state) => {
            state.universe = universe;
            state.originalUniverse = JSON.parse(JSON.stringify(universe));
            state.isDirty = false;
            state.lastSaved = Date.now();
            state.isLoading = false;
            state.selectedEntityId = null;
          });

          // Also load metadata
          get().loadUniverseMetadata(id);
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to load universe";
            state.isLoading = false;
          });
        }
      },

      loadUniverseMetadata: async (id: string) => {
        try {
          const response = await fetch(`${API_BASE}/universe/${id}/metadata`);
          if (!response.ok) {
            return null;
          }
          const metadata = await response.json();
          set((state) => {
            state.metadata = metadata;
          });
          return metadata;
        } catch {
          return null;
        }
      },

      createUniverse: async (data: Partial<Universe>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const universe = createDefaultUniverse(data);

          const response = await fetch(`${API_BASE}/universe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(universe),
          });

          if (!response.ok) {
            throw new Error("Failed to create universe");
          }

          const result = await response.json();

          set((state) => {
            state.universe = universe;
            state.originalUniverse = JSON.parse(JSON.stringify(universe));
            state.isDirty = false;
            state.lastSaved = Date.now();
            state.isLoading = false;
          });

          return result.universeId;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to create universe";
            state.isLoading = false;
          });
          throw error;
        }
      },

      saveUniverse: async () => {
        const { universe } = get();
        if (!universe) return;

        set((state) => {
          state.isSaving = true;
          state.error = null;
        });

        try {
          const response = await fetch(`${API_BASE}/universe/${universe.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(universe),
          });

          if (!response.ok) {
            throw new Error("Failed to save universe");
          }

          set((state) => {
            state.originalUniverse = JSON.parse(JSON.stringify(universe));
            state.isDirty = false;
            state.lastSaved = Date.now();
            state.isSaving = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to save universe";
            state.isSaving = false;
          });
        }
      },

      deleteUniverse: async (id: string) => {
        try {
          const response = await fetch(`${API_BASE}/universe/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete universe");
          }

          // Reset state if we deleted the currently loaded universe
          if (get().universe?.id === id) {
            set(initialState);
          }
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to delete universe";
          });
          throw error;
        }
      },

      duplicateUniverse: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`${API_BASE}/universe/${id}/duplicate`, {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Failed to duplicate universe");
          }

          const result = await response.json();
          set((state) => {
            state.isLoading = false;
          });

          return result.universeId;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to duplicate universe";
            state.isLoading = false;
          });
          throw error;
        }
      },

      // Publishing
      publishUniverse: async () => {
        const { universe } = get();
        if (!universe) return false;

        set((state) => {
          state.isPublishing = true;
          state.error = null;
        });

        try {
          const response = await fetch(`${API_BASE}/universe/${universe.id}/publish`, {
            method: "POST",
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to publish universe");
          }

          // Reload metadata to get updated status
          await get().loadUniverseMetadata(universe.id);

          set((state) => {
            state.isPublishing = false;
          });

          return true;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to publish universe";
            state.isPublishing = false;
          });
          return false;
        }
      },

      unpublishUniverse: async () => {
        const { universe } = get();
        if (!universe) return false;

        set((state) => {
          state.isPublishing = true;
          state.error = null;
        });

        try {
          const response = await fetch(`${API_BASE}/universe/${universe.id}/unpublish`, {
            method: "POST",
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to unpublish universe");
          }

          // Reload metadata to get updated status
          await get().loadUniverseMetadata(universe.id);

          set((state) => {
            state.isPublishing = false;
          });

          return true;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to unpublish universe";
            state.isPublishing = false;
          });
          return false;
        }
      },

      updateVisibility: async (visibility: "private" | "unlisted" | "public") => {
        const { universe } = get();
        if (!universe) return false;

        set((state) => {
          state.isPublishing = true;
          state.error = null;
        });

        try {
          const response = await fetch(`${API_BASE}/universe/${universe.id}/visibility`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visibility }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to update visibility");
          }

          // Reload metadata to get updated status
          await get().loadUniverseMetadata(universe.id);

          set((state) => {
            state.isPublishing = false;
          });

          return true;
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : "Failed to update visibility";
            state.isPublishing = false;
          });
          return false;
        }
      },

      // Navigation
      setActiveTab: (tab: EditorTab) => {
        set((state) => {
          state.activeTab = tab;
          state.selectedEntityId = null;
        });
      },

      selectEntity: (id: string | null) => {
        set((state) => {
          state.selectedEntityId = id;
        });
      },

      // Universe updates
      updateUniverse: (updates: Partial<Universe>) => {
        set((state) => {
          if (state.universe) {
            Object.assign(state.universe, updates);
            state.isDirty = true;
          }
        });
      },

      updateConfig: (updates: Partial<Universe["config"]>) => {
        set((state) => {
          if (state.universe) {
            Object.assign(state.universe.config, updates);
            state.isDirty = true;
          }
        });
      },

      // Stats CRUD
      addStat: (stat: Stat) => {
        set((state) => {
          if (state.universe) {
            state.universe.stats.push(stat);
            state.isDirty = true;
            state.selectedEntityId = stat.id;
          }
        });
      },

      updateStat: (id: string, updates: Partial<Stat>) => {
        set((state) => {
          if (state.universe) {
            const index = state.universe.stats.findIndex((s) => s.id === id);
            if (index !== -1) {
              Object.assign(state.universe.stats[index], updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteStat: (id: string) => {
        set((state) => {
          if (state.universe) {
            state.universe.stats = state.universe.stats.filter((s) => s.id !== id);
            state.isDirty = true;
            if (state.selectedEntityId === id) {
              state.selectedEntityId = null;
            }
          }
        });
      },

      // Characters CRUD
      addCharacter: (character: Character) => {
        set((state) => {
          if (state.universe) {
            state.universe.characters.push(character);
            state.isDirty = true;
            state.selectedEntityId = character.id;
          }
        });
      },

      updateCharacter: (id: string, updates: Partial<Character>) => {
        set((state) => {
          if (state.universe) {
            const index = state.universe.characters.findIndex((c) => c.id === id);
            if (index !== -1) {
              Object.assign(state.universe.characters[index], updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteCharacter: (id: string) => {
        set((state) => {
          if (state.universe) {
            state.universe.characters = state.universe.characters.filter(
              (c) => c.id !== id
            );
            state.isDirty = true;
            if (state.selectedEntityId === id) {
              state.selectedEntityId = null;
            }
          }
        });
      },

      // Locations CRUD
      addLocation: (location: Location) => {
        set((state) => {
          if (state.universe) {
            state.universe.locations.push(location);
            state.isDirty = true;
            state.selectedEntityId = location.id;
          }
        });
      },

      updateLocation: (id: string, updates: Partial<Location>) => {
        set((state) => {
          if (state.universe) {
            const index = state.universe.locations.findIndex((l) => l.id === id);
            if (index !== -1) {
              Object.assign(state.universe.locations[index], updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteLocation: (id: string) => {
        set((state) => {
          if (state.universe) {
            state.universe.locations = state.universe.locations.filter(
              (l) => l.id !== id
            );
            state.isDirty = true;
            if (state.selectedEntityId === id) {
              state.selectedEntityId = null;
            }
          }
        });
      },

      // Items CRUD
      addItem: (item: Item) => {
        set((state) => {
          if (state.universe) {
            state.universe.items.push(item);
            state.isDirty = true;
            state.selectedEntityId = item.id;
          }
        });
      },

      updateItem: (id: string, updates: Partial<Item>) => {
        set((state) => {
          if (state.universe) {
            const index = state.universe.items.findIndex((i) => i.id === id);
            if (index !== -1) {
              Object.assign(state.universe.items[index], updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteItem: (id: string) => {
        set((state) => {
          if (state.universe) {
            state.universe.items = state.universe.items.filter((i) => i.id !== id);
            state.isDirty = true;
            if (state.selectedEntityId === id) {
              state.selectedEntityId = null;
            }
          }
        });
      },

      // Challenges CRUD
      addChallenge: (challenge: Challenge) => {
        set((state) => {
          if (state.universe) {
            state.universe.challenges.push(challenge);
            state.isDirty = true;
            state.selectedEntityId = challenge.id;
          }
        });
      },

      updateChallenge: (id: string, updates: Partial<Challenge>) => {
        set((state) => {
          if (state.universe) {
            const index = state.universe.challenges.findIndex((c) => c.id === id);
            if (index !== -1) {
              Object.assign(state.universe.challenges[index], updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteChallenge: (id: string) => {
        set((state) => {
          if (state.universe) {
            state.universe.challenges = state.universe.challenges.filter(
              (c) => c.id !== id
            );
            state.isDirty = true;
            if (state.selectedEntityId === id) {
              state.selectedEntityId = null;
            }
          }
        });
      },

      // Moments CRUD
      addMoment: (moment: Moment) => {
        set((state) => {
          if (state.universe) {
            state.universe.moments.push(moment);
            state.isDirty = true;
            state.selectedEntityId = moment.id;
          }
        });
      },

      updateMoment: (id: string, updates: Partial<Moment>) => {
        set((state) => {
          if (state.universe) {
            const index = state.universe.moments.findIndex((m) => m.id === id);
            if (index !== -1) {
              Object.assign(state.universe.moments[index], updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteMoment: (id: string) => {
        set((state) => {
          if (state.universe) {
            state.universe.moments = state.universe.moments.filter(
              (m) => m.id !== id
            );
            state.isDirty = true;
            if (state.selectedEntityId === id) {
              state.selectedEntityId = null;
            }
          }
        });
      },

      // Validation
      validate: () => {
        const { universe } = get();
        const errors: ValidationError[] = [];

        if (!universe) {
          return errors;
        }

        // Required fields
        if (!universe.name.trim()) {
          errors.push({
            path: "name",
            message: "Universe name is required",
            severity: "error",
          });
        }

        if (!universe.description.trim()) {
          errors.push({
            path: "description",
            message: "Universe description is required",
            severity: "warning",
          });
        }

        // Check for duplicate IDs
        const statIds = new Set<string>();
        universe.stats.forEach((stat, index) => {
          if (statIds.has(stat.id)) {
            errors.push({
              path: `stats[${index}].id`,
              message: `Duplicate stat ID: ${stat.id}`,
              severity: "error",
            });
          }
          statIds.add(stat.id);
        });

        const characterIds = new Set<string>();
        universe.characters.forEach((char, index) => {
          if (characterIds.has(char.id)) {
            errors.push({
              path: `characters[${index}].id`,
              message: `Duplicate character ID: ${char.id}`,
              severity: "error",
            });
          }
          characterIds.add(char.id);
        });

        const locationIds = new Set<string>();
        universe.locations.forEach((loc, index) => {
          if (locationIds.has(loc.id)) {
            errors.push({
              path: `locations[${index}].id`,
              message: `Duplicate location ID: ${loc.id}`,
              severity: "error",
            });
          }
          locationIds.add(loc.id);
        });

        const itemIds = new Set<string>();
        universe.items.forEach((item, index) => {
          if (itemIds.has(item.id)) {
            errors.push({
              path: `items[${index}].id`,
              message: `Duplicate item ID: ${item.id}`,
              severity: "error",
            });
          }
          itemIds.add(item.id);
        });

        const momentIds = new Set<string>();
        universe.moments.forEach((moment, index) => {
          if (momentIds.has(moment.id)) {
            errors.push({
              path: `moments[${index}].id`,
              message: `Duplicate moment ID: ${moment.id}`,
              severity: "error",
            });
          }
          momentIds.add(moment.id);

          // Check location references
          if (moment.locationId && !locationIds.has(moment.locationId)) {
            errors.push({
              path: `moments[${index}].locationId`,
              message: `Invalid location reference: ${moment.locationId}`,
              severity: "error",
            });
          }
        });

        set((state) => {
          state.validationErrors = errors;
        });

        return errors;
      },

      clearErrors: () => {
        set((state) => {
          state.validationErrors = [];
          state.error = null;
        });
      },

      // Reset
      reset: () => {
        set(initialState);
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },
    })),
    {
      name: "wdydn-universe-editor",
      partialize: (state) => ({
        // Only persist the universe ID for recovery
        activeTab: state.activeTab,
      }),
    }
  )
);

// Selectors
export const useUniverse = () =>
  useUniverseEditorStore((state) => state.universe);

export const useActiveTab = () =>
  useUniverseEditorStore((state) => state.activeTab);

export const useSelectedEntityId = () =>
  useUniverseEditorStore((state) => state.selectedEntityId);

export const useIsDirty = () =>
  useUniverseEditorStore((state) => state.isDirty);

export const useIsLoading = () =>
  useUniverseEditorStore((state) => state.isLoading);

export const useIsSaving = () =>
  useUniverseEditorStore((state) => state.isSaving);

export const useEditorError = () =>
  useUniverseEditorStore((state) => state.error);

export const useValidationErrors = () =>
  useUniverseEditorStore((state) => state.validationErrors);

export const useUniverseMetadata = () =>
  useUniverseEditorStore((state) => state.metadata);

export const useIsPublishing = () =>
  useUniverseEditorStore((state) => state.isPublishing);
