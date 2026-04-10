import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Search, Send, User, Clock, ArrowRight, Star } from "lucide-react";
import { useMessaging } from "@/hooks/use-messaging";

interface FreelancerMessage {
  id: string;
  freelancerName: string;
  freelancerRating: number;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  projectType: string;
  freelancerSkills: string[];
  fullMessage: string;
}

const mockFreelancerMessages: FreelancerMessage[] = [
  {
    id: "1",
    freelancerName: "Sarah Johnson",
    freelancerRating: 4.9,
    subject: "Web Development Project Proposal",
    preview: "I'd love to discuss your upcoming web development project...",
    timestamp: "2 hours ago",
    isRead: false,
    projectType: "Web Development",
    freelancerSkills: ["React", "Node.js", "TypeScript"],
    fullMessage: "Hi! I noticed your web development project posting and I'm very interested in working with you. I have 5+ years of experience in React and Node.js development, and I've successfully completed similar projects for startups and enterprises. I'd love to discuss how I can help bring your vision to life."
  },
  {
    id: "2",
    freelancerName: "Michael Chen",
    freelancerRating: 4.8,
    subject: "UI/UX Design Services",
    preview: "I specialize in creating beautiful, user-friendly interfaces...",
    timestamp: "4 hours ago",
    isRead: false,
    projectType: "Design",
    freelancerSkills: ["Figma", "UI/UX", "Prototyping"],
    fullMessage: "Hello! I'm a UI/UX designer with 7 years of experience creating stunning digital experiences. I've worked with companies like Airbnb and Spotify on various design projects. I'd love to help you create an exceptional user experience for your application."
  },
  {
    id: "3",
    freelancerName: "Emily Rodriguez",
    freelancerRating: 5.0,
    subject: "Mobile App Development",
    preview: "I can help you build a native mobile application...",
    timestamp: "1 day ago",
    isRead: true,
    projectType: "Mobile Development",
    freelancerSkills: ["React Native", "Flutter", "iOS"],
    fullMessage: "Hi there! I'm a mobile app developer specializing in React Native and Flutter. I've built over 20 mobile applications that are currently live on the App Store and Google Play. I'm excited about the possibility of working on your mobile project."
  },
  {
    id: "4",
    freelancerName: "David Kim",
    freelancerRating: 4.7,
    subject: "Marketing Strategy Consultation",
    preview: "I can help you develop a comprehensive marketing strategy...",
    timestamp: "2 days ago",
    isRead: true,
    projectType: "Marketing",
    freelancerSkills: ["Digital Marketing", "SEO", "Content Strategy"],
    fullMessage: "Hello! I'm a digital marketing strategist with 8 years of experience helping businesses grow their online presence. I specialize in SEO, content marketing, and social media strategy. I'd love to discuss how I can help scale your business."
  }
];

export const MessagesFromFreelancers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<FreelancerMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const { sendMessage, isLoading } = useMessaging();
  
  const unreadCount = mockFreelancerMessages.filter(msg => !msg.isRead).length;
  
  const filteredMessages = mockFreelancerMessages.filter(message =>
    message.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.projectType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    const success = await sendMessage(selectedMessage.id, replyText);
    if (success) {
      setReplyText("");
      setSelectedMessage(null);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    return timestamp;
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Messages from Freelancers
              </CardTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800 border-orange-200">
                  {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border focus:border-primary"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <Dialog key={message.id}>
              <DialogTrigger asChild>
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 ${
                    !message.isRead 
                      ? 'bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200' 
                      : 'bg-background border-border hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {message.freelancerName}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {message.freelancerRating}
                          </span>
                        </div>
                        {!message.isRead && (
                          <div className="h-2 w-2 bg-orange-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1 truncate">
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {message.preview}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {message.projectType}
                        </Badge>
                        {message.freelancerSkills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {message.freelancerSkills.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{message.freelancerSkills.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(message.timestamp)}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {message.freelancerName}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {message.freelancerRating}
                        </span>
                      </div>
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    {message.subject} • {message.projectType}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {message.freelancerSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {message.fullMessage}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Reply to {message.freelancerName}</h4>
                    <Textarea
                      placeholder="Type your message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px] bg-background border-border focus:border-primary"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleSendReply}
                        disabled={isLoading || !replyText.trim()}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </CardContent>
    </Card>
  );
};