import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Briefcase, CheckCheck, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/hooks/use-notifications";

type Tab = "all" | "applications" | "system";

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

function filterByTab(notifications: Notification[], tab: Tab): Notification[] {
  if (tab === "all") return notifications;
  if (tab === "applications") return notifications.filter((n) => n.type === "application_status_changed");

  return notifications.filter((n) => n.type !== "application_status_changed");
}

function TypeBadge({ type }: { type: Notification["type"] }) {
  if (type === "application_status_changed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">
        <Briefcase className="h-3 w-3" /> Application
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
      <Bell className="h-3 w-3" /> System
    </span>
  );
}

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All Updates" },
  { key: "applications", label: "Applications" },
  { key: "system", label: "System" },
];

export default function JobSeekerNotifications() {
  const [tab, setTab] = useState<Tab>("all");

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, removeNotification } =
    useNotifications({ limit: 50 });

  const visible = filterByTab(notifications, tab);
  const tabUnread = filterByTab(
    notifications.filter((n) => !n.is_read),
    tab
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">
              Activity Insights
            </p>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
            <Link
              to="/account"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
            >
              <Settings className="h-3.5 w-3.5" /> Preferences
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-0">
          {TABS.map((t) => {
            const count = filterByTab(
              notifications.filter((n) => !n.is_read),
              t.key
            ).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative px-5 py-3 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "text-indigo-700 border-b-2 border-indigo-600 -mb-px"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px"
                )}
              >
                {t.label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No notifications here yet</p>
            <p className="mt-1 text-sm text-gray-400">
              {tab === "all"
                ? "When you have activity, it will appear here."
                : "No notifications in this category yet."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "group rounded-xl border bg-white p-4 shadow-sm transition-all",
                  n.is_read
                    ? "border-gray-200"
                    : "border-indigo-200 ring-1 ring-indigo-100"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                      n.is_read ? "bg-transparent" : "bg-indigo-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <TypeBadge type={n.type} />
                      <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.link ? (
                      <Link
                        to={n.link}
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className="block"
                      >
                        <p className="font-semibold text-gray-900 text-sm hover:text-indigo-700 transition-colors">
                          {n.title}
                        </p>
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                    )}
                    <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => !n.is_read && markAsRead(n.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          View details →
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                        className="rounded p-1 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeNotification(n.id)}
                      title="Delete"
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
