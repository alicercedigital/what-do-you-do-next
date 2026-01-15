import type { v2 } from "@wdydn/shared";
type GameState = v2.GameState;
type Universe = v2.Universe;
import type { ChallengeRuntimeState } from "./engine/challenge-processor";
import { supabaseAdmin, isSupabaseConfigured } from "./lib/supabase";
import type { Database, Json } from "./lib/database.types";

// Type helpers for Supabase queries
type Tables = Database["public"]["Tables"];
type GameSaveRow = Tables["game_saves"]["Row"];
type GameSaveInsert = Tables["game_saves"]["Insert"];
type UniverseRow = Tables["universes"]["Row"];
type UniverseInsert = Tables["universes"]["Insert"];
type UniverseUpdate = Tables["universes"]["Update"];

// Type-safe query helpers to work around Supabase type inference issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

/**
 * Storage layer for games and universes.
 *
 * Uses Supabase when configured, falls back to in-memory storage for development.
 */

export interface StoredGame {
  state: GameState;
  universe: Universe;
}

// In-memory fallback storage (for development without Supabase)
const memoryGames = new Map<string, StoredGame>();
const memoryUniverses = new Map<string, Universe>();
const memoryChallengeStates = new Map<string, ChallengeRuntimeState>();

// =============================================================================
// GAME STORAGE
// =============================================================================

/**
 * Get a game by ID
 */
export async function getGame(gameId: string): Promise<StoredGame | undefined> {
  if (!isSupabaseConfigured()) {
    return memoryGames.get(gameId);
  }

  const { data: save, error } = await db
    .from("game_saves")
    .select("state, universe_id")
    .eq("id", gameId)
    .single();

  if (error || !save) return undefined;

  const typedSave = save as Pick<GameSaveRow, "state" | "universe_id">;

  // Get universe data
  const { data: universeRow } = await db
    .from("universes")
    .select("data")
    .eq("id", typedSave.universe_id)
    .single();

  if (!universeRow) return undefined;

  const typedUniverseRow = universeRow as Pick<UniverseRow, "data">;

  return {
    state: typedSave.state as unknown as GameState,
    universe: typedUniverseRow.data as unknown as Universe,
  };
}

/**
 * Save a game
 */
export async function saveGame(
  game: StoredGame,
  userId?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryGames.set(game.state.id, game);
    return;
  }

  // For Supabase, we need a user context
  if (!userId) {
    // Fallback to memory if no user
    memoryGames.set(game.state.id, game);
    return;
  }

  const saveData: GameSaveInsert = {
    id: game.state.id,
    user_id: userId,
    universe_id: game.state.universeId,
    universe_version: game.universe.version,
    state: game.state as unknown as Json,
    moments_lived: game.state.moments.filter((m) => m.status === "lived").length,
    updated_at: new Date().toISOString(),
  };

  const { error } = await db.from("game_saves").upsert(saveData);

  if (error) {
    console.error("Failed to save game:", error);
    // Fallback to memory
    memoryGames.set(game.state.id, game);
  }
}

/**
 * Delete a game
 */
export async function deleteGame(gameId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return memoryGames.delete(gameId);
  }

  const { error } = await db.from("game_saves").delete().eq("id", gameId);

  if (error) {
    console.error("Failed to delete game:", error);
    return false;
  }

  return true;
}

/**
 * Get all games (for a user)
 */
export async function getAllGames(userId?: string): Promise<StoredGame[]> {
  if (!isSupabaseConfigured()) {
    return Array.from(memoryGames.values());
  }

  if (!userId) {
    return Array.from(memoryGames.values());
  }

  const { data: saves, error } = await db
    .from("game_saves")
    .select("id, state, universe_id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !saves) return [];

  const typedSaves = saves as Array<Pick<GameSaveRow, "id" | "state" | "universe_id">>;

  // Get universes for all saves
  const universeIds = Array.from(new Set(typedSaves.map((s) => s.universe_id)));
  const { data: universes } = await db
    .from("universes")
    .select("id, data")
    .in("id", universeIds);

  const typedUniverses = (universes ?? []) as Array<Pick<UniverseRow, "id" | "data">>;

  const universeMap = new Map(
    typedUniverses.map((u) => [u.id, u.data as unknown as Universe])
  );

  return typedSaves
    .map((save) => ({
      state: save.state as unknown as GameState,
      universe: universeMap.get(save.universe_id)!,
    }))
    .filter((g) => g.universe);
}

// =============================================================================
// UNIVERSE STORAGE
// =============================================================================

/**
 * Get a universe by ID
 */
export async function getUniverse(
  universeId: string
): Promise<Universe | undefined> {
  if (!isSupabaseConfigured()) {
    return memoryUniverses.get(universeId);
  }

  const { data, error } = await db
    .from("universes")
    .select("data")
    .eq("id", universeId)
    .single();

  if (error || !data) {
    // Fallback to memory
    return memoryUniverses.get(universeId);
  }

  const typedData = data as Pick<UniverseRow, "data">;
  return typedData.data as unknown as Universe;
}

/**
 * Save a universe
 */
export async function saveUniverse(
  universe: Universe,
  userId?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryUniverses.set(universe.id, universe);
    return;
  }

  // For Supabase, we need a user context for new universes
  if (!userId) {
    // Fallback to memory if no user
    memoryUniverses.set(universe.id, universe);
    return;
  }

  // Check if universe exists
  const { data: existing } = await db
    .from("universes")
    .select("id, owner_id")
    .eq("id", universe.id)
    .single();

  if (existing) {
    // Update existing (only if owner matches)
    const updateData: UniverseUpdate = {
      name: universe.name,
      description: universe.description,
      theme: universe.theme,
      data: universe as unknown as Json,
      version: universe.version,
      updated_at: new Date().toISOString(),
    };

    const { error } = await db
      .from("universes")
      .update(updateData)
      .eq("id", universe.id)
      .eq("owner_id", userId);

    if (error) {
      console.error("Failed to update universe:", error);
    }
  } else {
    // Insert new
    const insertData: UniverseInsert = {
      id: universe.id,
      owner_id: userId,
      name: universe.name,
      description: universe.description,
      theme: universe.theme,
      data: universe as unknown as Json,
      version: universe.version,
    };

    const { error } = await db.from("universes").insert(insertData);

    if (error) {
      console.error("Failed to insert universe:", error);
      // Fallback to memory
      memoryUniverses.set(universe.id, universe);
    }
  }
}

