import { useState, useEffect, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useSocialStore } from "@/store/social-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

interface BookmarkButtonProps {
  universeId: string;
  initialBookmarked?: boolean;
  initialCount?: number;
  showCount?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  onBookmarkChange?: (bookmarked: boolean, count: number) => void;
}

export function BookmarkButton({
  universeId,
  initialBookmarked = false,
  initialCount = 0,
  showCount = false,
  size = "default",
  variant = "ghost",
  className,
  onBookmarkChange,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const { toggleBookmark, checkBookmark } = useSocialStore();
  const user = useAuthStore((state) => state.user);

  // Check initial bookmark status
  useEffect(() => {
    if (user) {
      checkBookmark(universeId).then(setBookmarked);
    }
  }, [user, universeId, checkBookmark]);

  // Update when initial values change
  useEffect(() => {
    setBookmarked(initialBookmarked);
    setCount(initialCount);
  }, [initialBookmarked, initialCount]);

  const handleClick = useCallback(async () => {
    if (!user) {
      // Could show login modal here
      return;
    }

    setIsLoading(true);

    // Optimistic update
    const newBookmarked = !bookmarked;
    const newCount = count + (newBookmarked ? 1 : -1);
    setBookmarked(newBookmarked);
    setCount(newCount);

    try {
      const result = await toggleBookmark(universeId);

      // If server result differs from optimistic, correct it
      if (result !== newBookmarked) {
        setBookmarked(result);
        setCount(result ? count + 1 : count - 1);
      }

      onBookmarkChange?.(result, result ? newCount : newCount - 1);
    } catch {
      // Revert on error
      setBookmarked(bookmarked);
      setCount(count);
    } finally {
      setIsLoading(false);
    }
  }, [user, bookmarked, count, toggleBookmark, universeId, onBookmarkChange]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "gap-1.5",
        bookmarked && "text-yellow-500 hover:text-yellow-600",
        className
      )}
      onClick={handleClick}
      disabled={isLoading || !user}
      title={user ? (bookmarked ? "Remove bookmark" : "Bookmark") : "Login to bookmark"}
    >
      <Bookmark
        className={cn(
          "h-4 w-4 transition-transform",
          bookmarked && "fill-current scale-110"
        )}
      />
      {showCount && count > 0 && (
        <span className="text-sm tabular-nums">{count}</span>
      )}
    </Button>
  );
}
