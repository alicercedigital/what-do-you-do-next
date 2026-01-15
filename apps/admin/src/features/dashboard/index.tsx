import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getUserGrowth,
  getRevenue,
} from "@/shared/lib/admin-api";
import { formatNumber, formatCurrency } from "@/shared/lib/utils";
import { Users, Globe, Coins, Zap, TrendingUp, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin", "dashboard", "overview"],
    queryFn: getDashboardOverview,
  });

  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery({
    queryKey: ["admin", "dashboard", "user-growth"],
    queryFn: () => getUserGrowth("30d"),
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["admin", "dashboard", "revenue"],
    queryFn: () => getRevenue("30d"),
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and analytics
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={overview?.totalUsers ?? 0}
          subtitle={`${overview?.activeUsers7d ?? 0} active this week`}
          icon={Users}
          loading={overviewLoading}
        />
        <StatCard
          title="Universes"
          value={overview?.totalUniverses ?? 0}
          subtitle={`${overview?.publishedUniverses ?? 0} published`}
          icon={Globe}
          loading={overviewLoading}
        />
        <StatCard
          title="Revenue"
          value={overview?.totalRevenue ?? 0}
          subtitle={`${formatCurrency(overview?.revenueThisMonth ?? 0)} this month`}
          icon={Coins}
          loading={overviewLoading}
          isCurrency
        />
        <StatCard
          title="AI Credits Used"
          value={overview?.aiCreditsUsed ?? 0}
          subtitle={`${formatNumber(overview?.totalPlays ?? 0)} total plays`}
          icon={Zap}
          loading={overviewLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">User Growth</h2>
          </div>
          {userGrowthLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={userGrowth?.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="signups"
                  name="New Signups"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active Users"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Revenue</h2>
          </div>
          {revenueLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={revenue?.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value) => value != null ? formatCurrency(value as number) : ""}
                />
                <Legend />
                <Bar
                  dataKey="credits"
                  name="Credit Sales"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="subscriptions"
                  name="Subscriptions"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue totals */}
      {revenue?.totals && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">30-Day Revenue Summary</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Credit Sales</p>
              <p className="text-2xl font-bold">
                {formatCurrency(revenue.totals.credits)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subscriptions</p>
              <p className="text-2xl font-bold">
                {formatCurrency(revenue.totals.subscriptions)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(
                  revenue.totals.credits + revenue.totals.subscriptions
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  isCurrency?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  isCurrency,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-2 text-3xl font-bold">
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
