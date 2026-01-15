import { create } from "zustand";
import { supabase } from "@/shared/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Comment user info
 */
export interface CommentUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

/**
 * Comment with replies
 */
export interface Comment {
  id: string;
  content: string;
  like_count: number;
  created_at: string;
  parent_id: string | null;
  user: CommentUser;
  replies?: Comment[];
  userLiked?: boolean;
}

/**
 * Notification actor
 */
export interface NotificationActor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: "like" | "comment" | "reply" | "follow" | "new_universe";
  target_type: string | null;
  target_id: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  actor: NotificationActor | null;
}

/**
 * Comments response
 */
export interface CommentsResponse {
  comments: Comment[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Notifications response
 */
export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

/**
 * Social store state
 */
interface SocialState {
  // Comments
  comments: Record<string, CommentsResponse>;
  isLoadingComments: boolean;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  totalNotifications: number;
  isLoadingNotifications: boolean;

  // Realtime
  realtimeChannel: RealtimeChannel | null;
  subscribedUserId: string | null;

  // Error
  error: string | null;
}

/**
 * Social store actions
 */
interface SocialActions {
  // Likes
  toggleLike: (targetType: string, targetId: string) => Promise<boolean>;
  checkLike: (targetType: string, targetId: string) => Promise<boolean>;

  // Bookmarks
  toggleBookmark: (universeId: string) => Promise<boolean>;
  checkBookmark: (universeId: string) => Promise<boolean>;

  // Comments
  loadComments: (targetType: string, targetId: string, offset?: number) => Promise<void>;
  postComment: (targetType: string, targetId: string, content: string, parentId?: string) => Promise<Comment | null>;
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
  likeComment: (commentId: string) => Promise<boolean>;

  // Follows
  toggleFollow: (userId: string) => Promise<boolean>;
  checkFollow: (userId: string) => Promise<boolean>;

  // Notifications
  loadNotifications: (offset?: number) => Promise<void>;
  markNotificationsRead: (ids?: string[]) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // Realtime subscriptions
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  addNotification: (notification: Notification) => void;

  // Reset
  reset: () => void;
  setError: (error: string | null) => void;
}

type SocialStore = SocialState & SocialActions;

const API_BASE = "/api/social";

const initialState: SocialState = {
  comments: {},
  isLoadingComments: false,
  notifications: [],
  unreadCount: 0,
  totalNotifications: 0,
  isLoadingNotifications: false,
  realtimeChannel: null,
  subscribedUserId: null,
  error: null,
};

export const useSocialStore = create<SocialStore>((set, get) => ({
  ...initialState,

  // ============================================
  // LIKES
  // ============================================

  toggleLike: async (targetType: string, targetId: string) => {
    try {
      const response = await fetch(`${API_BASE}/like/${targetType}/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to toggle like");
      const data = await response.json();
      return data.liked;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to toggle like" });
      return false;
    }
  },

  checkLike: async (targetType: string, targetId: string) => {
    try {
      const response = await fetch(`${API_BASE}/like/${targetType}/${targetId}`, {
        credentials: "include",
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.liked;
    } catch {
      return false;
    }
  },

  // ============================================
  // BOOKMARKS
  // ============================================

  toggleBookmark: async (universeId: string) => {
    try {
      const response = await fetch(`${API_BASE}/bookmark/${universeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to toggle bookmark");
      const data = await response.json();
      return data.bookmarked;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to toggle bookmark" });
      return false;
    }
  },

  checkBookmark: async (universeId: string) => {
    try {
      const response = await fetch(`${API_BASE}/bookmark/${universeId}`, {
        credentials: "include",
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.bookmarked;
    } catch {
      return false;
    }
  },

  // ============================================
  // COMMENTS
  // ============================================

  loadComments: async (targetType: string, targetId: string, offset = 0) => {
    const key = `${targetType}:${targetId}`;
    set({ isLoadingComments: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/comments/${targetType}/${targetId}?limit=20&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load comments");
      const data: CommentsResponse = await response.json();

      set((state) => ({
        comments: {
          ...state.comments,
          [key]:
            offset > 0
              ? {
                  ...data,
                  comments: [...(state.comments[key]?.comments || []), ...data.comments],
                }
              : data,
        },
        isLoadingComments: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load comments",
        isLoadingComments: false,
      });
    }
  },

  postComment: async (targetType: string, targetId: string, content: string, parentId?: string) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${targetType}/${targetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, parentId }),
      });

      if (!response.ok) throw new Error("Failed to post comment");
      const comment: Comment = await response.json();

      // Add comment to state
      const key = `${targetType}:${targetId}`;
      set((state) => {
        const existing = state.comments[key];
        if (!existing) return state;

        if (parentId) {
          // Add as reply
          return {
            comments: {
              ...state.comments,
              [key]: {
                ...existing,
                comments: existing.comments.map((c) =>
                  c.id === parentId
                    ? { ...c, replies: [...(c.replies || []), comment] }
                    : c
                ),
              },
            },
          };
        } else {
          // Add as top-level comment
          return {
            comments: {
              ...state.comments,
              [key]: {
                ...existing,
                total: existing.total + 1,
                comments: [comment, ...existing.comments],
              },
            },
          };
        }
      });

      return comment;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to post comment" });
      return null;
    }
  },

  updateComment: async (commentId: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to update comment");
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to update comment" });
      return false;
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete comment");
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete comment" });
      return false;
    }
  },

  likeComment: async (commentId: string) => {
    return get().toggleLike("comment", commentId);
  },

  // ============================================
  // FOLLOWS
  // ============================================

  toggleFollow: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/follow/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to toggle follow");
      const data = await response.json();
      return data.following;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to toggle follow" });
      return false;
    }
  },

  checkFollow: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/follow/${userId}`, {
        credentials: "include",
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.following;
    } catch {
      return false;
    }
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  loadNotifications: async (offset = 0) => {
    set({ isLoadingNotifications: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE}/notifications?limit=20&offset=${offset}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to load notifications");
      const data: NotificationsResponse = await response.json();

      set((state) => ({
        notifications:
          offset > 0 ? [...state.notifications, ...data.notifications] : data.notifications,
        totalNotifications: data.total,
        unreadCount: data.unreadCount,
        isLoadingNotifications: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load notifications",
        isLoadingNotifications: false,
      });
    }
  },

  markNotificationsRead: async (ids?: string[]) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error("Failed to mark notifications as read");

      set((state) => ({
        notifications: state.notifications.map((n) =>
          !ids || ids.includes(n.id) ? { ...n, is_read: true } : n
        ),
        unreadCount: ids ? Math.max(0, state.unreadCount - ids.length) : 0,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to mark notifications as read" });
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      set((state) => {
        const notification = state.notifications.find((n) => n.id === notificationId);
        return {
          notifications: state.notifications.filter((n) => n.id !== notificationId),
          totalNotifications: state.totalNotifications - 1,
          unreadCount: notification && !notification.is_read
            ? state.unreadCount - 1
            : state.unreadCount,
        };
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to delete notification" });
    }
  },

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================

  subscribeToNotifications: (userId: string) => {
    // Don't re-subscribe if already subscribed to same user
    if (get().subscribedUserId === userId) return;

    // Unsubscribe from any existing channel
    get().unsubscribeFromNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch the full notification with actor details
          const response = await fetch(`${API_BASE}/notifications?limit=1`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            if (data.notifications?.[0]?.id === payload.new.id) {
              get().addNotification(data.notifications[0]);
            }
          }
        }
      )
      .subscribe();

    set({
      realtimeChannel: channel,
      subscribedUserId: userId,
    });
  },

  unsubscribeFromNotifications: () => {
    const channel = get().realtimeChannel;
    if (channel) {
      supabase.removeChannel(channel);
      set({
        realtimeChannel: null,
        subscribedUserId: null,
      });
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      totalNotifications: state.totalNotifications + 1,
    }));
  },

  // Reset store
  reset: () => {
    get().unsubscribeFromNotifications();
    set(initialState);
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// Selectors
export const useComments = (targetType: string, targetId: string) =>
  useSocialStore((state) => state.comments[`${targetType}:${targetId}`]);
export const useNotifications = () => useSocialStore((state) => state.notifications);
export const useUnreadCount = () => useSocialStore((state) => state.unreadCount);
export const useSocialError = () => useSocialStore((state) => state.error);