/**
 * Delete a universe
 */
export async function deleteUniverse(universeId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return memoryUniverses.delete(universeId);
  }

  const { error } = await db.from("universes").delete().eq("id", universeId);

  if (error) {
    console.error("Failed to delete universe:", error);
    return false;
  }

  return true;
}

/**
 * Get all universes (for a user)
 */
export async function getAllUniverses(userId?: string): Promise<Universe[]> {
  if (!isSupabaseConfigured()) {
    return Array.from(memoryUniverses.values());
  }

  let result: { data: unknown; error: unknown };

  if (userId) {
    // Get user's own universes + public universes
    result = await db
      .from("universes")
      .select("data")
      .or(`owner_id.eq.${userId},and(visibility.eq.public,is_published.eq.true)`);
  } else {
    // Only public published universes
    result = await db
      .from("universes")
      .select("data")
      .eq("visibility", "public")
      .eq("is_published", true);
  }

  if (result.error || !result.data) {
    // Fallback to memory
    return Array.from(memoryUniverses.values());
  }

  const data = result.data as Array<Pick<UniverseRow, "data">>;
  return data.map((row) => row.data as unknown as Universe);
}

/**
 * Get universe summaries (for listing)
 */
type UniverseSummary = Pick<UniverseRow, "id" | "name" | "description" | "theme">;

export async function getUniverseSummaries(
  userId?: string
): Promise<Array<UniverseSummary>> {
  if (!isSupabaseConfigured()) {
    return Array.from(memoryUniverses.values()).map((u) => ({
      id: u.id,
      name: u.name,
      description: u.description,
      theme: u.theme,
    }));
  }

  let result: { data: unknown; error: unknown };

  if (userId) {
    result = await db
      .from("universes")
      .select("id, name, description, theme")
      .or(`owner_id.eq.${userId},and(visibility.eq.public,is_published.eq.true)`);
  } else {
    result = await db
      .from("universes")
      .select("id, name, description, theme")
      .eq("visibility", "public")
      .eq("is_published", true);
  }

  if (result.error || !result.data) {
    return Array.from(memoryUniverses.values()).map((u) => ({
      id: u.id,
      name: u.name,
      description: u.description,
      theme: u.theme,
    }));
  }

  return result.data as UniverseSummary[];
}

// =============================================================================
// UNIVERSE METADATA & PUBLISHING
// =============================================================================

type UniverseMetadata = Pick<
  UniverseRow,
  "id" | "name" | "description" | "theme" | "owner_id" | "visibility" | "is_published" | "version" | "created_at" | "updated_at"
>;

/**
 * Get universe with metadata (visibility, owner, etc.)
 */
