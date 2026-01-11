import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supabase, type Notification } from "@/shared/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface NotificationsStoreState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface NotificationsStoreActions {
  loadNotifications: (userId: string, offset?: number) => Promise<void>;
  loadUnreadCount: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  subscribeToRealtime: (userId: string) => void;
  unsubscribeFromRealtime: () => void;
  addNotification: (notification: Notification) => void;
  reset: () => void;
}

type NotificationsStore = NotificationsStoreState & NotificationsStoreActions;

const PAGE_SIZE = 20;

const initialState: NotificationsStoreState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  error: null,
  realtimeChannel: null,
};

export const useNotificationsStore = create<NotificationsStore>()(
  immer((set, get) => ({
    ...initialState,

    loadNotifications: async (userId: string, offset = 0) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;

        set((state) => {
          if (offset === 0) {
            state.notifications = data ?? [];
          } else {
            state.notifications.push(...(data ?? []));
          }
          state.hasMore = (data?.length ?? 0) === PAGE_SIZE;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "Failed to load notifications";
          state.isLoading = false;
        });
      }
    },

    loadUnreadCount: async (userId: string) => {
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false);

        if (error) throw error;

        set((state) => {
          state.unreadCount = count ?? 0;
        });
      } catch (error) {
        console.error("Failed to load unread count:", error);
      }
    },

    markAsRead: async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        if (error) throw error;

        set((state) => {
          const notification = state.notifications.find(
            (n) => n.id === notificationId
          );
          if (notification && !notification.is_read) {
            notification.is_read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },

    markAllAsRead: async (userId: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId)
          .eq("is_read", false);

        if (error) throw error;

        set((state) => {
          state.notifications.forEach((n) => {
            n.is_read = true;
          });
          state.unreadCount = 0;
        });
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    },

    deleteNotification: async (notificationId: string) => {
      try {
        const notification = get().notifications.find(
          (n) => n.id === notificationId
        );
        const wasUnread = notification && !notification.is_read;

        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) throw error;

        set((state) => {
          state.notifications = state.notifications.filter(
            (n) => n.id !== notificationId
          );
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },

    subscribeToRealtime: (userId: string) => {
      // Clean up existing subscription
      get().unsubscribeFromRealtime();

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
          (payload) => {
            const newNotification = payload.new as Notification;
            get().addNotification(newNotification);
          }
        )
        .subscribe();

      set((state) => {
        state.realtimeChannel = channel;
      });
    },

    unsubscribeFromRealtime: () => {
      const channel = get().realtimeChannel;
      if (channel) {
        supabase.removeChannel(channel);
        set((state) => {
          state.realtimeChannel = null;
        });
      }
    },

    addNotification: (notification: Notification) => {
      set((state) => {
        // Add to beginning of list
        state.notifications.unshift(notification);
        if (!notification.is_read) {
          state.unreadCount += 1;
        }
      });
    },

    reset: () => {
      get().unsubscribeFromRealtime();
      set(initialState);
    },
  }))
);

// Selectors
export const useNotifications = () =>
  useNotificationsStore((state) => state.notifications);
export const useUnreadCount = () =>
  useNotificationsStore((state) => state.unreadCount);
export const useNotificationsLoading = () =>
  useNotificationsStore((state) => state.isLoading);
