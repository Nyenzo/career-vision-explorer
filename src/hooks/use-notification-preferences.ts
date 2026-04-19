import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./use-auth";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  application_updates: boolean;
  job_alerts: boolean;
  interview_reminders: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationPreferences() {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    apiClient
      .get<NotificationPreferences>("/notifications/preferences")
      .then(setPreferences)
      .catch(() => {
        // silent
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const updatePreferences = useCallback(
    async (patch: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">>) => {
      setIsSaving(true);
      try {
        const updated = await apiClient.put<NotificationPreferences>("/notifications/preferences", patch);
        setPreferences(updated);
        return updated;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { preferences, isLoading, isSaving, updatePreferences };
}
