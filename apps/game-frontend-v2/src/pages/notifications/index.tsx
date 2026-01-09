import { useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  X,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useSocialStore, useNotifications, useUnreadCount, type Notification } from "@/store/social-store";
import { cn } from "@/shared/lib/utils";

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "like":
      return <Heart className="h-5 w-5 text-red-500" />;
    case "comment":
    case "reply":
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-5 w-5 text-green-500" />;
    case "new_universe":
      return <Sparkles className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function getNotificationMessage(notification: Notification): string {
  const actorName =
    notification.actor?.display_name || notification.actor?.username || "Someone";
  const data = notification.data as Record<string, string> | null;

  switch (notification.type) {
    case "like":
      return `${actorName} liked your universe "${data?.universe_name || "untitled"}"`;
    case "comment":
      return `${actorName} commented on "${data?.universe_name || "your universe"}"`;
    case "reply":
      return `${actorName} replied to your comment`;
    case "follow":
      return `${actorName} started following you`;
    case "new_universe":
      return `${actorName} published a new universe`;
    default:
      return "New notification";
  }
}

function getNotificationLink(notification: Notification): string | null {
  const data = notification.data as Record<string, string> | null;

  switch (notification.type) {
    case "like":
    case "comment":
      return notification.target_id
        ? `/marketplace/universe/${notification.target_id}`
        : null;
    case "reply":
      return notification.target_id
        ? `/marketplace/universe/${data?.universe_id || ""}`
        : null;
    case "follow":
      return notification.actor?.username
        ? `/marketplace/creator/${notification.actor.username}`
        : null;
    case "new_universe":
      return notification.target_id
        ? `/marketplace/universe/${notification.target_id}`
        : null;
    default:
      return null;
  }
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const link = getNotificationLink(notification);

  const content = (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-lg border transition-colors relative group",
        !notification.is_read && "bg-primary/5 border-primary/20"
      )}
      onClick={onMarkRead}
    >
      {notification.actor ? (
        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.actor.avatar_url || undefined} />
          <AvatarFallback>
            {notification.actor.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getNotificationIcon(notification.type)}
              <span className="text-xs text-muted-foreground capitalize">
                {notification.type.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm">{getNotificationMessage(notification)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
          {!notification.is_read && (
            <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1" />
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block hover:no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationsPage() {
  const {
    loadNotifications,
    markNotificationsRead,
    deleteNotification,
    isLoadingNotifications,
    totalNotifications,
  } = useSocialStore();
  const notifications = useNotifications();
  const unreadCount = useUnreadCount();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleLoadMore = () => {
    loadNotifications(notifications.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 && "s"}
              </p>
            )}
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markNotificationsRead()}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        {isLoadingNotifications && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No notifications yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When someone interacts with your content, you'll see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={() => {
                  if (!notification.is_read) {
                    markNotificationsRead([notification.id]);
                  }
                }}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}

            {/* Load more */}
            {notifications.length < totalNotifications && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingNotifications}
                >
                  {isLoadingNotifications ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
