import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUsers, type UserFilters } from "@/shared/lib/admin-api";
import { formatRelativeTime } from "@/shared/lib/utils";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const PAGE_SIZE = 20;

export function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    tier: "",
    status: "",
    limit: PAGE_SIZE,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => getUsers(filters),
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            View and manage platform users
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{data?.total ?? 0} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, offset: 0 })
            }
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Tier filter */}
        <select
          value={filters.tier}
          onChange={(e) =>
            setFilters({ ...filters, tier: e.target.value, offset: 0 })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="creator">Creator</option>
          <option value="pro">Pro</option>
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, offset: 0 })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="verified">Verified</option>
        </select>
      </div>

      {/* Users table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Credits</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-left font-medium">Last Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium uppercase">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            user.username.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TierBadge tier={user.tier} />
                    </td>
                    <td className="px-4 py-3">{user.ai_credits}</td>
                    <td className="px-4 py-3">
                      <StatusBadges
                        isVerified={user.is_verified}
                        isAdmin={user.is_admin}
                        isBanned={user.is_banned}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeTime(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.last_active
                        ? formatRelativeTime(user.last_active)
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/users/${user.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
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

function TierBadge({ tier }: { tier: string }) {
  const colors = {
    free: "bg-muted text-muted-foreground",
    creator: "bg-blue-500/10 text-blue-500",
    pro: "bg-purple-500/10 text-purple-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[tier as keyof typeof colors] ?? colors.free
      }`}
    >
      {tier}
    </span>
  );
}

function StatusBadges({
  isVerified,
  isAdmin,
  isBanned,
}: {
  isVerified: boolean;
  isAdmin: boolean;
  isBanned: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {isBanned && (
        <span className="inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          Banned
        </span>
      )}
      {isAdmin && (
        <span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
          Admin
        </span>
      )}
      {isVerified && (
        <span className="inline-flex rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
          Verified
        </span>
      )}
      {!isBanned && !isAdmin && !isVerified && (
        <span className="text-muted-foreground">-</span>
      )}
    </div>
  );
}
