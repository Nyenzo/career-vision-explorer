import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Send, Search, MessageSquare, MoreVertical, Phone, Video, Loader2 } from 'lucide-react';
import { cofounderMatchingService, Conversation, Message } from "@/services/founder-matching.service";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessagingInterfaceProps {
  initialMatchId?: string;
}

export const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ initialMatchId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [availableMatches, setAvailableMatches] = useState<any[]>([]); // Matches we can start chatting with

  // Load conversations
  useEffect(() => {
    loadConversations();
    loadAvailableMatches();
    
    // Poll for new messages every 15 seconds
    const interval = setInterval(() => {
        refreshConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle initial match selection
  useEffect(() => {
    if (initialMatchId && conversations.length > 0) {
      const existing = conversations.find(c => c.match_id === initialMatchId);
      if (existing) {
        setSelectedConversation(existing);
      }
      
    }
  }, [initialMatchId, conversations]);

  // Handle new conversation initialization
  useEffect(() => {
    const initNewChat = async () => {
       if (initialMatchId && !loading && conversations.length > 0) {
           const existing = conversations.find(c => c.match_id === initialMatchId);
           if (!existing) {
               try {
                   // Fetch match details to create a temporary conversation object
                   const match = await cofounderMatchingService.getMatchDetails(initialMatchId);
                   const tempConv: Conversation = {
                       conversation_id: "temp_" + Date.now(),
                       match_id: initialMatchId,
                       profile_1_id: "temp", // not important for UI display if we use other_profile
                       profile_2_id: "temp",
                       last_message_at: new Date().toISOString(),
                       unread_count: 0,
                       created_at: new Date().toISOString(),
                       messages: [],
                       other_profile: match.matched_profile as any // casting to compatible type
                   };
                   setSelectedConversation(tempConv);
               } catch (e) {
                   console.error("Failed to load match for new chat", e);
               }
           }
       }
    };
    
    if (initialMatchId && !loading) {
        initNewChat();
    }
  }, [initialMatchId, loading, conversations.length]); // Dependencies carefully chosen

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
      markAsRead(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await cofounderMatchingService.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };
  
  const loadAvailableMatches = async () => {
      try {
          const response = await cofounderMatchingService.getMutualMatches();
          setAvailableMatches(response.mutual_matches || []);
      } catch (e) {
          console.error("Failed to load mutual matches", e);
      }
  };

  const refreshConversations = async () => {
    try {
      const response = await cofounderMatchingService.getConversations();
      setConversations(response.conversations);
      
      // If we have a selected conversation
      if (selectedConversation) {
          // If we are currently in a temp conversation, check if it now exists in backend
          if (selectedConversation.conversation_id.startsWith('temp_')) {
               const realConv = response.conversations.find(c => c.match_id === selectedConversation.match_id);
               if (realConv) {
                   setSelectedConversation(realConv);
                   // Messages will be loaded by the useEffect on selectedConversation change
               }
          } 
          // If we are in a normal conversation, check for updates
          else {
            const updatedConv = response.conversations.find(c => c.conversation_id === selectedConversation.conversation_id);
            if (updatedConv && updatedConv.messages?.[0]?.message_id !== messages[messages.length - 1]?.message_id) {
               loadMessages(selectedConversation.conversation_id);
            }
          }
      }
    } catch (error) {
      console.error("Failed to refresh conversations", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (conversationId.startsWith('temp_')) {
      setMessages([]);
      return;
    }
    
    try {
      const msgs = await cofounderMatchingService.getMessages(conversationId);
      // Backend returns chronological order? Validation check
      // Service implementation logic suggests backend handles it, but let's ensure
      setMessages(msgs || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (conversationId.startsWith('temp_')) return;

    try {
      await cofounderMatchingService.markConversationRead(conversationId);
      // Update local state to reflect read status
      setConversations(prev => prev.map(c => {
         if (c.conversation_id === conversationId) {
             return { ...c, unread_count: 0 };
         }
         return c;
      }));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const tempId = Date.now().toString();
    const text = newMessage;
    setNewMessage(""); // Optimistic clear
    setMessageSending(true);

    try {
      // If conversation exists (which it does if selectedConversation is set from list)
      const sentMessage = await cofounderMatchingService.sendMessage(
        selectedConversation.match_id,
        text
      );
      
      // Handle optimistic update for new conversations (temp -> real)
      if (selectedConversation.conversation_id.startsWith('temp_')) {
          const newConversation: Conversation = {
              ...selectedConversation,
              conversation_id: sentMessage.conversation_id, // Use real ID from backend
              last_message_at: sentMessage.created_at,
              messages: [sentMessage],
              unread_count: 0
          };
          
          setConversations(prev => {
              // Avoid duplicates if polling already caught it
              if (prev.some(c => c.conversation_id === newConversation.conversation_id)) {
                  return prev.map(c => 
                      c.conversation_id === newConversation.conversation_id 
                      ? { ...c, messages: [sentMessage], last_message_at: sentMessage.created_at }
                      : c
                  );
              }
              return [newConversation, ...prev];
          });
          setSelectedConversation(newConversation);
          setMessages([sentMessage]);
      } else {
          setMessages(prev => [...prev, sentMessage]);
          // Update conversation last message preview
          setConversations(prev => prev.map(c => {
            if (c.conversation_id === selectedConversation.conversation_id) {
                return {
                    ...c,
                    last_message_at: new Date().toISOString(),
                    messages: [sentMessage] // update preview
                };
            }
            return c;
          }));
      }
      
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(text); // Restore on failure
    } finally {
      setMessageSending(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const startNewConversation = (match: any) => {
      // Check if conversation already exists
      const existing = conversations.find(c => c.match_id === match.match_id);
      if (existing) {
          setSelectedConversation(existing);
          return;
      }
      
      // Init temp conversation
      const tempConv: Conversation = {
           conversation_id: "temp_" + Date.now(),
           match_id: match.match_id,
           profile_1_id: "temp",
           profile_2_id: "temp",
           last_message_at: new Date().toISOString(),
           unread_count: 0,
           created_at: new Date().toISOString(),
           messages: [],
           other_profile: match.matched_profile
       };
       setSelectedConversation(tempConv);
  };

  if (loading && conversations.length === 0) {
    return (
        <div className="flex h-[600px] items-center justify-center">
            <div className="animate-pulse space-y-4">
               <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
               <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] max-h-[800px] border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Sidebar - Conversations List */}
      <div className={cn(
        "w-full md:w-80 border-r flex flex-col bg-slate-50",
        selectedConversation ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search messages..." 
              className="pl-8 bg-slate-50"
              disabled // Implementation of search filter left as improvement
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col min-h-0">
             {/* Conversations List */}
             {conversations.length > 0 && (
               <div className="flex flex-col">
                 <h4 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                    Recent
                 </h4>
                 {conversations.map(conv => {
                   const profile = conv.other_profile;
                   if (!profile) return null;
                   
                   const isActive = selectedConversation?.conversation_id === conv.conversation_id;
                   const displayName = profile.name || profile.current_role || "User";
                   const lastMsg = conv.messages?.[0];
                   const isUnread = conv.unread_count > 0;

                   return (
                     <button
                       key={conv.conversation_id}
                       onClick={() => setSelectedConversation(conv)}
                       className={cn(
                         "flex items-start gap-3 p-3 mx-2 rounded-lg text-left transition-colors hover:bg-slate-100",
                         isActive && "bg-white shadow-sm ring-1 ring-slate-200"
                       )}
                     >
                       <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                         <AvatarImage src={profile.photo_urls?.[0]} />
                         <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                           {getInitials(displayName)}
                         </AvatarFallback>
                       </Avatar>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-1">
                           <span className={cn("font-medium text-sm truncate", isUnread ? "text-slate-900" : "text-slate-700")}>
                             {displayName}
                           </span>
                           {lastMsg && (
                              <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                                  {formatDistanceToNow(new Date(lastMsg.created_at || Date.now()), { addSuffix: false })}
                              </span>
                           )}
                         </div>
                         
                         <div className="flex justify-between items-center">
                           <p className={cn(
                             "text-xs truncate pr-2", 
                             isUnread ? "text-slate-900 font-medium" : "text-muted-foreground"
                           )}>
                             {lastMsg?.message_text || "No messages yet"}
                           </p>
                           {isUnread && (
                             <Badge className="h-4 min-w-4 rounded-full px-1 flex items-center justify-center bg-blue-600 text-[10px]">
                               {conv.unread_count}
                             </Badge>
                           )}
                         </div>
                       </div>
                     </button>
                   );
                 })}
               </div>
             )}

             {/* Start New Conversation Section */}
             {availableMatches.filter(m => {
               // Check if conversation exists by match_id OR by comparing profile IDs
               const hasConversation = conversations.some(c => {
                 if (c.match_id === m.match_id) return true;
                 // Also check if other_profile user_id matches this match's profile
                 if (c.other_profile && m.matched_profile) {
                   return c.other_profile.user_id === m.matched_profile.user_id;
                 }
                 return false;
               });
               return !hasConversation;
             }).length > 0 && (
                <div className="flex flex-col pt-2">
                    <h4 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10">
                        Start Conversation
                    </h4>
                    {availableMatches
                        .filter(m => {
                          // Check if conversation exists by match_id OR by comparing profile IDs
                          const hasConversation = conversations.some(c => {
                            if (c.match_id === m.match_id) return true;
                            // Also check if other_profile user_id matches this match's profile
                            if (c.other_profile && m.matched_profile) {
                              return c.other_profile.user_id === m.matched_profile.user_id;
                            }
                            return false;
                          });
                          return !hasConversation;
                        })
                        .map(match => {
                             const profile = match.matched_profile;
                             if (!profile) return null;
                             
                             const displayName = profile.name || profile.current_role || "User";
                             
                             return (
                                <button 
                                    key={match.match_id}
                                    onClick={() => startNewConversation(match)}
                                    className="flex items-center gap-3 p-3 mx-2 rounded-lg text-left transition-colors hover:bg-slate-100 opacity-80 hover:opacity-100 group"
                                >
                                     <Avatar className="h-9 w-9">
                                       <AvatarImage src={profile.photo_urls?.[0]} />
                                       <AvatarFallback className="text-xs bg-slate-100 text-slate-600 group-hover:bg-white">
                                          {getInitials(displayName)}
                                       </AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1 min-w-0">
                                        <span className="font-medium text-sm text-slate-700 truncate block group-hover:text-slate-900">
                                            {displayName}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate block">
                                            {profile.current_role}
                                        </span>
                                     </div>
                                     <MessageSquare className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </button>
                             );
                        })}
                </div>
             )}
            
            {conversations.length === 0 && availableMatches.filter(m => {
              // Check if conversation exists by match_id OR by comparing profile IDs
              const hasConversation = conversations.some(c => {
                if (c.match_id === m.match_id) return true;
                // Also check if other_profile user_id matches this match's profile
                if (c.other_profile && m.matched_profile) {
                  return c.other_profile.user_id === m.matched_profile.user_id;
                }
                return false;
              });
              return !hasConversation;
            }).length === 0 && (
                 <div className="p-8 text-center text-muted-foreground mt-10">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-xs mt-2">Connect with co-founders to start messaging</p>
                 </div>
            )}
            
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden -ml-2"
                      onClick={() => setSelectedConversation(null)}
                    >
                        <Search className="h-5 w-5 rotate-90" />
                    </Button>
                    
                    <Avatar className="h-10 w-10">
                       <AvatarImage src={selectedConversation.other_profile?.photo_urls?.[0]} />
                       <AvatarFallback>{getInitials(selectedConversation.other_profile?.name || "")}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                        <h3 className="font-semibold text-slate-900">
                            {selectedConversation.other_profile?.name || selectedConversation.other_profile?.current_role || "User"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {selectedConversation.other_profile?.current_role}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No messages yet</p>
                            <p className="text-xs mt-1">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwn = msg.sender_profile_id !== selectedConversation.other_profile?.profile_id;
                            
                            return (
                                <div key={msg.message_id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                        isOwn 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-slate-100 text-slate-900"
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message_text}</p>
                                        <span className={`text-[10px] mt-1 block ${
                                            isOwn ? "text-blue-100" : "text-muted-foreground"
                                        }`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-slate-50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white"
                        disabled={messageSending}
                    />
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={!newMessage.trim() || messageSending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {messageSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50">
            <div className="text-center p-8">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Your Messages
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    Select a conversation from the left to start chatting or connect with more co-founders to build your network.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
