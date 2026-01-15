import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Filter, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { UniverseGrid } from "./components/universe-grid";
import { useMarketplaceStore, type SearchFilters } from "@/store/marketplace-store";

const GENRES = [
  { id: "fantasy", name: "Fantasy" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "horror", name: "Horror" },
  { id: "mystery", name: "Mystery" },
  { id: "romance", name: "Romance" },
  { id: "adventure", name: "Adventure" },
  { id: "comedy", name: "Comedy" },
  { id: "drama", name: "Drama" },
  { id: "historical", name: "Historical" },
  { id: "slice-of-life", name: "Slice of Life" },
];

const DIFFICULTIES = [
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "hard", name: "Hard" },
  { id: "expert", name: "Expert" },
];

const SORT_OPTIONS = [
  { id: "popular", name: "Most Popular" },
  { id: "newest", name: "Newest First" },
  { id: "likes", name: "Most Liked" },
  { id: "plays", name: "Most Played" },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    searchResults,
    searchFilters,
    isLoadingSearch,
    search,
    loadMore,
    setSearchFilters,
    clearSearch,
  } = useMarketplaceStore();

  // Initialize filters from URL params
  useEffect(() => {
    const filters: SearchFilters = {};
    const q = searchParams.get("q");
    const genre = searchParams.get("genre");
    const difficulty = searchParams.get("difficulty");
    const sort = searchParams.get("sort");
    const premium = searchParams.get("premium");

    if (q) filters.q = q;
    if (genre) filters.genre = genre;
    if (difficulty) filters.difficulty = difficulty as SearchFilters["difficulty"];
    if (sort) filters.sort = sort as SearchFilters["sort"];
    if (premium === "true") filters.premium = true;
    if (premium === "false") filters.premium = false;

    setSearchFilters(filters);
    search(filters);
  }, [searchParams, search, setSearchFilters]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...searchFilters, ...newFilters };
    const params = new URLSearchParams();

    if (updatedFilters.q) params.set("q", updatedFilters.q);
    if (updatedFilters.genre) params.set("genre", updatedFilters.genre);
    if (updatedFilters.difficulty) params.set("difficulty", updatedFilters.difficulty);
    if (updatedFilters.sort) params.set("sort", updatedFilters.sort);
    if (updatedFilters.premium !== undefined)
      params.set("premium", String(updatedFilters.premium));

    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    updateFilters({ q: query.trim() || undefined });
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...searchFilters };
    delete newFilters[key];
    updateFilters(newFilters);
  };

  const clearAllFilters = () => {
    clearSearch();
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [
    searchFilters.genre,
    searchFilters.difficulty,
    searchFilters.sort !== "popular" ? searchFilters.sort : undefined,
    searchFilters.premium !== undefined ? "premium" : undefined,
  ].filter(Boolean).length;

  const hasMoreResults =
    searchResults && searchResults.offset + searchResults.limit < searchResults.total;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/marketplace")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Search universes..."
                  defaultValue={searchFilters.q}
                  className="pl-9"
                />
              </div>
            </form>

            {/* Filter button (mobile) */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative lg:hidden">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-5 w-5 p-0">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Refine your search results</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <FilterControls
                    filters={searchFilters}
                    onFilterChange={(filters) => {
                      updateFilters(filters);
                      setFilterOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                )}
              </div>
              <FilterControls filters={searchFilters} onFilterChange={updateFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Active filters */}
            {(searchFilters.q || activeFilterCount > 0) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {searchFilters.q && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchFilters.q}
                    <button onClick={() => clearFilter("q")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchFilters.genre && (
                  <Badge variant="secondary" className="gap-1">
                    Genre: {searchFilters.genre}
                    <button onClick={() => clearFilter("genre")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchFilters.difficulty && (
                  <Badge variant="secondary" className="gap-1">
                    Difficulty: {searchFilters.difficulty}
                    <button onClick={() => clearFilter("difficulty")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchFilters.premium !== undefined && (
                  <Badge variant="secondary" className="gap-1">
                    {searchFilters.premium ? "Premium only" : "Free only"}
                    <button onClick={() => clearFilter("premium")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results count */}
            {searchResults && (
              <p className="mb-4 text-sm text-muted-foreground">
                {searchResults.total} {searchResults.total === 1 ? "result" : "results"} found
              </p>
            )}

            {/* Grid */}
            <UniverseGrid
              universes={searchResults?.results || []}
              isLoading={isLoadingSearch && !searchResults}
              emptyMessage="No universes found. Try adjusting your filters."
            />

            {/* Load more */}
            {hasMoreResults && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingSearch}
                >
                  {isLoadingSearch ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterControls({
  filters,
  onFilterChange,
}: {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}) {
  return (
    <>
      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={filters.sort || "popular"}
          onValueChange={(value) => onFilterChange({ sort: value as SearchFilters["sort"] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label>Genre</Label>
        <Select
          value={filters.genre || "all"}
          onValueChange={(value) => onFilterChange({ genre: value === "all" ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {GENRES.map((genre) => (
              <SelectItem key={genre.id} value={genre.id}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select
          value={filters.difficulty || "all"}
          onValueChange={(value) =>
            onFilterChange({
              difficulty: value === "all" ? undefined : (value as SearchFilters["difficulty"]),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            {DIFFICULTIES.map((diff) => (
              <SelectItem key={diff.id} value={diff.id}>
                {diff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Premium filter */}
      <div className="space-y-2">
        <Label>Price</Label>
        <Select
          value={filters.premium === undefined ? "all" : filters.premium ? "premium" : "free"}
          onValueChange={(value) =>
            onFilterChange({
              premium: value === "all" ? undefined : value === "premium",
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free only</SelectItem>
            <SelectItem value="premium">Premium only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
