import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Play,
  MessageSquare,
  Bookmark,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";

interface UniverseStat {
  id: string;
  name: string;
  description: string;
  theme: string;
  like_count: number;
  play_count: number;
  comment_count: number;
  bookmark_count: number;
  is_published: boolean;
  visibility: string;
  published_at: string | null;
  created_at: string;
}

interface TrendStats {
  period: string;
  likes: number;
  plays: number;
  comments: number;
  followers: number;
}

export function AnalyticsPage() {
  const [universes, setUniverses] = useState<UniverseStat[]>([]);
  const [trends, setTrends] = useState<TrendStats | null>(null);
  const [sortBy, setSortBy] = useState("plays");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        const [universesRes, trendsRes] = await Promise.all([
          fetch(`/api/analytics/universes?sort=${sortBy}&limit=20`, { credentials: "include" }),
          fetch("/api/analytics/trends", { credentials: "include" }),
        ]);

        if (universesRes.ok) setUniverses(await universesRes.json());
        if (trendsRes.ok) setTrends(await trendsRes.json());
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }

      setIsLoading(false);
    }

    loadData();
  }, [sortBy]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your content performance
        </p>
      </div>

        {/* Trends Summary */}
        {trends && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <Play className="h-5 w-5 text-green-500" />
                    {trends.plays}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Plays</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <Heart className="h-5 w-5 text-red-500" />
                    {trends.likes}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Likes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    {trends.comments}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Comments</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                    +{trends.followers}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">New Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Universe List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Universe Performance</CardTitle>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plays">Most Plays</SelectItem>
                <SelectItem value="likes">Most Likes</SelectItem>
                <SelectItem value="comments">Most Comments</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : universes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No universes yet</p>
                <Button className="mt-4" asChild>
                  <Link to="/universes">Create your first universe</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {universes.map((universe, index) => (
                  <div
                    key={universe.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/universes/${universe.id}`}
                          className="font-medium hover:underline truncate"
                        >
                          {universe.name}
                        </Link>
                        <Badge
                          variant={universe.is_published ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {universe.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {universe.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Play className="h-4 w-4 text-green-500" />
                          {universe.play_count}
                        </div>
                        <p className="text-xs text-muted-foreground">Plays</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Heart className="h-4 w-4 text-red-500" />
                          {universe.like_count}
                        </div>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          {universe.comment_count}
                        </div>
                        <p className="text-xs text-muted-foreground">Comments</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Bookmark className="h-4 w-4 text-yellow-500" />
                          {universe.bookmark_count}
                        </div>
                        <p className="text-xs text-muted-foreground">Saves</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
