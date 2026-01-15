import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  History,
  Bookmark,
  Play,
  MoreVertical,
  Trash2,
  Loader2,
  CheckCircle,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  useLibraryStore,
  usePlayHistory,
  formatPlayTime,
  type PlayHistoryEntry,
} from "@/store/library-store";
import { cn } from "@/shared/lib/utils";

interface HistoryCardProps {
  entry: PlayHistoryEntry;
  onRemove: () => void;
}

function HistoryCard({ entry, onRemove }: HistoryCardProps) {
  const navigate = useNavigate();
  const { universe, last_save, play_time_seconds, completed, last_played_at } = entry;

  const handlePlay = () => {
    // Navigate to play page with universe ID
    navigate(`/?play=${universe.id}`);
  };

  return (
    <div className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      {/* Universe thumbnail placeholder */}
      <div className="h-20 w-32 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary/50">
          {universe.name[0].toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              to={`/marketplace/universe/${universe.id}`}
              className="font-semibold hover:underline line-clamp-1"
            >
              {universe.name}
            </Link>
            {universe.creator && (
              <Link
                to={`/marketplace/creator/${universe.creator.username}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                by {universe.creator.display_name || universe.creator.username}
              </Link>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRemove} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatPlayTime(play_time_seconds)}
          </span>
          <span>
            Last played {formatDistanceToNow(new Date(last_played_at), { addSuffix: true })}
          </span>
          {completed && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={handlePlay}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            {last_save ? "Continue" : "Play"}
          </Button>
          {last_save && (
            <span className="text-xs text-muted-foreground">
              {last_save.name} - {formatPlayTime(last_save.play_time_seconds)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface BookmarkedUniverseCardProps {
  universe: {
    id: string;
    name: string;
    description: string;
    theme: string;
    genre: string | null;
    tags: string[];
    creator: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
      is_verified: boolean;
    } | null;
  };
}

function BookmarkedUniverseCard({ universe }: BookmarkedUniverseCardProps) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="h-20 w-32 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary/50">
          {universe.name[0].toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/marketplace/universe/${universe.id}`}
          className="font-semibold hover:underline line-clamp-1"
        >
          {universe.name}
        </Link>

        {universe.creator && (
          <div className="mt-1 flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={universe.creator.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <Link
              to={`/marketplace/creator/${universe.creator.username}`}
              className="text-sm text-muted-foreground hover:underline"
            >
              {universe.creator.display_name || universe.creator.username}
            </Link>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline">{universe.theme}</Badge>
          {universe.genre && <Badge variant="outline">{universe.genre}</Badge>}
        </div>

        <div className="mt-3">
          <Button size="sm" onClick={() => navigate(`/?play=${universe.id}`)}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Play
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [bookmarks, setBookmarks] = useState<BookmarkedUniverseCardProps["universe"][]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  const {
    loadHistory,
    removeFromHistory,
    isLoadingHistory,
    totalHistory,
  } = useLibraryStore();
  const history = usePlayHistory();

  // Load play history
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Load bookmarks when tab changes
  useEffect(() => {
    if (activeTab === "bookmarks" && bookmarks.length === 0) {
      setIsLoadingBookmarks(true);
      fetch("/api/social/bookmarks", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setBookmarks(data || []);
          setIsLoadingBookmarks(false);
        })
        .catch(() => {
          setIsLoadingBookmarks(false);
        });
    }
  }, [activeTab, bookmarks.length]);

  const handleLoadMore = () => {
    loadHistory(history.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">My Library</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Play History
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </TabsTrigger>
          </TabsList>

          {/* Play History Tab */}
          <TabsContent value="history">
            {isLoadingHistory && history.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No play history yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Start playing universes to track your progress
                </p>
                <Button asChild>
                  <Link to="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <HistoryCard
                    key={entry.universe.id}
                    entry={entry}
                    onRemove={() => removeFromHistory(entry.universe.id)}
                  />
                ))}

                {history.length < totalHistory && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingHistory}
                    >
                      {isLoadingHistory ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {isLoadingBookmarks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No bookmarks yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Save universes you want to play later
                </p>
                <Button asChild>
                  <Link to="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((universe) => (
                  <BookmarkedUniverseCard key={universe.id} universe={universe} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
