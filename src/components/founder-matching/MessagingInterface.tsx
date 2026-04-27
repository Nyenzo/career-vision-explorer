import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, MessageCircle, User } from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { authStorage } from "@/lib/session-auth-storage";
import type { Conversation, Message } from "@/types/founder-matching";

interface MessagingInterfaceProps {
    /** Pre-selected conversation to open */
    initialConversationId?: string;
    initialConversationName?: string;
}

type ConversationLike = Conversation & {
    id?: string;
    last_message?: string;
};

function formatLastSeen(lastSeenAt?: string): string {
    if (!lastSeenAt) {
        return "Last seen unavailable";
    }

    const timestamp = new Date(lastSeenAt).getTime();
    if (Number.isNaN(timestamp)) {
        return "Last seen unavailable";
    }

    const diffMs = Date.now() - timestamp;
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMins < 1) {
        return "Last seen just now";
    }
    if (diffMins < 60) {
        return `Last seen ${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
        return `Last seen ${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `Last seen ${diffDays}d ago`;
}

function ConversationListItem({
    conv,
    myProfileId,
    isActive,
    onClick,
}: {
    conv: ConversationLike;
    myProfileId?: string;
    isActive: boolean;
    onClick: () => void;
}) {
    const lastPreviewMessage = (conv.messages && conv.messages.length > 0)
        ? conv.messages[conv.messages.length - 1]
        : undefined;
    const previewMessage = lastPreviewMessage
        ? conv.conversation_type === "project_group" && lastPreviewMessage.sender_name
            ? `${lastPreviewMessage.sender_profile_id === myProfileId ? "You" : lastPreviewMessage.sender_name}: ${lastPreviewMessage.message_text}`
            : lastPreviewMessage.message_text
        : conv.last_message;
    const photoUrl = conv.other_profile_photo_url;
    const unreadCount = Number(conv.unread_count || 0);
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-[calc(100%-1rem)] flex items-center gap-3 px-3 py-3 mx-2 mt-1 text-left transition rounded-2xl",
                isActive ? "bg-blue-50/50 shadow-sm ring-1 ring-blue-100" : "hover:bg-gray-50"
            )}
        >
            <div className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-600 font-bold text-sm border border-slate-200/50 overflow-hidden">
                {photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={conv.title ?? "Conversation profile"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    conv.title?.[0]?.toUpperCase() ?? "?"
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                        "text-sm truncate",
                        unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                    )}>{conv.title || "Conversation"}</p>
                    {unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>
                {previewMessage && (
                    <p className={cn(
                        "text-xs truncate mt-0.5",
                        unreadCount > 0 ? "font-semibold text-gray-700" : "font-medium text-gray-500"
                    )}>{previewMessage}</p>
                )}
            </div>
        </button>
    );
}

function conversationIdOf(conv: ConversationLike): string {
    return String(conv.conversation_id ?? conv.id ?? "");
}

function MessageBubble({ msg, isMine, showSender }: { msg: Message; isMine: boolean; showSender?: boolean }) {
    const time = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
    return (
        <div className={cn("flex w-full mb-1", isMine ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[75%] lg:max-w-[65%] px-5 py-3 text-[15px] leading-relaxed shadow-sm",
                    isMine
                        ? "bg-blue-600 text-white rounded-[1.5rem] rounded-br-[0.3rem]"
                        : "bg-gray-50 border border-gray-100 text-gray-800 rounded-[1.5rem] rounded-bl-[0.3rem]"
                )}
            >
                {showSender && !isMine && msg.sender_name && (
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">{msg.sender_name}</p>
                )}
                <p className="font-medium">{msg.message_text}</p>
                {time && (
                    <p className={cn("mt-1.5 text-[10px] font-bold tracking-wider", isMine ? "text-blue-200" : "text-gray-400")}>
                        {time}
                    </p>
                )}
            </div>
        </div>
    );
}

