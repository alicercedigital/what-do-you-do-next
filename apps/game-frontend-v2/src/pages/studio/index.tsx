import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  Play,
  Users,
  FileText,
  TrendingUp,
  Plus,
  ChevronRight,
  Loader2,
  BarChart3,
  Coins,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { useEconomyStore, useEarnings } from "@/store/economy-store";

interface OverviewStats {
  totalLikes: number;
  totalPlays: number;
  totalFollowers: number;
  totalUniverses: number;
}

interface TrendStats {
  period: string;
  likes: number;
  plays: number;
  comments: number;
  followers: number;
}

interface UniverseStat {
  id: string;
  name: string;
  like_count: number;
  play_count: number;
  comment_count: number;
  is_published: boolean;
}

interface ActivityItem {
  id: string;
  type: "like" | "comment" | "follow" | "tip";
  created_at: string;
  data: Record<string, unknown> | null;
  actor: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
                  {trend >= 0 ? "+" : ""}{trend}
                </span>
                {trendLabel && ` ${trendLabel}`}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityMessage(item: ActivityItem): string {
  const actorName = item.actor?.display_name || item.actor?.username || "Someone";
  const data = item.data as Record<string, string> | null;

  switch (item.type) {
    case "like":
      return `${actorName} liked "${data?.universe_name || "your universe"}"`;
    case "comment":
      return `${actorName} commented on "${data?.universe_name || "your universe"}"`;
    case "follow":
      return `${actorName} started following you`;
    case "tip":
      return `${actorName} sent you a tip of ${data?.amount || "?"} credits`;
    default:
      return "New activity";
  }
}

export function StudioPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [trends, setTrends] = useState<TrendStats | null>(null);
  const [topUniverses, setTopUniverses] = useState<UniverseStat[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const { loadEarnings, isLoadingEarnings } = useEconomyStore();
  const earnings = useEarnings();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        // Load all data in parallel
        const [overviewRes, trendsRes, universesRes, activityRes] = await Promise.all([
          fetch("/api/analytics/overview", { credentials: "include" }),
          fetch("/api/analytics/trends", { credentials: "include" }),
          fetch("/api/analytics/universes?limit=5", { credentials: "include" }),
          fetch("/api/analytics/activity?limit=10", { credentials: "include" }),
        ]);

        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (trendsRes.ok) setTrends(await trendsRes.json());
        if (universesRes.ok) setTopUniverses(await universesRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (err) {
        console.error("Failed to load studio data:", err);
      }

      setIsLoading(false);
    }

    loadData();
    loadEarnings();
  }, [loadEarnings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Creator Studio</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email?.split("@")[0] || "Creator"}
            </p>
          </div>
          <Button asChild>
            <Link to="/universes">
              <Plus className="mr-2 h-4 w-4" />
              New Universe
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Plays"
            value={overview?.totalPlays || 0}
            icon={Play}
            trend={trends?.plays}
            trendLabel="this week"
          />
          <StatCard
            title="Total Likes"
            value={overview?.totalLikes || 0}
            icon={Heart}
            trend={trends?.likes}
            trendLabel="this week"
          />
          <StatCard
            title="Followers"
            value={overview?.totalFollowers || 0}
            icon={Users}
            trend={trends?.followers}
            trendLabel="this week"
          />
          <StatCard
            title="Earnings"
            value={`${earnings?.thisMonth || 0} credits`}
            icon={Coins}
            trendLabel="this month"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Universes */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Universes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/universes">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {topUniverses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No universes yet</p>
                  <Button className="mt-4" asChild>
                    <Link to="/universes">Create your first universe</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topUniverses.map((universe) => (
                    <div
                      key={universe.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/universes/${universe.id}`}
                          className="font-medium hover:underline"
                        >
                          {universe.name}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3.5 w-3.5" />
                            {universe.play_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {universe.like_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {universe.comment_count}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          universe.is_published
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {universe.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.actor?.avatar_url || undefined} />
                        <AvatarFallback>
                          {item.actor?.username?.[0].toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{getActivityMessage(item)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link to="/studio/analytics">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View detailed statistics
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/studio/earnings">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <Coins className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">Earnings</h3>
                  <p className="text-sm text-muted-foreground">
                    {earnings?.totalEarnings || 0} credits earned
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/universes">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-medium">My Universes</h3>
                  <p className="text-sm text-muted-foreground">
                    {overview?.totalUniverses || 0} universes
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
  );
}
