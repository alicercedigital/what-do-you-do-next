import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Play,
  Bookmark,
  MessageCircle,
  Clock,
  ArrowLeft,
  Share2,
  Crown,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LikeButton, BookmarkButton, CommentSection } from "@/shared/components/social";
import { useMarketplaceStore, useCurrentUniverse } from "@/store/marketplace-store";
import { useAuthStore } from "@/store/auth-store";

export function UniverseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadUniverse, isLoadingUniverse, error } = useMarketplaceStore();
  const universe = useCurrentUniverse();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (id) {
      loadUniverse(id);
    }
  }, [id, loadUniverse]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handlePlay = () => {
    if (id) {
      navigate(`/?play=${id}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && universe) {
      try {
        await navigator.share({
          title: universe.name,
          text: universe.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoadingUniverse) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !universe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Universe not found"}</p>
        <Button variant="outline" onClick={() => navigate("/marketplace")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Title & Badges */}
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <h1 className="text-3xl font-bold">{universe.name}</h1>
                {universe.is_premium && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    {universe.price_credits} credits
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{universe.theme}</Badge>
                {universe.genre && <Badge variant="outline">{universe.genre}</Badge>}
                {universe.difficulty && (
                  <Badge variant="outline">{universe.difficulty}</Badge>
                )}
                {universe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {universe.description}
                </p>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <Heart className="h-5 w-5 text-red-500" />
                      {formatNumber(universe.like_count)}
                    </div>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <Play className="h-5 w-5 text-green-500" />
                      {formatNumber(universe.play_count)}
                    </div>
                    <p className="text-sm text-muted-foreground">Plays</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      {formatNumber(universe.comment_count)}
                    </div>
                    <p className="text-sm text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <Bookmark className="h-5 w-5 text-yellow-500" />
                      {formatNumber(universe.bookmark_count)}
                    </div>
                    <p className="text-sm text-muted-foreground">Bookmarks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Play time */}
            {universe.estimated_playtime_minutes && (
              <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estimated playtime: {universe.estimated_playtime_minutes} minutes
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="space-y-3 py-4">
                <Button className="w-full" size="lg" onClick={handlePlay}>
                  <Play className="mr-2 h-5 w-5" />
                  {universe.is_premium ? `Play (${universe.price_credits} credits)` : "Play Now"}
                </Button>

                <div className="flex gap-2">
                  <LikeButton
                    targetType="universe"
                    targetId={universe.id}
                    initialLiked={universe.userInteraction.liked}
                    initialCount={universe.like_count}
                    variant="outline"
                    className="flex-1"
                  />
                  <BookmarkButton
                    universeId={universe.id}
                    initialBookmarked={universe.userInteraction.bookmarked}
                    initialCount={universe.bookmark_count}
                    variant="outline"
                    className="flex-1"
                  />
                </div>

                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Creator Card */}
            {universe.creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Created by
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    to={`/marketplace/creator/${universe.creator.username}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={universe.creator.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1 font-medium">
                        {universe.creator.display_name || universe.creator.username}
                        {universe.creator.is_verified && (
                          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{universe.creator.username}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Published Date */}
            {universe.published_at && (
              <p className="text-center text-sm text-muted-foreground">
                Published {new Date(universe.published_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <Separator className="my-8" />
        <CommentSection targetType="universe" targetId={universe.id} />
      </div>
    </div>
  );
}
