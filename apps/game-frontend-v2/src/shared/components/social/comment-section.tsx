import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreHorizontal, Trash2, Edit2, Heart, Reply, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useSocialStore, useComments, type Comment } from "@/store/social-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

interface CommentSectionProps {
  targetType: "universe" | "shared_content";
  targetId: string;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  targetType: string;
  targetId: string;
  onReply: (parentId: string) => void;
  depth?: number;
}

function CommentItem({
  comment,
  targetType,
  targetId,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [liked, setLiked] = useState(comment.userLiked || false);
  const [likeCount, setLikeCount] = useState(comment.like_count);

  const { updateComment, deleteComment, likeComment, loadComments } = useSocialStore();
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.id === comment.user.id;

  const handleEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    const success = await updateComment(comment.id, editContent);
    if (success) {
      setIsEditing(false);
      // Reload comments to get updated content
      loadComments(targetType, targetId);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(comment.id);
      loadComments(targetType, targetId);
    }
  };

  const handleLike = async () => {
    const newLiked = await likeComment(comment.id);
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
  };

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-10 mt-3")}>
      <Link to={`/marketplace/creator/${comment.user.username}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar_url || undefined} />
          <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/marketplace/creator/${comment.user.username}`}
            className="font-medium text-sm hover:underline"
          >
            {comment.user.display_name || comment.user.username}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 gap-1 text-xs", liked && "text-red-500")}
              onClick={handleLike}
              disabled={!user}
            >
              <Heart className={cn("h-3 w-3", liked && "fill-current")} />
              {likeCount > 0 && likeCount}
            </Button>

            {depth === 0 && user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onReply(comment.id)}
              >
                <Reply className="h-3 w-3" />
                Reply
              </Button>
            )}

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-muted pl-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                targetType={targetType}
                targetId={targetId}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({
  targetType,
  targetId,
  className,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loadComments, postComment, isLoadingComments } = useSocialStore();
  const commentsData = useComments(targetType, targetId);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadComments(targetType, targetId);
  }, [targetType, targetId, loadComments]);

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const comment = await postComment(targetType, targetId, newComment, replyingTo || undefined);

    if (comment) {
      setNewComment("");
      setReplyingTo(null);
    }

    setIsSubmitting(false);
  }, [newComment, replyingTo, postComment, targetType, targetId]);

  const handleLoadMore = useCallback(() => {
    if (commentsData) {
      loadComments(targetType, targetId, commentsData.offset + commentsData.limit);
    }
  }, [commentsData, loadComments, targetType, targetId]);

  const handleReply = useCallback((parentId: string) => {
    setReplyingTo(parentId);
    // Focus the textarea
    const textarea = document.querySelector('textarea[name="new-comment"]') as HTMLTextAreaElement;
    textarea?.focus();
  }, []);

  const replyingToComment = commentsData?.comments.find((c) => c.id === replyingTo);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">
          Comments {commentsData && `(${commentsData.total})`}
        </h3>
      </div>

      {/* New comment form */}
      {user ? (
        <div className="space-y-3">
          {replyingTo && replyingToComment && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              <Reply className="h-4 w-4" />
              Replying to{" "}
              <span className="font-medium">
                {replyingToComment.user.display_name || replyingToComment.user.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs ml-auto"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <Textarea
            name="new-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {replyingTo ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments list */}
      {isLoadingComments && !commentsData ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : commentsData && commentsData.comments.length > 0 ? (
        <div className="space-y-6">
          {commentsData.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              targetType={targetType}
              targetId={targetId}
              onReply={handleReply}
            />
          ))}

          {/* Load more */}
          {commentsData.offset + commentsData.limit < commentsData.total && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingComments}
              >
                {isLoadingComments ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load more comments
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
