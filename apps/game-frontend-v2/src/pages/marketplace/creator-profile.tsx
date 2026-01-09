import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, User, Calendar, Users, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { UniverseGrid } from "./components/universe-grid";
import { useMarketplaceStore, useCurrentCreator } from "@/store/marketplace-store";
import { useAuthStore } from "@/store/auth-store";

export function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { loadCreator, isLoadingCreator, error } = useMarketplaceStore();
  const creatorData = useCurrentCreator();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (username) {
      loadCreator(username);
    }
  }, [username, loadCreator]);

  if (isLoadingCreator) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !creatorData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Creator not found"}</p>
        <Button variant="outline" onClick={() => navigate("/marketplace")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const { profile, universes, isFollowing } = creatorData;
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {profile.is_featured && (
                  <Badge className="gap-1">Featured Creator</Badge>
                )}
              </div>

              <p className="mt-1 text-muted-foreground">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-3 max-w-lg text-sm">{profile.bio}</p>
              )}

              {/* Stats & Links */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {profile.follower_count} followers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              {/* Action buttons */}
              {!isOwnProfile && (
                <div className="mt-4">
                  <Button variant={isFollowing ? "outline" : "default"}>
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Universes */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold">
          Universes ({universes.length})
        </h2>

        {universes.length > 0 ? (
          <UniverseGrid universes={universes} showCreator={false} />
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              This creator hasn't published any universes yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
