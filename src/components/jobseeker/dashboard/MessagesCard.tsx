import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, ArrowRight, Building2 } from "lucide-react";
import { useMessaging } from "@/hooks/use-messaging";

interface MessagePreview {
  id: string;
  senderName: string;
  senderCompany?: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isFromEmployer: boolean;
}

const mockMessages: MessagePreview[] = [
  {
    id: "1",
    senderName: "Sarah Johnson",
    senderCompany: "TechCorp Inc.",
    subject: "Interview Invitation",
    preview: "We'd like to invite you for an interview for the Senior Developer position...",
    timestamp: "2024-07-18T10:30:00Z",
    isRead: false,
    isFromEmployer: true
  },
  {
    id: "2",
    senderName: "Mike Chen",
    senderCompany: "StartupCorp",
    subject: "Application Update",
    preview: "Thank you for your application. We're currently reviewing your profile...",
    timestamp: "2024-07-17T14:15:00Z",
    isRead: true,
    isFromEmployer: true
  },
  {
    id: "3",
    senderName: "Alex Rivera",
    subject: "Project Collaboration",
    preview: "I saw your portfolio and would love to discuss a potential collaboration...",
    timestamp: "2024-07-16T09:45:00Z",
    isRead: false,
    isFromEmployer: false
  }
];

export const MessagesCard = () => {
  const { getUnreadCount } = useMessaging();
  const unreadCount = mockMessages.filter(msg => !msg.isRead).length;

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <MessageCircle className="h-5 w-5 text-orange-600" />
          Messages
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Recent messages and notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mb-4">Start networking to receive messages</p>
            <Button variant="outline" className="mt-4">
              Browse Network
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {mockMessages.slice(0, 3).map((message) => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    !message.isRead 
                      ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        {message.isFromEmployer ? (
                          <Building2 className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-xs font-semibold text-white">
                            {message.senderName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{message.senderName}</h5>
                        {message.senderCompany && (
                          <p className="text-xs text-gray-500">{message.senderCompany}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(message.timestamp)}
                      </span>
                      {!message.isRead && (
                        <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <h6 className="font-medium text-sm text-gray-900 mb-1">{message.subject}</h6>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.preview}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              View All Messages
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};