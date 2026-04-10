
import { useState, createContext, useContext, ReactNode } from 'react';
import { toast } from "@/components/ui/sonner";
import { Message } from "@/types/freelancer";

type MessagingContextType = {
  messages: Message[];
  sendMessage: (receiverId: string, message: string, tier?: string) => Promise<boolean>;
  getConversation: (userId1: string, userId2: string) => Message[];
  markAsRead: (messageId: string) => void;
  getUnreadCount: (userId: string) => number;
  isLoading: boolean;
};

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "1",
    receiverId: "3",
    message: "Hi, I'm interested in your design services. Can you help with a landing page?",
    tier: "standard",
    timestamp: new Date().toISOString(),
    isRead: false
  }
];

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (receiverId: string, message: string, tier?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: "current-user", // This would be the actual current user ID
        receiverId,
        message,
        tier,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      toast.success("Message sent successfully");
      return true;
    } catch (error) {
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getConversation = (userId1: string, userId2: string): Message[] => {
    return messages.filter(msg => 
      (msg.senderId === userId1 && msg.receiverId === userId2) ||
      (msg.senderId === userId2 && msg.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const getUnreadCount = (userId: string): number => {
    return messages.filter(msg => msg.receiverId === userId && !msg.isRead).length;
  };

  return (
    <MessagingContext.Provider value={{
      messages,
      sendMessage,
      getConversation,
      markAsRead,
      getUnreadCount,
      isLoading,
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
