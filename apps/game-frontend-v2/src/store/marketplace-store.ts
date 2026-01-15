import { create } from "zustand";

/**
 * Creator profile for marketplace listings
 */
export interface MarketplaceCreator {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

/**
 * Universe item for marketplace listings
 */
export interface MarketplaceUniverse {
  id: string;
  name: string;
  description: string;
  theme: string;
  genre: string | null;
  difficulty: string | null;
  tags: string[];
  like_count: number;
  play_count: number;
  comment_count: number;
  is_premium: boolean;
  price_credits: number;
  published_at: string | null;
  creator: MarketplaceCreator | null;
}

/**
 * Full creator profile
 */
export interface CreatorProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  follower_count: number;
}

/**
 * Universe detail with user interaction
 */
export interface UniverseDetail extends MarketplaceUniverse {
  bookmark_count: number;
  estimated_playtime_minutes: number | null;
  userInteraction: {
    liked: boolean;
    bookmarked: boolean;
  };
}

/**
 * Genre option
 */
export interface Genre {
  id: string;
  name: string;
  icon: string;
}

/**
 * Search filters
 */
export interface SearchFilters {
  q?: string;
  genre?: string;
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard" | "expert";
  sort?: "newest" | "popular" | "likes" | "plays";
  premium?: boolean;
}

/**
 * Search results
 */
