import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/shared/lib/admin-api";
import { formatRelativeTime } from "@/shared/lib/utils";
import { ScrollText, ChevronLeft, ChevronRight, Search } from "lucide-react";

const PAGE_SIZE = 50;

export function AuditPage() {
  const [filters, setFilters] = useState({
    action: "",
    limit: PAGE_SIZE,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit", filters],
    queryFn: () => getAuditLogs(filters),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);
  const currentPage = Math.floor(filters.offset / PAGE_SIZE) + 1;

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, offset: (page - 1) * PAGE_SIZE });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Track admin actions and changes
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ScrollText className="h-4 w-4" />
          <span>{data?.total ?? 0} entries</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by action..."
            value={filters.action}
            onChange={(e) =>
              setFilters({ ...filters, action: e.target.value, offset: 0 })
            }
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Audit log table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium">Admin</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">Target</th>
                <th className="px-4 py-3 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : data?.logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No audit logs found
                  </td>
                </tr>
              ) : (
                data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{log.admin.username}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3">
                      {log.target_type && log.target_id ? (
                        <span className="text-muted-foreground">
                          {log.target_type}:{" "}
                          <code className="rounded bg-muted px-1 text-xs">
                            {log.target_id.slice(0, 8)}...
                          </code>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.details ? (
                        <button
                          onClick={() => {
                            alert(JSON.stringify(log.details, null, 2));
                          }}
                          className="text-primary hover:underline"
                        >
                          View details
                        </button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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

function ActionBadge({ action }: { action: string }) {
  const getColor = (action: string) => {
    if (action.includes("ban")) return "bg-destructive/10 text-destructive";
    if (action.includes("unban")) return "bg-green-500/10 text-green-500";
    if (action.includes("credit")) return "bg-amber-500/10 text-amber-500";
    if (action.includes("feature")) return "bg-purple-500/10 text-purple-500";
    if (action.includes("config")) return "bg-blue-500/10 text-blue-500";
    if (action.includes("delete")) return "bg-destructive/10 text-destructive";
    if (action.includes("update")) return "bg-cyan-500/10 text-cyan-500";
    return "bg-muted text-muted-foreground";
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getColor(
        action
      )}`}
    >
      {action.replace(/\./g, " ").replace(/_/g, " ")}
    </span>
  );
}
