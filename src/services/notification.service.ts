import { apiClient } from "@/lib/api-client";

export interface Notification {
  id: string;
  user_id: string;
  type: 
    | 'interview_scheduled'
    | 'interview_reminder'
    | 'interview_cancelled'
    | 'application_viewed'
    | 'application_status_changed'
    | 'job_match'
    | 'profile_viewed'
    | 'message_received'
    | 'cofounder_new_message'
    | 'cofounder_mutual_interest'
    | 'cofounder_connection'
    | 'cofounder_match_suggestion'
    | 'system';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
}

class NotificationService {
  async getNotifications(params?: {
    unread_only?: boolean;
    notification_type?: string;
    page?: number;
    limit?: number;
  }): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.unread_only) queryParams.append('unread_only', 'true');
    if (params?.notification_type) queryParams.append('notification_type', params.notification_type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<NotificationListResponse>(
      `/notifications${queryString ? `?${queryString}` : ''}`
    );
  }

  async getNotificationStats(): Promise<NotificationStats> {
    return await apiClient.get<NotificationStats>('/notifications/stats');
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return await apiClient.put<Notification>(`/notifications/${notificationId}/read`, {});
  }

  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    return await apiClient.post('/notifications/mark-all-read', {});
  }

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return await apiClient.delete(`/notifications/${notificationId}`);
  }

  async createNotification(notification: {
    user_id: string;
    type: Notification['type'];
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    return await apiClient.post<Notification>('/notifications', notification);
  }
}

export const notificationService = new NotificationService();
