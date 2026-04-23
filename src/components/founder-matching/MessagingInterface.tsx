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
                "w-[calc(100%-1rem)] flex items-center gap-3 px-3 py-3 mx-2 mt-1 text-left transition rounded-2xl",
                isActive ? "bg-blue-50/50 shadow-sm ring-1 ring-blue-100" : "hover:bg-gray-50"
            )}
        >
            <div className="h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-600 font-bold text-sm border border-slate-200/50">
                {conv.title?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{conv.title || "Conversation"}</p>
                {lastMsg && (
                    <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{lastMsg}</p>
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
        <div className={cn("flex w-full mb-1", isMine ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[75%] lg:max-w-[65%] px-5 py-3 text-[15px] leading-relaxed shadow-sm",
                    isMine
                        ? "bg-blue-600 text-white rounded-[1.5rem] rounded-br-[0.3rem]"
                        : "bg-gray-50 border border-gray-100 text-gray-800 rounded-[1.5rem] rounded-bl-[0.3rem]"
                )}
            >
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

    const handleReadReceipt = useCallback(() => {
        loadConversations();
    }, [loadConversations]);

    const { isConnected, onlineProfiles, typingProfiles, sendTyping, broadcastReadReceipt } = useRealtimeChat({
        conversationId: activeConvId,
        enabled: Boolean(activeConvId && myProfileId),
        profileId: myProfileId,
        profileName: myProfileName,
        onMessage: handleIncomingMessage,
        onReadReceipt: handleReadReceipt,
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
        <div className="flex h-[600px] md:h-[700px] rounded-[2rem] border border-gray-100 bg-white overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-72 md:w-80 flex-shrink-0 border-r border-gray-50 flex flex-col bg-white">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h2>
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
                                    {activeConvName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate tracking-tight">{activeConvName}</p>
                                    <p className="text-xs font-semibold text-gray-400 truncate">{typingLabel}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase shadow-sm border",
                                isConnected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-500 border-gray-100"
                            )}>
                                <Radio className={cn("h-3 w-3", isConnected && "animate-pulse")} />
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
