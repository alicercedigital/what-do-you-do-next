import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUniverses,
  updateUniverse,
  deleteUniverse,
  type UniverseFilters,
} from "@/shared/lib/admin-api";
import { formatRelativeTime, formatNumber } from "@/shared/lib/utils";
import { toast } from "sonner";
import {
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Play,
  Heart,
} from "lucide-react";

const PAGE_SIZE = 20;

export function UniversesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UniverseFilters>({
    search: "",
    visibility: "",
    limit: PAGE_SIZE,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "universes", filters],
    queryFn: () => getUniverses(filters),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateUniverse>[1];
    }) => updateUniverse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "universes"] });
      toast.success("Universe updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUniverse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "universes"] });
      toast.success("Universe deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);
  const currentPage = Math.floor((filters.offset ?? 0) / PAGE_SIZE) + 1;

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, offset: (page - 1) * PAGE_SIZE });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Universe Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Manage published universes and feature content
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>{data?.total ?? 0} universes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or creator..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, offset: 0 })
            }
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Visibility filter */}
        <select
          value={filters.visibility}
          onChange={(e) =>
            setFilters({ ...filters, visibility: e.target.value, offset: 0 })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
        </select>

        {/* Featured filter */}
        <select
          value={filters.featured === undefined ? "" : String(filters.featured)}
          onChange={(e) =>
            setFilters({
              ...filters,
              featured: e.target.value === "" ? undefined : e.target.value === "true",
              offset: 0,
            })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Featured</option>
          <option value="true">Featured</option>
          <option value="false">Not Featured</option>
        </select>
      </div>

      {/* Universes table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Universe</th>
                <th className="px-4 py-3 text-left font-medium">Creator</th>
                <th className="px-4 py-3 text-left font-medium">Visibility</th>
                <th className="px-4 py-3 text-left font-medium">Stats</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : data?.universes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No universes found
                  </td>
                </tr>
              ) : (
                data?.universes.map((universe) => (
                  <tr
                    key={universe.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {universe.is_featured && (
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium">{universe.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {universe.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted-foreground">
                        {universe.owner.username}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <VisibilityBadge
                        visibility={universe.visibility}
                        isPublished={universe.is_published}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {formatNumber(universe.play_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(universe.like_count)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeTime(universe.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Feature/Unfeature */}
                        <button
                          onClick={() =>
                            updateMutation.mutate({
                              id: universe.id,
                              updates: { is_featured: !universe.is_featured },
                            })
                          }
                          disabled={updateMutation.isPending}
                          className={`flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted ${
                            universe.is_featured
                              ? "border-amber-500 text-amber-500"
                              : "border-border text-muted-foreground"
                          }`}
                          title={
                            universe.is_featured ? "Unfeature" : "Feature"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              universe.is_featured ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        {/* Publish/Unpublish */}
                        <button
                          onClick={() =>
                            updateMutation.mutate({
                              id: universe.id,
                              updates: { is_published: !universe.is_published },
                            })
                          }
                          disabled={updateMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
                          title={
                            universe.is_published ? "Unpublish" : "Publish"
                          }
                        >
                          {universe.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this universe? This action cannot be undone."
                              )
                            ) {
                              deleteMutation.mutate(universe.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/50 text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisibilityBadge({
  visibility,
  isPublished,
}: {
  visibility: string;
  isPublished: boolean;
}) {
  if (!isPublished) {
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Draft
      </span>
    );
  }

  const colors = {
    public: "bg-green-500/10 text-green-500",
    private: "bg-amber-500/10 text-amber-500",
    unlisted: "bg-blue-500/10 text-blue-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[visibility as keyof typeof colors] ?? colors.public
      }`}
    >
      {visibility}
    </span>
  );
}