export interface SearchResults {
  results: MarketplaceUniverse[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Marketplace store state
 */
interface MarketplaceState {
  // Featured/discovery sections
  featured: MarketplaceUniverse[];
  trending: MarketplaceUniverse[];
  newReleases: MarketplaceUniverse[];
  topRated: MarketplaceUniverse[];

  // Search
  searchResults: SearchResults | null;
  searchFilters: SearchFilters;

  // Detail views
  currentUniverse: UniverseDetail | null;
  currentCreator: { profile: CreatorProfile; universes: MarketplaceUniverse[] } | null;

  // Genres
  genres: Genre[];

  // Loading states
  isLoadingFeatured: boolean;
  isLoadingTrending: boolean;
  isLoadingNew: boolean;
  isLoadingTop: boolean;
  isLoadingSearch: boolean;
  isLoadingUniverse: boolean;
  isLoadingCreator: boolean;

  // Error state
  error: string | null;
}

/**
 * Marketplace store actions
 */
interface MarketplaceActions {
  // Load sections
  loadFeatured: () => Promise<void>;
  loadTrending: () => Promise<void>;
  loadNew: () => Promise<void>;
  loadTop: () => Promise<void>;
  loadGenres: () => Promise<void>;

  // Search
  search: (filters?: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  setSearchFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;

  // Detail views
  loadUniverse: (id: string) => Promise<void>;
  loadCreator: (username: string) => Promise<void>;

  // Reset
  reset: () => void;
  setError: (error: string | null) => void;
}

type MarketplaceStore = MarketplaceState & MarketplaceActions;

const API_BASE = "/api/marketplace";

const initialState: MarketplaceState = {
  featured: [],
  trending: [],
  newReleases: [],
  topRated: [],
  searchResults: null,
  searchFilters: {},
  currentUniverse: null,
  currentCreator: null,
  genres: [],
  isLoadingFeatured: false,
  isLoadingTrending: false,
  isLoadingNew: false,
  isLoadingTop: false,
  isLoadingSearch: false,
  isLoadingUniverse: false,
  isLoadingCreator: false,
  error: null,
};

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  ...initialState,

  // Load featured universes
  loadFeatured: async () => {
    set({ isLoadingFeatured: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/featured`);
      if (!response.ok) throw new Error("Failed to load featured");
      const data = await response.json();
      set({ featured: data, isLoadingFeatured: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load featured",
        isLoadingFeatured: false,
      });
    }
  },

  // Load trending universes
  loadTrending: async () => {
    set({ isLoadingTrending: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/trending`);
      if (!response.ok) throw new Error("Failed to load trending");
      const data = await response.json();
      set({ trending: data, isLoadingTrending: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load trending",
        isLoadingTrending: false,
      });
    }
  },

  // Load new releases
  loadNew: async () => {
    set({ isLoadingNew: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/new`);
      if (!response.ok) throw new Error("Failed to load new releases");
      const data = await response.json();
      set({ newReleases: data, isLoadingNew: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load new releases",
        isLoadingNew: false,
      });
    }
  },

  // Load top rated
  loadTop: async () => {
    set({ isLoadingTop: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/top`);
      if (!response.ok) throw new Error("Failed to load top rated");
      const data = await response.json();
      set({ topRated: data, isLoadingTop: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load top rated",
        isLoadingTop: false,
      });
    }
  },

  // Load genres
  loadGenres: async () => {
    try {
      const response = await fetch(`${API_BASE}/genres`);
      if (!response.ok) throw new Error("Failed to load genres");
      const data = await response.json();
      set({ genres: data });
    } catch (err) {
      console.error("Failed to load genres:", err);
    }
  },

  // Search universes
  search: async (filters?: SearchFilters) => {
    const searchFilters = filters ?? get().searchFilters;
    set({ isLoadingSearch: true, error: null, searchFilters });

    try {
      const params = new URLSearchParams();
      if (searchFilters.q) params.set("q", searchFilters.q);
      if (searchFilters.genre) params.set("genre", searchFilters.genre);
      if (searchFilters.tags?.length) params.set("tags", searchFilters.tags.join(","));
      if (searchFilters.difficulty) params.set("difficulty", searchFilters.difficulty);
      if (searchFilters.sort) params.set("sort", searchFilters.sort);
      if (searchFilters.premium !== undefined) params.set("premium", String(searchFilters.premium));
      params.set("limit", "20");
      params.set("offset", "0");

      const response = await fetch(`${API_BASE}/search?${params}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      set({ searchResults: data, isLoadingSearch: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Search failed",
        isLoadingSearch: false,
      });
    }
  },

  // Load more search results
  loadMore: async () => {
    const { searchResults, searchFilters, isLoadingSearch } = get();
    if (!searchResults || isLoadingSearch) return;

    const newOffset = searchResults.offset + searchResults.limit;
    if (newOffset >= searchResults.total) return;

    set({ isLoadingSearch: true });

    try {
      const params = new URLSearchParams();
      if (searchFilters.q) params.set("q", searchFilters.q);
      if (searchFilters.genre) params.set("genre", searchFilters.genre);
      if (searchFilters.tags?.length) params.set("tags", searchFilters.tags.join(","));
      if (searchFilters.difficulty) params.set("difficulty", searchFilters.difficulty);
      if (searchFilters.sort) params.set("sort", searchFilters.sort);
      if (searchFilters.premium !== undefined) params.set("premium", String(searchFilters.premium));
      params.set("limit", "20");
      params.set("offset", String(newOffset));

      const response = await fetch(`${API_BASE}/search?${params}`);
      if (!response.ok) throw new Error("Failed to load more");
      const data = await response.json();

      set({
        searchResults: {
          ...data,
          results: [...searchResults.results, ...data.results],
        },
        isLoadingSearch: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load more",
        isLoadingSearch: false,
      });
    }
  },

  // Set search filters (without searching)
  setSearchFilters: (filters: SearchFilters) => {
    set({ searchFilters: filters });
  },

  // Clear search
  clearSearch: () => {
    set({ searchResults: null, searchFilters: {} });
  },

  // Load universe detail
  loadUniverse: async (id: string) => {
    set({ isLoadingUniverse: true, error: null, currentUniverse: null });
    try {
      const response = await fetch(`${API_BASE}/universe/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Universe not found");
        }
        throw new Error("Failed to load universe");
      }
      const data = await response.json();
      set({ currentUniverse: data, isLoadingUniverse: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load universe",
        isLoadingUniverse: false,
      });
    }
  },

  // Load creator profile
  loadCreator: async (username: string) => {
    set({ isLoadingCreator: true, error: null, currentCreator: null });
    try {
      const response = await fetch(`${API_BASE}/creator/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Creator not found");
        }
        throw new Error("Failed to load creator");
      }
      const data = await response.json();
      set({ currentCreator: data, isLoadingCreator: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load creator",
        isLoadingCreator: false,
      });
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
export const useFeatured = () => useMarketplaceStore((state) => state.featured);
export const useTrending = () => useMarketplaceStore((state) => state.trending);
export const useNewReleases = () => useMarketplaceStore((state) => state.newReleases);
export const useTopRated = () => useMarketplaceStore((state) => state.topRated);
export const useSearchResults = () => useMarketplaceStore((state) => state.searchResults);
export const useSearchFilters = () => useMarketplaceStore((state) => state.searchFilters);
export const useCurrentUniverse = () => useMarketplaceStore((state) => state.currentUniverse);
export const useCurrentCreator = () => useMarketplaceStore((state) => state.currentCreator);
export const useGenres = () => useMarketplaceStore((state) => state.genres);
export const useMarketplaceError = () => useMarketplaceStore((state) => state.error);
