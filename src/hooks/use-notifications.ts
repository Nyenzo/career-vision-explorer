import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./use-auth";
import { supabase } from "@/lib/supabase";
import { authStorage } from "@/lib/session-auth-storage";

export interface Notification {
  id: string;
  user_id: string;
  type: "new_application" | "application_status_changed";
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

  // Subscribe to INSERT events via Supabase Realtime 
  useEffect(() => {
    if (!isAuthenticated || !user?.user_id || !supabase) return;
    // Authenticate the Realtime connection with the user's access token so
    // RLS policies evaluate correctly for postgres_changes subscriptions.
    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      supabase.realtime.setAuth(accessToken);
    }
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
        (payload) => {
          const incoming = payload.new as Notification;
          setNotifications((prev) => [incoming, ...prev].slice(0, limit));
          setTotal((prev) => prev + 1);
          if (!incoming.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.user_id, limit]);

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