export function MessagingInterface({
    initialConversationId,
    initialConversationName,
}: MessagingInterfaceProps) {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | undefined>(initialConversationId);
    const [activeConvName, setActiveConvName] = useState<string>(initialConversationName ?? "");
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingConvs, setIsLoadingConvs] = useState(true);
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [totalUnread, setTotalUnread] = useState(0);
    const [myProfileId, setMyProfileId] = useState<string | undefined>();
    const [myProfileName, setMyProfileName] = useState<string>("Founder");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const conversationsRefreshTimeoutRef = useRef<number | null>(null);
    const messageRepairTimeoutRef = useRef<number | null>(null);
    const isLoadingConversationsRef = useRef(false);
    const isLoadingMessagesRef = useRef(false);

    const mergeMessages = useCallback((incoming: Message) => {
        setMessages((prev) => {
            const existingIndex = prev.findIndex((item) => item.message_id === incoming.message_id);
            if (existingIndex >= 0) {
                const next = [...prev];
                next[existingIndex] = {
                    ...next[existingIndex],
                    ...incoming,
                    sender_name: incoming.sender_name ?? next[existingIndex].sender_name,
                };
                return next;
            }

            return [...prev, incoming].sort((left, right) => {
                const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
                const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
                return leftTime - rightTime;
            });
        });
    }, []);

    const scheduleMessageRepair = useCallback((delayMs = 250) => {
        if (!activeConvId) {
            return;
        }

        if (messageRepairTimeoutRef.current !== null) {
            window.clearTimeout(messageRepairTimeoutRef.current);
        }

        messageRepairTimeoutRef.current = window.setTimeout(() => {
            void cofounderMatchingService.getMessages(activeConvId, 50, 1)
                .then((msgs) => setMessages(msgs))
                .catch(() => undefined)
                .finally(() => {
                    messageRepairTimeoutRef.current = null;
                });
        }, delayMs);
    }, [activeConvId]);

    // Load my profile id for isMine check
    useEffect(() => {
        let isCancelled = false;

        cofounderMatchingService.getProfile().then((p) => {
            if (isCancelled) {
                return;
            }

            if (!p.profile_id) {
                toast.error("Could not load your profile. Message alignment may be incorrect.");
                return;
            }

            setMyProfileId(p.profile_id);
            setMyProfileName(p.name || p.current_role || "Founder");
        }).catch(() => {
            if (!isCancelled) {
                toast.error("Failed to load your cofounder profile.");
            }
        }).finally(() => {
            if (!isCancelled) {
                setIsLoadingProfile(false);
            }
        });

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().catch(() => undefined);
        }
    }, []);

    const loadConversations = useCallback(async () => {
        if (isLoadingConversationsRef.current) {
            return;
        }
        isLoadingConversationsRef.current = true;
        try {
            const res = await cofounderMatchingService.getConversations(50, 0);
            setConversations(res.conversations);
            setTotalUnread(Number(res.total_unread || 0));
        } catch {
            toast.error("Failed to load conversations");
        } finally {
            isLoadingConversationsRef.current = false;
            setIsLoadingConvs(false);
        }
    }, []);

    const scheduleConversationsRefresh = useCallback((delayMs = 200) => {
        if (conversationsRefreshTimeoutRef.current !== null) {
            window.clearTimeout(conversationsRefreshTimeoutRef.current);
        }
        conversationsRefreshTimeoutRef.current = window.setTimeout(() => {
            loadConversations();
            conversationsRefreshTimeoutRef.current = null;
        }, delayMs);
    }, [loadConversations]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        return () => {
            if (conversationsRefreshTimeoutRef.current !== null) {
                window.clearTimeout(conversationsRefreshTimeoutRef.current);
            }
            if (messageRepairTimeoutRef.current !== null) {
                window.clearTimeout(messageRepairTimeoutRef.current);
            }
        };
    }, []);

    // Open initial conversation if provided
    useEffect(() => {
        if (initialConversationId) {
            setActiveConvId(initialConversationId);
            setActiveConvName(initialConversationName ?? "Conversation");
        }
    }, [initialConversationId, initialConversationName]);

    const activeConversation = useMemo(() => {
        if (!activeConvId) {
            return undefined;
        }
        return conversations.find((conv) => conversationIdOf(conv) === activeConvId);
    }, [activeConvId, conversations]);

    const handleIncomingMessage = useCallback((incoming: Message) => {
        mergeMessages(incoming);
        scheduleConversationsRefresh();

        if (activeConversation?.conversation_type === "project_group" && !incoming.sender_name) {
            scheduleMessageRepair();
        }

        if (myProfileId && incoming.sender_profile_id !== myProfileId) {
            toast.info(`New message from ${activeConvName || "your conversation"}`);

            if (
                document.visibilityState === "hidden"
                && "Notification" in window
                && Notification.permission === "granted"
            ) {
                new Notification(`New message from ${activeConvName || "your conversation"}`, {
                    body: incoming.message_text.slice(0, 120),
                    icon: "/favicon.ico",
                });
            }
        }
    }, [activeConvName, activeConversation?.conversation_type, mergeMessages, myProfileId, scheduleConversationsRefresh, scheduleMessageRepair]);

    const handleReadReceipt = useCallback(() => {
        scheduleConversationsRefresh(300);
    }, [scheduleConversationsRefresh]);

    const { isConnected, onlineProfiles, typingProfiles, sendTyping, broadcastReadReceipt } = useRealtimeChat({
        conversationId: activeConvId,
        enabled: Boolean(activeConvId && myProfileId),
        profileId: myProfileId,
        profileName: myProfileName,
        onMessage: handleIncomingMessage,
        onReadReceipt: handleReadReceipt,
    });

    const loadMessages = useCallback(async (convId: string, markRead = true, showLoading = true) => {
        if (isLoadingMessagesRef.current) {
            return;
        }
        isLoadingMessagesRef.current = true;
        if (showLoading) {
            setIsLoadingMsgs(true);
        }
        try {
            const messagesPromise = cofounderMatchingService.getMessages(convId, 50, 1);
            const markReadPromise = markRead
                ? cofounderMatchingService.markConversationRead(convId)
                : Promise.resolve({ message: "skipped" });

            const [messagesResult] = await Promise.allSettled([
                messagesPromise,
                markReadPromise,
            ]);
            const msgs = messagesResult.status === "fulfilled" ? messagesResult.value : [];
            setMessages(msgs);
            await broadcastReadReceipt(msgs.at(-1)?.message_id);
            scheduleConversationsRefresh(250);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            isLoadingMessagesRef.current = false;
            if (showLoading) {
                setIsLoadingMsgs(false);
            }
        }
    }, [broadcastReadReceipt, scheduleConversationsRefresh]);

    useEffect(() => {
        if (activeConvId) {
            loadMessages(activeConvId, true);
        }
    }, [activeConvId, loadMessages]);

    useEffect(() => {
        if (!isAuthenticated || !user?.user_id || !supabase) {
            return;
        }

        const accessToken = authStorage.getAccessToken();
        if (accessToken) {
            supabase.realtime.setAuth(accessToken);
        }

        const channel = supabase
            .channel(`cofounder-notification-refresh:${user.user_id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.user_id}`,
                },
                (payload) => {
                    const next = payload.new as { type?: string; link?: string | null };
                    if (next.type !== "cofounder_new_message") {
                        return;
                    }
                    scheduleConversationsRefresh(100);

                    const conversationId = next.link?.includes("?")
                        ? new URLSearchParams(next.link.split("?")[1] ?? "").get("conversation_id")
                        : null;
                    if (conversationId && conversationId === activeConvId) {
                        scheduleMessageRepair(100);
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConvId, isAuthenticated, scheduleConversationsRefresh, scheduleMessageRepair, user?.user_id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!activeConvId) {
            return;
        }

        if (!draft.trim()) {
            sendTyping(false);
            return;
        }

        sendTyping(true);
        const timeoutId = window.setTimeout(() => {
            sendTyping(false);
        }, 1200);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [activeConvId, draft, sendTyping]);

    const handleSend = async () => {
        const text = draft.trim();
        if (!text || !activeConvId || isSending) return;
        setDraft("");
        setIsSending(true);
        try {
            const msg = await cofounderMatchingService.sendMessage(activeConvId, text);
            mergeMessages({
                ...msg,
                sender_name: msg.sender_name ?? myProfileName,
            });
            await sendTyping(false);
            scheduleConversationsRefresh();
        } catch {
            toast.error("Failed to send message");
            setDraft(text);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const openConversation = (conv: ConversationLike) => {
        const convId = conversationIdOf(conv);
        if (!convId) {
            toast.error("Unable to open conversation");
            return;
        }
        setActiveConvId(convId);
        setActiveConvName(conv.title ?? "Conversation");
        setMessages([]);
    };

    const typingLabel = useMemo(() => {
        if (typingProfiles.length === 0) {
            return isConnected ? `${onlineProfiles.length} online in this room` : "Realtime connecting...";
        }

        const names = typingProfiles.map((profile) => profile.name);
        return `${names.join(", ")} ${names.length === 1 ? "is" : "are"} typing...`;
    }, [isConnected, onlineProfiles.length, typingProfiles]);

    const counterpartOnline = useMemo(() => {
        return onlineProfiles.some((profile) => profile.profileId !== myProfileId);
    }, [myProfileId, onlineProfiles]);

    const isDirectConversation = activeConversation?.conversation_type !== "project_group";
    const lastSeenSource = activeConversation?.other_last_seen_at || activeConversation?.last_message_at;
    const headerPresenceLabel = counterpartOnline
        ? "Online"
        : formatLastSeen(lastSeenSource);

    return (
        <div className="flex h-[600px] md:h-[700px] rounded-[2rem] border border-gray-100 bg-white overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-72 md:w-80 flex-shrink-0 border-r border-gray-50 flex flex-col bg-white">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h2>
                        {totalUnread > 0 && (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-[11px] font-bold text-white">
                                {totalUnread > 99 ? "99+" : totalUnread}
                            </span>
                        )}
                    </div>
                    <MessageCircle className="h-5 w-5 text-gray-300" />
                </div>
                <div className="flex-1 overflow-y-auto pb-2">
                    {isLoadingConvs ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                                <MessageCircle className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map((conv, idx) => (
                            <ConversationListItem
                                key={conversationIdOf(conv) || `conv-${idx}`}
                                conv={conv}
                                myProfileId={myProfileId}
                                isActive={conversationIdOf(conv) === activeConvId}
                                onClick={() => openConversation(conv)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
                {!activeConvId ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                        <div className="h-16 w-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                            <MessageCircle className="h-8 w-8 text-gray-300" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 tracking-tight">Your Messages</p>
                            <p className="text-sm text-gray-500 mt-1">Select a conversation or start a new one from your matches</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-50 bg-white shadow-[0_4px_20px_-15px_rgba(0,0,0,0.05)] z-10">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold text-base shadow-inner border border-blue-100/50">
                                    {activeConversation?.other_profile_photo_url ? (
                                        <img
                                            src={activeConversation.other_profile_photo_url}
                                            alt={activeConvName || "Conversation profile"}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        activeConvName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate tracking-tight">{activeConvName}</p>
                                    <p className="text-xs font-semibold text-gray-400 truncate">{typingLabel}</p>
                                    {isDirectConversation && (
                                        <p className="text-[11px] font-medium text-gray-400 truncate flex items-center gap-1.5">
                                            <span className={cn("h-2 w-2 rounded-full", counterpartOnline ? "bg-emerald-500" : "bg-gray-300")} />
                                            {headerPresenceLabel}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {isDirectConversation && activeConversation?.other_profile_user_id && (
                                <button
                                    onClick={() => navigate(`/profile/${activeConversation.other_profile_user_id}`)}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                                >
                                    <User className="h-4 w-4" />
                                    View Profile
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                            {isLoadingMsgs || isLoadingProfile ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2">
                                    <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.message_id}
                                        msg={msg}
                                        isMine={myProfileId ? msg.sender_profile_id === myProfileId : false}
                                        showSender={activeConversation?.conversation_type === "project_group"}
                                    />
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="px-6 py-4 bg-white border-t border-gray-50 z-10">
                            <div className="flex items-center gap-3 p-1.5 rounded-full bg-gray-50 border border-gray-100 shadow-inner focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200 transition-all">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent px-4 py-2 text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!draft.trim() || isSending}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all mr-1"
                                    aria-label="Send"
                                >
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
