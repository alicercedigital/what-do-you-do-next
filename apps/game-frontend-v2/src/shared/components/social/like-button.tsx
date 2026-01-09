import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSocialStore } from "@/store/social-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

interface LikeButtonProps {
  targetType: "universe" | "shared_content" | "comment";
  targetId: string;
  initialLiked?: boolean;
  initialCount?: number;
  showCount?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export function LikeButton({
  targetType,
  targetId,
  initialLiked = false,
  initialCount = 0,
  showCount = true,
  size = "default",
  variant = "ghost",
  className,
  onLikeChange,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const { toggleLike, checkLike } = useSocialStore();
  const user = useAuthStore((state) => state.user);

  // Check initial like status
  useEffect(() => {
    if (user) {
      checkLike(targetType, targetId).then(setLiked);
    }
  }, [user, targetType, targetId, checkLike]);

  // Update when initial values change
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleClick = useCallback(async () => {
    if (!user) {
      // Could show login modal here
      return;
    }

    setIsLoading(true);

    // Optimistic update
    const newLiked = !liked;
    const newCount = count + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setCount(newCount);

    try {
      const result = await toggleLike(targetType, targetId);

      // If server result differs from optimistic, correct it
      if (result !== newLiked) {
        setLiked(result);
        setCount(result ? count + 1 : count - 1);
      }

      onLikeChange?.(result, result ? newCount : newCount - 1);
    } catch {
      // Revert on error
      setLiked(liked);
      setCount(count);
    } finally {
      setIsLoading(false);
    }
  }, [user, liked, count, toggleLike, targetType, targetId, onLikeChange]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "gap-1.5",
        liked && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={handleClick}
      disabled={isLoading || !user}
      title={user ? (liked ? "Unlike" : "Like") : "Login to like"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform",
          liked && "fill-current scale-110"
        )}
      />
      {showCount && count > 0 && (
        <span className="text-sm tabular-nums">{count}</span>
      )}
    </Button>
  );
}
