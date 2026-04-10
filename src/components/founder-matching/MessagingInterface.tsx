import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Send, Search, MessageSquare, MoreVertical, Phone, Video, Loader2, Users, ExternalLink, ChevronLeft, Info, X, UserCircle } from 'lucide-react';
import { cofounderMatchingService, Conversation, Message, GroupParticipant } from "@/services/founder-matching.service";
import { formatDistanceToNow } from 'date-fns';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessagingInterfaceProps {
  initialMatchId?: string;
}

export const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ initialMatchId }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [availableMatches, setAvailableMatches] = useState<any[]>([]); // Matches we can start chatting with
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  // Helper: merge group conversations into regular conversations list
  const mergeGroupConversations = (regular: Conversation[], groupConvs: any[]): Conversation[] => {
    const all = [...regular];
    if (groupConvs && groupConvs.length > 0) {
      const groupWrapped: Conversation[] = groupConvs.map((gc: any) => ({
        conversation_id: gc.conversation_id,
        match_id: gc.match_id || '',
        profile_1_id: gc.profile_1_id || '',
        profile_2_id: gc.profile_2_id || '',
        last_message_at: gc.last_message_at || gc.created_at,
        unread_count: gc.unread_count || 0,
        created_at: gc.created_at,
        messages: gc.messages || [],
        other_profile: gc.other_profile || {} as any,
        conversation_type: 'project_group' as const,
        project_id: gc.project_id,
        title: gc.title,
        created_by: gc.created_by || null,
        project_description: gc.project_description || null,
        participant_count: gc.participant_count || gc.participants?.length || 0,
        participants: gc.participants || [],
      }));
      const existingIds = new Set(all.map(c => c.conversation_id));
      for (const gc of groupWrapped) {
        if (!existingIds.has(gc.conversation_id)) {
          all.push(gc);
        }
      }
      all.sort((a, b) =>
        new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      );
    }
    return all;
  };

  // Derive myProfileId from conversation data instead of a separate API call
  const deriveMyProfileId = (convs: Conversation[]) => {
    if (myProfileId) return;
    for (const c of convs) {
      if (c.other_profile?.profile_id && c.profile_1_id && c.profile_2_id) {
        const otherId = c.other_profile.profile_id;
        const me = c.profile_1_id === otherId ? c.profile_2_id : c.profile_1_id;
        if (me) { setMyProfileId(me); return; }
      }
    }
  };

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

  // Load messages when conversation is selected (track by ID to avoid re-triggering on data refresh)
  const selectedConvId = selectedConversation?.conversation_id;
  useEffect(() => {
    if (selectedConvId && selectedConversation) {
      loadMessages(selectedConvId);
      markAsRead(selectedConvId);
      setShowGroupInfo(false); // Close group info when switching conversations
    }
  }, [selectedConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Check if dashboard already prefetched this data
      const cached = cofounderMatchingService.consumePrefetchedConversations();
      let response: { conversations: Conversation[] };
      let groupConvs: Conversation[];
      if (cached) {
        response = cached.data;
        groupConvs = cached.groupData;
      } else {
        // Fetch regular and group conversations in parallel
        const [r, g] = await Promise.all([
          cofounderMatchingService.getConversations(),
          cofounderMatchingService.getGroupConversations().catch(() => [] as Conversation[]),
        ]);
        response = r;
        groupConvs = g;
      }
      const allConversations = mergeGroupConversations(response.conversations || [], groupConvs);
      setConversations(allConversations);
      deriveMyProfileId(allConversations);
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
      // Fetch regular and group conversations in parallel
      const [response, groupConvs] = await Promise.all([
        cofounderMatchingService.getConversations(),
        cofounderMatchingService.getGroupConversations().catch(() => [] as Conversation[]),
      ]);
      const allConversations = mergeGroupConversations(response.conversations || [], groupConvs);
      setConversations(allConversations);
      deriveMyProfileId(allConversations);
      
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
            const updatedConv = allConversations.find(c => c.conversation_id === selectedConversation.conversation_id);
            if (updatedConv) {
              // Update selectedConversation data (participants, counts, etc.)
              setSelectedConversation(prev => prev ? { ...prev, participants: updatedConv.participants, participant_count: updatedConv.participant_count } : prev);
              // Check for new messages
              if (updatedConv.messages?.[0]?.message_id !== messages[messages.length - 1]?.message_id) {
                loadMessages(selectedConversation.conversation_id);
              }
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
      // Send via appropriate endpoint based on conversation type
      const isGroup = selectedConversation.conversation_type === 'project_group';
      const sentMessage = isGroup
        ? await cofounderMatchingService.sendGroupMessage(
            selectedConversation.conversation_id,
            text
          )
        : await cofounderMatchingService.sendMessage(
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

  const truncateText = (text: string, maxLen: number) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
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
    <div className="flex border rounded-lg overflow-hidden bg-white shadow-sm" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
      {/* Sidebar - Conversations List */}
      <div className={cn(
        "w-full md:w-72 lg:w-80 border-r flex flex-col bg-slate-50 flex-shrink-0",
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
                   const isGroup = conv.conversation_type === 'project_group';
                   const profile = conv.other_profile;
                   if (!isGroup && !profile) return null;
                   
                   const isActive = selectedConversation?.conversation_id === conv.conversation_id;
                   const displayName = isGroup 
                     ? (conv.title || 'Group Chat')
                     : (profile?.name || profile?.current_role || "User");
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
                       {isGroup ? (
                         <div className="h-10 w-10 rounded-full bg-violet-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0">
                           <Users className="h-5 w-5 text-violet-600" />
                         </div>
                       ) : (
                         <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                           <AvatarImage src={profile?.photo_urls?.[0]} />
                           <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                             {getInitials(displayName)}
                           </AvatarFallback>
                         </Avatar>
                       )}
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-1">
                           <span className={cn(
                             "font-medium text-sm",
                             isUnread ? "text-slate-900" : "text-slate-700"
                           )}>
                             {truncateText(displayName, 28)}
                           </span>
                           {lastMsg && (
                              <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                                  {formatDistanceToNow(new Date(lastMsg.created_at || Date.now()), { addSuffix: false })}
                              </span>
                           )}
                         </div>
                         
                         <div className="flex justify-between items-center">
                           <span className={cn(
                             "text-xs", 
                             isUnread ? "text-slate-900 font-medium" : "text-muted-foreground"
                           )}>
                             {lastMsg ? (
                               isGroup ? (
                                 truncateText(
                                   (lastMsg.sender_profile_id === myProfileId 
                                     ? 'You' 
                                     : (conv.participants?.find(p => p.profile_id === lastMsg.sender_profile_id)?.name?.split(' ')[0] || 'Someone'))
                                   + ': ' + (lastMsg.message_text || ''),
                                   32
                                 )
                               ) : truncateText(lastMsg.message_text || '', 35)
                             ) : "No messages yet"}
                           </span>
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
        <div className="flex-1 flex flex-col bg-white relative">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden -ml-2 flex-shrink-0"
                      onClick={() => setSelectedConversation(null)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    {selectedConversation.conversation_type === 'project_group' ? (
                      <>
                        <button
                          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-slate-50 rounded-lg p-1 -m-1 transition-colors"
                          onClick={() => setShowGroupInfo(!showGroupInfo)}
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 text-left">
                            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                              {selectedConversation.title || 'Group Chat'}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {selectedConversation.participant_count || selectedConversation.participants?.length || 0} participants
                              {selectedConversation.participants && selectedConversation.participants.length > 0 && (
                                <> · {selectedConversation.participants.slice(0, 3).map(p => p.name?.split(' ')[0] || 'User').join(', ')}
                                  {(selectedConversation.participants.length) > 3 && ` +${(selectedConversation.participants.length) - 3}`}
                                </>
                              )}
                            </p>
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 text-slate-500 hover:text-violet-600"
                          onClick={() => setShowGroupInfo(!showGroupInfo)}
                        >
                          <Info className="h-5 w-5" />
                        </Button>
                      </>
                    ) : (
                      <>
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
                        {selectedConversation.other_profile?.profile_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => navigate(`/founder/profile/${selectedConversation.other_profile?.profile_id}`)}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View Profile
                          </Button>
                        )}
                      </>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 flex flex-col min-w-0">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No messages yet</p>
                                <p className="text-xs mt-1">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isOwn = myProfileId
                                  ? msg.sender_profile_id === myProfileId
                                  : msg.sender_profile_id !== selectedConversation.other_profile?.profile_id;
                                
                                // For group chats, find sender info from participants
                                const isGroup = selectedConversation.conversation_type === 'project_group';
                                const senderParticipant = isGroup
                                  ? selectedConversation.participants?.find(p => p.profile_id === msg.sender_profile_id)
                                  : null;
                                const senderName = isGroup && !isOwn
                                  ? senderParticipant?.name || 'Unknown'
                                  : null;
                                const senderPhoto = isGroup && !isOwn
                                  ? senderParticipant?.photo_url
                                  : null;
                                
                                // Determine if we should show the sender name (first msg or different sender from previous)
                                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                const showSenderLabel = isGroup && !isOwn && (
                                  !prevMsg || prevMsg.sender_profile_id !== msg.sender_profile_id
                                );

                                // Generate a consistent color for each sender in group chat
                                const senderColors = [
                                  'text-violet-600', 'text-emerald-600', 'text-blue-600',
                                  'text-rose-600', 'text-amber-600', 'text-teal-600',
                                  'text-indigo-600', 'text-pink-600'
                                ];
                                const senderColorIdx = isGroup
                                  ? Math.abs((msg.sender_profile_id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % senderColors.length
                                  : 0;

                                return (
                                    <div key={msg.message_id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                        {/* Avatar for group messages from others */}
                                        {isGroup && !isOwn && (
                                          <div className="flex-shrink-0 mr-2 mt-auto">
                                            {showSenderLabel ? (
                                              <Avatar className="h-7 w-7">
                                                <AvatarImage src={senderPhoto || undefined} />
                                                <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                                                  {getInitials(senderName || '')}
                                                </AvatarFallback>
                                              </Avatar>
                                            ) : (
                                              <div className="w-7" /> /* spacer for alignment */
                                            )}
                                          </div>
                                        )}
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                            isOwn 
                                                ? "bg-blue-600 text-white" 
                                                : "bg-slate-100 text-slate-900"
                                        }`}>
                                            {showSenderLabel && senderName && (
                                              <button 
                                                className={`text-[11px] font-semibold ${senderColors[senderColorIdx]} block mb-0.5 hover:underline cursor-pointer`}
                                                onClick={() => {
                                                  if (senderParticipant?.profile_id) {
                                                    navigate(`/founder/profile/${senderParticipant.profile_id}`);
                                                  }
                                                }}
                                              >
                                                {senderName}
                                              </button>
                                            )}
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

              {/* WhatsApp-style Group Info Panel */}
              {showGroupInfo && selectedConversation.conversation_type === 'project_group' && (
                <div className="w-72 lg:w-80 flex-shrink-0 border-l bg-slate-50 flex flex-col overflow-y-auto overflow-x-hidden animate-in slide-in-from-right duration-200">
                  {/* Group Info Header */}
                  <div className="p-4 border-b bg-white flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Group Info</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowGroupInfo(false)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    {/* Group Icon & Name */}
                    <div className="p-6 flex flex-col items-center border-b bg-white">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 text-center px-2 break-words">
                        {selectedConversation.title || 'Group Chat'}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Group · {selectedConversation.participant_count || selectedConversation.participants?.length || 0} participants
                      </p>
                    </div>

                    {/* Group Description */}
                    {selectedConversation.project_description && (
                      <div className="p-4 border-b bg-white">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h5>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedConversation.project_description}
                        </p>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="p-4 border-b bg-white">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Created</h5>
                      <p className="text-sm text-slate-700">
                        {selectedConversation.created_at
                          ? new Date(selectedConversation.created_at).toLocaleDateString('en-US', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })
                          : 'Unknown'}
                      </p>
                    </div>

                    {/* Members List */}
                    <div className="p-4 bg-white">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {selectedConversation.participants?.length || 0} Members
                      </h5>
                      <div className="space-y-1">
                        {selectedConversation.participants?.map((participant) => {
                          const isMe = participant.profile_id === myProfileId;
                          const isCreator = participant.profile_id === selectedConversation.created_by;

                          return (
                            <button
                              key={participant.profile_id}
                              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                              onClick={() => {
                                if (!isMe && participant.profile_id) {
                                  navigate(`/founder/profile/${participant.profile_id}`);
                                }
                              }}
                            >
                              <Avatar className="h-9 w-9 flex-shrink-0">
                                <AvatarImage src={participant.photo_url || undefined} />
                                <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                                  {getInitials(participant.name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-900 break-words">
                                    {participant.name || 'User'}
                                  </span>
                                  {isMe && (
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">You</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {participant.current_role && (
                                    <span className="text-xs text-muted-foreground break-words">
                                      {participant.current_role}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isCreator && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-0 flex-shrink-0">
                                  Admin
                                </Badge>
                              )}
                            </button>
                          );
                        })}

                        {(!selectedConversation.participants || selectedConversation.participants.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No participant info available
                          </p>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
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
