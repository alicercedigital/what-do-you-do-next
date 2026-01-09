import { create } from "zustand";

export interface LibraryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  uploadedAt: number;
  filename: string;
  type: "character" | "location" | "item" | "general";
}

interface ImageLibraryState {
  images: LibraryImage[];
  isLoading: boolean;
  error: string | null;
  selectedImageId: string | null;
  searchQuery: string;
  filterType: LibraryImage["type"] | "all";
  filterTags: string[];
}

interface ImageLibraryActions {
  setImages: (images: LibraryImage[]) => void;
  addImage: (image: LibraryImage) => void;
  removeImage: (id: string) => void;
  updateImageTags: (id: string, tags: string[]) => void;
  selectImage: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: LibraryImage["type"] | "all") => void;
  setFilterTags: (tags: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchImages: (universeId: string) => Promise<void>;
  uploadImage: (universeId: string, file: File, type: LibraryImage["type"], tags: string[]) => Promise<LibraryImage | null>;
  deleteImage: (id: string) => Promise<boolean>;
  updateTags: (id: string, tags: string[]) => Promise<boolean>;
}

export const useImageLibraryStore = create<ImageLibraryState & ImageLibraryActions>(
  (set, get) => ({
    // State
    images: [],
    isLoading: false,
    error: null,
    selectedImageId: null,
    searchQuery: "",
    filterType: "all",
    filterTags: [],

    // Sync actions
    setImages: (images) => set({ images }),
    addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
    removeImage: (id) =>
      set((state) => ({
        images: state.images.filter((img) => img.id !== id),
        selectedImageId: state.selectedImageId === id ? null : state.selectedImageId,
      })),
    updateImageTags: (id, tags) =>
      set((state) => ({
        images: state.images.map((img) =>
          img.id === id ? { ...img, tags } : img
        ),
      })),
    selectImage: (id) => set({ selectedImageId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterType: (type) => set({ filterType: type }),
    setFilterTags: (tags) => set({ filterTags: tags }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Async actions
    fetchImages: async (universeId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/images?universeId=${universeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = await response.json();
        set({ images: data.images || [], isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        });
      }
    },

    uploadImage: async (universeId, file, type, tags) => {
      set({ isLoading: true, error: null });
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("universeId", universeId);
        formData.append("type", type);
        formData.append("tags", JSON.stringify(tags));

        const response = await fetch("/api/images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        const image = data.image as LibraryImage;
        get().addImage(image);
        set({ isLoading: false });
        return image;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        });
        return null;
      }
    },

    deleteImage: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/images/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete image");
        }

        get().removeImage(id);
        set({ isLoading: false });
        return true;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Unknown error",
          isLoading: false,
        });
        return false;
      }
    },

    updateTags: async (id, tags) => {
      try {
        const response = await fetch(`/api/images/${id}/tags`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags }),
        });

        if (!response.ok) {
          throw new Error("Failed to update tags");
        }

        get().updateImageTags(id, tags);
        return true;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    },
  })
);

// Selectors
export const selectFilteredImages = (state: ImageLibraryState): LibraryImage[] => {
  let filtered = state.images;

  // Filter by type
  if (state.filterType !== "all") {
    filtered = filtered.filter((img) => img.type === state.filterType);
  }

  // Filter by tags
  if (state.filterTags.length > 0) {
    filtered = filtered.filter((img) =>
      state.filterTags.every((tag) => img.tags.includes(tag))
    );
  }

  // Filter by search query
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (img) =>
        img.filename.toLowerCase().includes(query) ||
        img.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
};
