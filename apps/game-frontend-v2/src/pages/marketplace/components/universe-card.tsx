import { Link } from "react-router-dom";
import { Heart, Play, MessageCircle, Crown, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import type { MarketplaceUniverse } from "@/store/marketplace-store";

interface UniverseCardProps {
  universe: MarketplaceUniverse;
  showCreator?: boolean;
}

export function UniverseCard({ universe, showCreator = true }: UniverseCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Link to={`/marketplace/universe/${universe.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-1 text-base">{universe.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2 text-xs">
                {universe.description}
              </CardDescription>
            </div>
            {universe.is_premium && (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <Crown className="h-3 w-3" />
                {universe.price_credits}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {universe.theme}
            </Badge>
            {universe.genre && (
              <Badge variant="outline" className="text-xs">
                {universe.genre}
              </Badge>
            )}
            {universe.difficulty && (
              <Badge variant="outline" className="text-xs">
                {universe.difficulty}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(universe.like_count)}
            </span>
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {formatNumber(universe.play_count)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatNumber(universe.comment_count)}
            </span>
          </div>

          {/* Creator */}
          {showCreator && universe.creator && (
            <div className="mt-3 flex items-center gap-2 border-t pt-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src={universe.creator.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {universe.creator.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {universe.creator.display_name || universe.creator.username}
              </span>
              {universe.creator.is_verified && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  Verified
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
