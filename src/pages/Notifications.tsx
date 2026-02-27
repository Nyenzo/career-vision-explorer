import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BriefcaseIcon, User, MessageSquare, AlertCircle, Check, Trash2, RefreshCw } from 'lucide-react';
import { notificationService, type Notification } from '@/services/notification.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationIcon = ({ type, className }: { type: Notification['type']; className?: string }) => {
  const baseClass = className || 'h-5 w-5';
  
  switch (type) {
    case 'interview_scheduled':
    case 'interview_reminder':
      return <Calendar className={`${baseClass} text-blue-500`} />;
    case 'interview_cancelled':
      return <Calendar className={`${baseClass} text-red-500`} />;
    case 'application_viewed':
    case 'application_status_changed':
      return <BriefcaseIcon className={`${baseClass} text-green-500`} />;
    case 'job_match':
      return <BriefcaseIcon className={`${baseClass} text-purple-500`} />;
    case 'profile_viewed':
      return <User className={`${baseClass} text-indigo-500`} />;
    case 'message_received':
      return <MessageSquare className={`${baseClass} text-cyan-500`} />;
    case 'system':
      return <AlertCircle className={`${baseClass} text-gray-500`} />;
    default:
      return <AlertCircle className={`${baseClass} text-gray-500`} />;
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = activeTab === 'unread';
      const response = await notificationService.getNotifications({ 
        unread_only: unreadOnly,
        limit: 50
      });
      setNotifications(response.notifications);
      setStats({ total: response.total, unread: response.unread_count });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your job applications, interviews, and messages
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchNotifications}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {stats.unread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {stats.unread > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.unread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading notifications...
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-1">No notifications</p>
                  <p className="text-sm">
                    {activeTab === 'unread' 
                      ? "You're all caught up!"
                      : "You'll see notifications here when you have any"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all hover:shadow-md cursor-pointer ${
                      !notification.is_read ? 'border-blue-200 bg-blue-50/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{notification.title}</h3>
                                {!notification.is_read && (
                                  <Badge variant="default" className="text-xs">New</Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
