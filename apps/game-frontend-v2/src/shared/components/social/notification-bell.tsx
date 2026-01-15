import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageSquare, UserPlus, Sparkles, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useSocialStore, useNotifications, useUnreadCount, type Notification } from "@/store/social-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/shared/lib/utils";

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
    case "reply":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "new_universe":
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationMessage(notification: Notification): string {
  const actorName = notification.actor?.display_name || notification.actor?.username || "Someone";
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
        "flex gap-3 p-3 hover:bg-muted/50 transition-colors relative group",
        !notification.is_read && "bg-primary/5"
      )}
      onClick={onMarkRead}
    >
      {notification.actor ? (
        <Avatar className="h-8 w-8">
          <AvatarImage src={notification.actor.avatar_url || undefined} />
          <AvatarFallback>
            {notification.actor.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-sm leading-tight">
              {getNotificationMessage(notification)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
          {!notification.is_read && (
            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const {
    loadNotifications,
    markNotificationsRead,
    deleteNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isLoadingNotifications,
  } = useSocialStore();
  const notifications = useNotifications();
  const unreadCount = useUnreadCount();
  const user = useAuthStore((state) => state.user);

  // Load notifications and subscribe to realtime updates when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications(user.id);
    }

    return () => {
      unsubscribeFromNotifications();
    };
  }, [user, loadNotifications, subscribeToNotifications, unsubscribeFromNotifications]);

  // Mark all as read when popover closes
  useEffect(() => {
    if (!open && unreadCount > 0) {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length > 0) {
        markNotificationsRead(unreadIds);
      }
    }
  }, [open, unreadCount, notifications, markNotificationsRead]);

  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markNotificationsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoadingNotifications && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
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
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <Link to="/notifications">
            <Button variant="ghost" className="w-full" size="sm">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
