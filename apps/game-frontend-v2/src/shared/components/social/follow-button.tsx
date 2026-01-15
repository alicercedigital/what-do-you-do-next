import { useState, useEffect, useCallback } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSocialStore } from "@/store/social-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({
  userId,
  initialFollowing = false,
  size = "default",
  className,
  onFollowChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { toggleFollow, checkFollow } = useSocialStore();
  const user = useAuthStore((state) => state.user);

  // Can't follow yourself
  const isOwnProfile = user?.id === userId;

  // Check initial follow status
  useEffect(() => {
    if (user && !isOwnProfile) {
      checkFollow(userId).then(setFollowing);
    }
  }, [user, userId, checkFollow, isOwnProfile]);

  // Update when initial value changes
  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleClick = useCallback(async () => {
    if (!user || isOwnProfile) {
      return;
    }

    setIsLoading(true);

    // Optimistic update
    const newFollowing = !following;
    setFollowing(newFollowing);

    try {
      const result = await toggleFollow(userId);

      // If server result differs from optimistic, correct it
      if (result !== newFollowing) {
        setFollowing(result);
      }

      onFollowChange?.(result);
    } catch {
      // Revert on error
      setFollowing(following);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOwnProfile, following, toggleFollow, userId, onFollowChange]);

  if (isOwnProfile) {
    return null;
  }

  const showUnfollow = following && isHovering;

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size}
      className={cn(
        "gap-1.5 min-w-[100px] transition-colors",
        showUnfollow && "border-red-500 text-red-500 hover:bg-red-500/10",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading || !user}
      title={user ? undefined : "Login to follow"}
    >
      {showUnfollow ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : following ? (
        "Following"
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
