import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./use-auth";
import { supabase } from "@/lib/supabase";
import { authStorage } from "@/lib/session-auth-storage";

export type NotificationType =
  | "new_application"
  | "application_status_changed"
  | "cofounder_follow"
  | "cofounder_match"
  | "cofounder_mutual_interest"
  | "cofounder_new_message"
  | "cofounder_project_join_request"
  | "cofounder_project_approved";

export const COFOUNDER_NOTIFICATION_TYPES: NotificationType[] = [
  "cofounder_follow",
  "cofounder_match",
  "cofounder_mutual_interest",
  "cofounder_new_message",
  "cofounder_project_join_request",
  "cofounder_project_approved",
];

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
}

export function useNotifications(options?: {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}) {
  const { limit = 20, page = 1, unreadOnly = false } = options ?? {};
  const { isAuthenticated, user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const upsertNotification = useCallback((incoming: Notification) => {
    setNotifications((prev) => {
      const next = [incoming, ...prev.filter((notification) => notification.id !== incoming.id)];
      next.sort((left, right) => {
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      });
      return next.slice(0, limit);
    });
  }, [limit]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
        ...(unreadOnly ? { unread_only: "true" } : {}),
      });
      const data = await apiClient.get<NotificationListResponse>(
        `/notifications?${params}`
      );
      setNotifications(data.notifications);
      setTotal(data.total);
      setUnreadCount(data.unread_count);
    } catch {
      // silent — badge/list simply won't update
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, limit, page, unreadOnly]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Consume DB-authored notifications from the shared notifications table.
  useEffect(() => {
    if (!isAuthenticated || !user?.user_id || !supabase) return;
    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      supabase.realtime.setAuth(accessToken);
    }

    const handleInsert = (payload: { new: Notification }) => {
      const incoming = payload.new;
      upsertNotification(incoming);
      setTotal((prev) => prev + 1);
      if (!incoming.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleUpdate = (payload: { new: Notification; old: Notification }) => {
      const incoming = payload.new;
      const previous = payload.old;

      setNotifications((prev) => {
        const hasExisting = prev.some((notification) => notification.id === incoming.id);
        if (!hasExisting && unreadOnly && incoming.is_read) {
          return prev;
        }
        const next = prev
          .map((notification) => (notification.id === incoming.id ? incoming : notification))
          .filter((notification) => !(unreadOnly && notification.is_read));
        if (!hasExisting && (!unreadOnly || !incoming.is_read)) {
          next.unshift(incoming);
        }
        next.sort((left, right) => {
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        });
        return next.slice(0, limit);
      });

      if (previous.is_read !== incoming.is_read) {
        setUnreadCount((prev) => {
          if (previous.is_read && !incoming.is_read) {
            return prev + 1;
          }
          if (!previous.is_read && incoming.is_read) {
            return Math.max(0, prev - 1);
          }
          return prev;
        });
      }
    };

    const handleDelete = (payload: { old: Notification }) => {
      const removed = payload.old;
      setNotifications((prev) => prev.filter((notification) => notification.id !== removed.id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (!removed.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    const channel = supabase
      .channel(`notifications:${user.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.user_id}`,
        },
        handleInsert,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.user_id}`,
        },
        handleUpdate,
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.user_id}`,
        },
        handleDelete,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.user_id, limit, unreadOnly, upsertNotification]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await apiClient.put(`/notifications/${id}/read`, {});
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post("/notifications/mark-all-read", {});
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  }, []);

  return {
    notifications,
    total,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
