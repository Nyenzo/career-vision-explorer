import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Search, Send, Building2, User, Clock, ArrowRight } from "lucide-react";
import { useMessaging } from "@/hooks/use-messaging";

interface Message {
  id: string;
  senderName: string;
  senderCompany?: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isFromEmployer: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    senderName: "Sarah Johnson",
    senderCompany: "TechCorp Inc.",
    subject: "Interview Invitation - Senior Developer",
    content: "Hi! We're impressed with your profile and would like to invite you for an interview for our Senior Developer position. Are you available next week for a 1-hour technical interview?",
    timestamp: "2024-07-18T10:30:00Z",
    isRead: false,
    isFromEmployer: true
  },
  {
    id: "2",
    senderName: "Mike Chen",
    senderCompany: "StartupCorp",
    subject: "Application Update",
    content: "Thank you for your application to our Frontend Engineer role. We're currently reviewing your profile and will get back to you within the next few days with next steps.",
    timestamp: "2024-07-17T14:15:00Z",
    isRead: true,
    isFromEmployer: true
  },
  {
    id: "3",
    senderName: "Alex Rivera",
    subject: "Project Collaboration Opportunity",
    content: "I saw your portfolio and I'm really impressed with your React work. I have a project that might be a perfect fit. Would you be interested in discussing a potential collaboration?",
    timestamp: "2024-07-16T09:45:00Z",
    isRead: false,
    isFromEmployer: false
  }
];

export const MessagesTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const { sendMessage, isLoading } = useMessaging();

  const filteredMessages = mockMessages.filter(message =>
    message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = mockMessages.filter(msg => !msg.isRead).length;

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    const success = await sendMessage(selectedMessage.id, replyText);
    if (success) {
      setReplyText("");
      // Optionally close the dialog or update UI
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Manage your conversations with employers and collaborators</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm ? "Try adjusting your search terms" : "You haven't received any messages yet"}
              </p>
              {!searchTerm && (
                <Button variant="outline">
                  Complete Your Profile
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              !message.isRead ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'bg-white'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {message.isFromEmployer ? (
                        <Building2 className="h-5 w-5 text-white" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{message.senderName}</h4>
                      {message.senderCompany && (
                        <p className="text-sm text-gray-500">{message.senderCompany}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(message.timestamp)}
                    </span>
                    {!message.isRead && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>

                <h5 className="font-medium text-gray-900 mb-2">{message.subject}</h5>
                <p className="text-gray-600 mb-4 line-clamp-2">{message.content}</p>

                <div className="flex items-center justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMessage(message)}
                      >
                        Read Full Message
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            {message.isFromEmployer ? (
                              <Building2 className="h-4 w-4 text-white" />
                            ) : (
                              <User className="h-4 w-4 text-white" />
                            )}
                          </div>
                          {message.subject}
                        </DialogTitle>
                        <DialogDescription>
                          From {message.senderName}
                          {message.senderCompany && ` at ${message.senderCompany}`}
                          {" • "}
                          {new Date(message.timestamp).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Reply</h4>
                          <Textarea
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSendReply}
                              disabled={!replyText.trim() || isLoading}
                              className="flex items-center gap-2"
                            >
                              <Send className="h-4 w-4" />
                              {isLoading ? "Sending..." : "Send Reply"}
                            </Button>
                            <Button variant="outline">
                              Save Draft
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {message.isFromEmployer && (
                    <Badge variant="secondary" className="text-xs">
                      Employer
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};