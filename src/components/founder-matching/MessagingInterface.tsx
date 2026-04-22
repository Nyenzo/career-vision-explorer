import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Send, Loader2, MessageCircle, Radio } from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";
import type { Conversation, Message } from "@/types/founder-matching";

interface MessagingInterfaceProps {
    /** Pre-selected conversation to open */
    initialConversationId?: string;
    initialConversationName?: string;
}

function ConversationListItem({
    conv,
    isActive,
    onClick,
}: {
    conv: Conversation;
    isActive: boolean;
    onClick: () => void;
}) {
    const lastMsg = conv.last_message;
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50",
                isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""
            )}
        >
            <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-sm">
                {conv.title?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{conv.title || "Conversation"}</p>
                {lastMsg && (
                    <p className="text-xs text-gray-400 truncate">{lastMsg}</p>
                )}
            </div>
        </button>
    );
}

function MessageBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
    const time = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
    return (
        <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-xs lg:max-w-sm rounded-2xl px-4 py-2 text-sm",
                    isMine
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                )}
            >
                <p>{msg.message_text}</p>
                {time && (
                    <p className={cn("mt-1 text-[10px] text-right", isMine ? "text-blue-200" : "text-gray-400")}>
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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | undefined>(initialConversationId);
    const [activeConvName, setActiveConvName] = useState<string>(initialConversationName ?? "");
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingConvs, setIsLoadingConvs] = useState(true);
    const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
    const [myProfileId, setMyProfileId] = useState<string | undefined>();
    const [myProfileName, setMyProfileName] = useState<string>("Founder");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const mergeMessages = useCallback((incoming: Message) => {
        setMessages((prev) => {
            const existingIndex = prev.findIndex((item) => item.message_id === incoming.message_id);
            if (existingIndex >= 0) {
                const next = [...prev];
                next[existingIndex] = incoming;
                return next;
            }

            return [...prev, incoming].sort((left, right) => {
                const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
                const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
                return leftTime - rightTime;
            });
        });
    }, []);

    // Load my profile id for isMine check
    useEffect(() => {
        cofounderMatchingService.getProfile().then((p) => {
            setMyProfileId(p.profile_id);
            setMyProfileName(p.name || p.current_role || "Founder");
        }).catch(() => { });
    }, []);

    const loadConversations = useCallback(async () => {
        try {
            const res = await cofounderMatchingService.getConversations(50, 0);
            setConversations(res.conversations);
        } catch {
            toast.error("Failed to load conversations");
        } finally {
            setIsLoadingConvs(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Open initial conversation if provided
    useEffect(() => {
        if (initialConversationId) {
            setActiveConvId(initialConversationId);
            setActiveConvName(initialConversationName ?? "Conversation");
        }
    }, [initialConversationId, initialConversationName]);

    const handleIncomingMessage = useCallback((incoming: Message) => {
        mergeMessages(incoming);
        loadConversations();
    }, [loadConversations, mergeMessages]);

    const { isConnected, onlineProfiles, typingProfiles, sendTyping, broadcastReadReceipt } = useRealtimeChat({
        conversationId: activeConvId,
        enabled: Boolean(activeConvId && myProfileId),
        profileId: myProfileId,
        profileName: myProfileName,
        onMessage: handleIncomingMessage,
        onReadReceipt: () => {
            loadConversations();
        },
    });

    const loadMessages = useCallback(async (convId: string) => {
        setIsLoadingMsgs(true);
        try {
            await cofounderMatchingService.markConversationRead(convId);
            const msgs = await cofounderMatchingService.getMessages(convId, 50, 1);
            setMessages(msgs);
            await broadcastReadReceipt(msgs.at(-1)?.message_id);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setIsLoadingMsgs(false);
        }
    }, [broadcastReadReceipt]);

    useEffect(() => {
        if (activeConvId) {
            loadMessages(activeConvId);
        }
    }, [activeConvId, loadMessages]);

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
            mergeMessages(msg);
            await sendTyping(false);
            loadConversations();
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

    const openConversation = (conv: Conversation) => {
        setActiveConvId(String(conv.conversation_id));
        setActiveConvName(conv.title ?? "Conversation");
        setMessages([]);
    };

    const typingLabel = useMemo(() => {
        if (typingProfiles.length === 0) {
            return isConnected ? `${onlineProfiles.length} online in this room` : "Realtime reconnecting";
        }

        const names = typingProfiles.map((profile) => profile.name);
        return `${names.join(", ")} ${names.length === 1 ? "is" : "are"} typing...`;
    }, [isConnected, onlineProfiles.length, typingProfiles]);

    return (
        <div className="flex h-[600px] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 border-r border-gray-100 flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoadingConvs ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                            <MessageCircle className="h-8 w-8 text-gray-200" />
                            <p className="text-xs text-gray-400">No conversations yet. Message a mutual match to start.</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <ConversationListItem
                                key={conv.conversation_id}
                                conv={conv}
                                isActive={String(conv.conversation_id) === activeConvId}
                                onClick={() => openConversation(conv)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
                {!activeConvId ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
                        <MessageCircle className="h-12 w-12 text-gray-200" />
                        <p className="text-gray-400 font-medium">Select a conversation</p>
                        <p className="text-sm text-gray-300">or message a mutual match from the Matches tab</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                    {activeConvName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{activeConvName}</p>
                                    <p className="text-xs text-gray-500 truncate">{typingLabel}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                isConnected ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                            )}>
                                <Radio className="h-3.5 w-3.5" />
                                {isConnected ? "Live" : "Offline"}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                            {isLoadingMsgs ? (
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
                                    />
                                ))
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!draft.trim() || isSending}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                                    aria-label="Send"
                                >
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
