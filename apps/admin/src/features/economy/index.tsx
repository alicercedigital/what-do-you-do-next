import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, getSubscriptions } from "@/shared/lib/admin-api";
import { formatRelativeTime, formatNumber } from "@/shared/lib/utils";
import {
  Coins,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

const PAGE_SIZE = 20;

export function EconomyPage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "subscriptions">(
    "transactions"
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Economy</h1>
        <p className="text-sm text-muted-foreground">
          View transactions and manage subscriptions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "transactions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="h-4 w-4" />
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "subscriptions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Subscriptions
        </button>
      </div>

      {/* Content */}
      {activeTab === "transactions" ? (
        <TransactionsTable />
      ) : (
        <SubscriptionsTable />
      )}
    </div>
  );
}

function TransactionsTable() {
  const [filters, setFilters] = useState({
    type: "",
    limit: PAGE_SIZE,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "transactions", filters],
    queryFn: () => getTransactions(filters),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);
  const currentPage = Math.floor(filters.offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-4">
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value, offset: 0 })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="purchase">Purchases</option>
          <option value="subscription">Subscriptions</option>
          <option value="tip_sent">Tips Sent</option>
          <option value="tip_received">Tips Received</option>
          <option value="ai_usage">AI Usage</option>
          <option value="bonus">Bonuses</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : data?.transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                data?.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{tx.username}</td>
                    <td className="px-4 py-3">
                      <TransactionTypeBadge type={tx.type} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1 ${
                          tx.amount > 0 ? "text-green-500" : "text-destructive"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                        {tx.amount > 0 ? "+" : ""}
                        {formatNumber(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeTime(tx.created_at)}
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
                onClick={() =>
                  setFilters({ ...filters, offset: (currentPage - 2) * PAGE_SIZE })
                }
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setFilters({ ...filters, offset: currentPage * PAGE_SIZE })
                }
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

function SubscriptionsTable() {
  const [filters, setFilters] = useState({
    status: "",
    limit: PAGE_SIZE,
    offset: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "subscriptions", filters],
    queryFn: () => getSubscriptions(filters),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);
  const currentPage = Math.floor(filters.offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-4">
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
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Period End</th>
                <th className="px-4 py-3 text-left font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : data?.subscriptions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                data?.subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{sub.username}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize">{sub.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionStatusBadge status={sub.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(sub.current_period_end).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeTime(sub.created_at)}
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
                onClick={() =>
                  setFilters({ ...filters, offset: (currentPage - 2) * PAGE_SIZE })
                }
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setFilters({ ...filters, offset: currentPage * PAGE_SIZE })
                }
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

function TransactionTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    purchase: "bg-green-500/10 text-green-500",
    subscription: "bg-purple-500/10 text-purple-500",
    tip_sent: "bg-amber-500/10 text-amber-500",
    tip_received: "bg-blue-500/10 text-blue-500",
    ai_usage: "bg-cyan-500/10 text-cyan-500",
    bonus: "bg-pink-500/10 text-pink-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[type] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {type.replace(/_/g, " ")}
    </span>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/10 text-green-500",
    cancelled: "bg-amber-500/10 text-amber-500",
    expired: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? colors.expired
      }`}
    >
      {status}
    </span>
  );
}
