import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, resolveReport } from "@/shared/lib/admin-api";
import { formatRelativeTime } from "@/shared/lib/utils";
import { toast } from "sonner";
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Globe,
  User,
} from "lucide-react";

const PAGE_SIZE = 20;

export function ModerationPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "pending",
    limit: PAGE_SIZE,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", filters],
    queryFn: () => getReports(filters),
  });

  const resolveMutation = useMutation({
    mutationFn: ({
      id,
      resolution,
      notes,
    }: {
      id: string;
      resolution: "resolved" | "dismissed";
      notes?: string;
    }) => resolveReport(id, resolution, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast.success("Report resolved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
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
          <h1 className="text-2xl font-bold">Content Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Review and resolve user reports
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{data?.total ?? 0} reports</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, offset: 0 })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-border bg-card"
            />
          ))
        ) : data?.reports.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No reports to review</p>
          </div>
        ) : (
          data?.reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <TargetTypeIcon type={report.target_type} />
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {report.target_type.charAt(0).toUpperCase() +
                          report.target_type.slice(1)}{" "}
                        Report
                      </h3>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reported by{" "}
                      <span className="font-medium">
                        {report.reporter.username}
                      </span>{" "}
                      {formatRelativeTime(report.created_at)}
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Reason:</span>
                        <ReasonBadge reason={report.reason} />
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Target ID:{" "}
                        <code className="rounded bg-muted px-1">
                          {report.target_id}
                        </code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {report.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        resolveMutation.mutate({
                          id: report.id,
                          resolution: "resolved",
                        })
                      }
                      disabled={resolveMutation.isPending}
                      className="flex items-center gap-1 rounded-md bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-500 hover:bg-green-500/20"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Resolve
                    </button>
                    <button
                      onClick={() =>
                        resolveMutation.mutate({
                          id: report.id,
                          resolution: "dismissed",
                        })
                      }
                      disabled={resolveMutation.isPending}
                      className="flex items-center gap-1 rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80"
                    >
                      <XCircle className="h-4 w-4" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  );
}

function TargetTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    universe: <Globe className="h-5 w-5 text-destructive" />,
    comment: <MessageSquare className="h-5 w-5 text-destructive" />,
    user: <User className="h-5 w-5 text-destructive" />,
  };

  return icons[type] ?? <AlertTriangle className="h-5 w-5 text-destructive" />;
}

function ReportStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    resolved: "bg-green-500/10 text-green-500",
    dismissed: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? colors.pending
      }`}
    >
      {status}
    </span>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  const colors: Record<string, string> = {
    spam: "bg-amber-500/10 text-amber-500",
    inappropriate: "bg-red-500/10 text-red-500",
    harassment: "bg-destructive/10 text-destructive",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[reason] ?? colors.other
      }`}
    >
      {reason}
    </span>
  );
}