export async function getUniverseWithMetadata(
  universeId: string
): Promise<UniverseMetadata | undefined> {
  if (!isSupabaseConfigured()) {
    const universe = memoryUniverses.get(universeId);
    if (!universe) return undefined;
    return {
      id: universe.id,
      name: universe.name,
      description: universe.description,
      theme: universe.theme,
      owner_id: "dev-user-id",
      visibility: "private",
      is_published: false,
      version: universe.version,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const { data, error } = await db
    .from("universes")
    .select("id, name, description, theme, owner_id, visibility, is_published, version, created_at, updated_at")
    .eq("id", universeId)
    .single();

  if (error || !data) return undefined;
  return data as UniverseMetadata;
}

/**
 * Publish a universe (make it publicly visible)
 */
export async function publishUniverse(
  universeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  // Check ownership
  const { data: universe } = await db
    .from("universes")
    .select("owner_id")
    .eq("id", universeId)
    .single();

  if (!universe) {
    return { success: false, error: "Universe not found" };
  }

  if (universe.owner_id !== userId) {
    return { success: false, error: "Not authorized" };
  }

  const { error } = await db
    .from("universes")
    .update({
      visibility: "public",
      is_published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", universeId);

  if (error) {
    console.error("Failed to publish universe:", error);
    return { success: false, error: "Failed to publish" };
  }

  return { success: true };
}

/**
 * Unpublish a universe (make it private)
 */
export async function unpublishUniverse(
  universeId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  // Check ownership
  const { data: universe } = await db
    .from("universes")
    .select("owner_id")
    .eq("id", universeId)
    .single();

  if (!universe) {
    return { success: false, error: "Universe not found" };
  }

  if (universe.owner_id !== userId) {
    return { success: false, error: "Not authorized" };
  }

  const { error } = await db
    .from("universes")
    .update({
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", universeId);

  if (error) {
    console.error("Failed to unpublish universe:", error);
    return { success: false, error: "Failed to unpublish" };
  }

  return { success: true };
}

/**
 * Update universe visibility
 */
export async function updateUniverseVisibility(
  universeId: string,
  userId: string,
  visibility: "private" | "unlisted" | "public"
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  // Check ownership
  const { data: universe } = await db
    .from("universes")
    .select("owner_id")
    .eq("id", universeId)
    .single();

  if (!universe) {
    return { success: false, error: "Universe not found" };
  }

  if (universe.owner_id !== userId) {
    return { success: false, error: "Not authorized" };
  }

  const { error } = await db
    .from("universes")
    .update({
      visibility,
      updated_at: new Date().toISOString(),
    })
    .eq("id", universeId);

  if (error) {
    console.error("Failed to update visibility:", error);
    return { success: false, error: "Failed to update visibility" };
  }

  return { success: true };
}

// =============================================================================
// UNIVERSE VERSIONING
// =============================================================================

type UniverseVersionRow = Tables["universe_versions"]["Row"];

interface UniverseVersion {
  id: string;
  version: number;
  changelog: string | null;
  created_at: string;
}

/**
 * Get version history for a universe
 */
export async function getUniverseVersions(
  universeId: string
): Promise<UniverseVersion[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await db
    .from("universe_versions")
    .select("id, version, changelog, created_at")
    .eq("universe_id", universeId)
    .order("version", { ascending: false });

  if (error || !data) return [];
  return data as UniverseVersion[];
}

/**
 * Create a new version snapshot
 */
export async function createUniverseVersion(
  universeId: string,
  userId: string,
  changelog?: string
): Promise<{ success: boolean; version?: number; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, version: 1 };
  }

  // Get current universe
  const { data: universe } = await db
    .from("universes")
    .select("owner_id, data, version")
    .eq("id", universeId)
    .single();

  if (!universe) {
    return { success: false, error: "Universe not found" };
  }

  if (universe.owner_id !== userId) {
    return { success: false, error: "Not authorized" };
  }

  const newVersion = (universe.version || 0) + 1;

  // Create version snapshot
  const { error: versionError } = await db.from("universe_versions").insert({
    universe_id: universeId,
    version: newVersion,
    data: universe.data,
    changelog: changelog || null,
  });

  if (versionError) {
    console.error("Failed to create version:", versionError);
    return { success: false, error: "Failed to create version" };
  }

  // Update universe version number
  const { error: updateError } = await db
    .from("universes")
    .update({ version: newVersion, updated_at: new Date().toISOString() })
    .eq("id", universeId);

  if (updateError) {
    console.error("Failed to update universe version:", updateError);
  }

  return { success: true, version: newVersion };
}

/**
 * Get a specific version of a universe
 */
export async function getUniverseVersion(
  universeId: string,
  version: number
): Promise<Universe | undefined> {
  if (!isSupabaseConfigured()) {
    return memoryUniverses.get(universeId);
  }

  const { data, error } = await db
    .from("universe_versions")
    .select("data")
    .eq("universe_id", universeId)
    .eq("version", version)
    .single();

  if (error || !data) return undefined;
  return (data as { data: Json }).data as unknown as Universe;
}

// =============================================================================
// CHALLENGE STATE STORAGE (always in-memory for now)
// =============================================================================

/**
 * Get challenge state for a game
 */
export function getChallengeState(
  gameId: string
): ChallengeRuntimeState | undefined {
  return memoryChallengeStates.get(gameId);
}

/**
 * Save challenge state for a game
 */
export function saveChallengeState(
  gameId: string,
  state: ChallengeRuntimeState
): void {
  memoryChallengeStates.set(gameId, state);
}

/**
 * Delete challenge state for a game
 */
export function deleteChallengeState(gameId: string): boolean {
  return memoryChallengeStates.delete(gameId);
}

// =============================================================================
// UTILITY
// =============================================================================

/**
 * Clear all storage (for testing)
 */
export function clearAll(): void {
  memoryGames.clear();
  memoryUniverses.clear();
  memoryChallengeStates.clear();
}

// Legacy exports for backward compatibility
export const games = memoryGames;
export const universes = memoryUniverses;
export const challengeStates = memoryChallengeStates;
