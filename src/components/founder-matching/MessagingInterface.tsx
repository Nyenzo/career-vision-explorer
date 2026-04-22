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
    const timeAgo = lastMsg ? "2M AGO" : ""; // Placeholder for time
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50",
                isActive ? "bg-white shadow-sm rounded-l-xl relative z-10" : "bg-transparent rounded-l-xl"
            )}
        >
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
            )}
            <div className={cn(
                "h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden",
                isActive ? "ring-2 ring-blue-500 ring-offset-2" : "bg-slate-200 text-slate-600"
            )}>
                {conv.title?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0 mt-0.5">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 truncate">{conv.title || "Conversation"}</p>
                    {timeAgo && <p className="text-[9px] font-bold text-gray-400 uppercase">{timeAgo}</p>}
                </div>
                {lastMsg && (
                    <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{lastMsg}</p>
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
        <div className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}>
            {!isMine && (
                <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-600">
                    A
                </div>
            )}
            <div className="flex flex-col gap-1 max-w-2xl">
                <div
                    className={cn(
                        "px-6 py-4 text-sm leading-relaxed font-medium",
                        isMine
                            ? "bg-blue-600 text-white rounded-3xl rounded-br-sm"
                            : "bg-[#f1f5f9] text-gray-800 rounded-3xl rounded-bl-sm"
                    )}
                >
                    <p>{msg.message_text}</p>
                </div>
                {time && (
                    <p className={cn("text-[10px] font-semibold text-gray-300 mx-2", isMine ? "text-right" : "text-left")}>
                        {time}
                    </p>
                )}
            </div>
            {isMine && (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center font-bold text-xs text-blue-700">
                    M
                </div>
            )}
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
        <div className="flex h-[800px] bg-white w-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            {/* Sidebar */}
            <div className="w-[320px] flex-shrink-0 bg-gray-50/50 flex flex-col border-r border-gray-100">
                <div className="p-6 pb-2">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h2>
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder="Search matches..."
                            className="w-full rounded-xl bg-gray-100/80 border-transparent px-4 py-2.5 text-sm font-medium focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 pt-4">
                    {isLoadingConvs ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
                            <MessageCircle className="h-8 w-8 text-gray-200" />
                            <p className="text-xs text-gray-400 font-medium">No conversations yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {conversations.map((conv) => (
                                <ConversationListItem
                                    key={conv.conversation_id}
                                    conv={conv}
                                    isActive={String(conv.conversation_id) === activeConvId}
                                    onClick={() => openConversation(conv)}
                                />
                            ))}
                        </div>
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
                        <div className="flex items-center justify-between gap-4 px-8 py-5 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 flex-shrink-0">
                                    {activeConvName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight truncate">{activeConvName}</h3>
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-green-600 uppercase border border-green-100">
                                            Match
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 truncate mt-0.5">Founder • {typingLabel || "Ready to connect"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <button className="inline-flex items-center gap-2 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100">
                                    View Profile
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-white">
                            <div className="text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">OCTOBER 24, 2023</p>
                            </div>
                            {isLoadingMsgs ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2">
                                    <p className="text-sm font-medium text-gray-400">No messages yet. Say hello!</p>
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
                        <div className="px-8 py-6 bg-white border-t border-gray-50">
                            <div className="flex items-center gap-3 bg-[#f8fafc] rounded-full p-2 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200/50 text-gray-500 hover:text-gray-700 transition flex-shrink-0">
                                    <span className="text-xl leading-none font-medium mb-0.5">+</span>
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Write your message..."
                                    className="flex-1 bg-transparent px-2 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!draft.trim() || isSending}
                                    className="flex h-10 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition flex-shrink-0"
                                >
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
