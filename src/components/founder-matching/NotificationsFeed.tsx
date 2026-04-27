import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Loader2, MessageCircle } from "lucide-react";
import {
  COFOUNDER_NOTIFICATION_TYPES,
  type Notification,
  useNotifications,
} from "@/hooks/use-notifications";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function actionLabel(notification: Notification): string {
  if (notification.type === "cofounder_new_message") {
    return "Open chat";
  }
  if (
    notification.type === "cofounder_project_join_request"
    || notification.type === "cofounder_project_approved"
  ) {
    return "Open project";
  }
  if (notification.type === "cofounder_follow") {
    return "View profile";
  }
  return "Open";
}

function getConversationId(link: string | null): string | null {
  if (!link || !link.includes("?")) {
    return null;
  }
  const query = link.split("?")[1] ?? "";
  return new URLSearchParams(query).get("conversation_id");
}

interface NotificationCardProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}

function NotificationCard({ notification, onOpen }: NotificationCardProps) {
  return (
    <div
      className={[
        "flex items-start gap-4 rounded-xl border p-4 transition",
        notification.is_read ? "border-gray-200 bg-white" : "border-blue-100 bg-blue-50/50",
      ].join(" ")}
    >
      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <MessageCircle className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
          {!notification.is_read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
        </div>
        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
        <p className="mt-2 text-xs text-gray-400">{timeAgo(notification.created_at)}</p>
      </div>

      <button
        onClick={() => onOpen(notification)}
        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        {actionLabel(notification)}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface NotificationsFeedProps {
  onOpenConversation: (conversationId: string, profileName: string) => void;
}

export function NotificationsFeed({ onOpenConversation }: NotificationsFeedProps) {
  const navigate = useNavigate();
  const { notifications, isLoading, markAsRead } = useNotifications({ limit: 50 });

  const founderNotifications = useMemo(() => {
    return notifications.filter((notification) => COFOUNDER_NOTIFICATION_TYPES.includes(notification.type));
  }, [notifications]);

  const unreadFounderCount = founderNotifications.filter((notification) => !notification.is_read).length;

  const handleOpen = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const conversationId = getConversationId(notification.link);
    if (notification.type === "cofounder_new_message" && conversationId) {
      onOpenConversation(conversationId, "Conversation");
      return;
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadFounderCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {unreadFounderCount}
          </span>
        )}
      </div>

      {founderNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 gap-3">
          <Bell className="h-10 w-10 text-gray-200" />
          <p className="text-gray-400 font-medium">No founder notifications yet.</p>
          <p className="text-sm text-gray-300">New matches, messages, follows, and project updates will appear here live.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            {founderNotifications.length} founder {founderNotifications.length === 1 ? "notification" : "notifications"}
            {" "}
            synced from the shared notifications stream.
          </p>
          {founderNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
