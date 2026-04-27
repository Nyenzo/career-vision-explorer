import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { authStorage } from "@/lib/session-auth-storage";
import type { Message } from "@/types/founder-matching";

interface RealtimeChatProfile {
  profileId: string;
  name: string;
}

interface RealtimeTypingPayload {
  profileId: string;
  name: string;
  isTyping: boolean;
}

interface RealtimeReadPayload {
  profileId: string;
  messageId?: string;
}

interface RealtimeMessageRow {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  message_text: string;
  is_read: boolean;
  is_ai_generated: boolean;
  read_at?: string | null;
  created_at?: string;
}

interface UseRealtimeChatOptions {
  conversationId?: string;
  enabled: boolean;
  profileId?: string;
  profileName?: string;
  onMessage: (message: Message) => void;
  onReadReceipt?: (payload: RealtimeReadPayload) => void;
}

const TYPING_EVENT = "typing:update";
const READ_EVENT = "message:read";
const MESSAGE_INSERT_EVENT = "INSERT";
const TYPING_BROADCAST_MIN_INTERVAL_MS = 900;
const DEBUG_REALTIME_CHAT = import.meta.env.VITE_DEBUG_REALTIME_CHAT === "true";

export function useRealtimeChat({
  conversationId,
  enabled,
  profileId,
  profileName,
  onMessage,
  onReadReceipt,
}: UseRealtimeChatOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineProfiles, setOnlineProfiles] = useState<RealtimeChatProfile[]>([]);
  const [typingProfiles, setTypingProfiles] = useState<RealtimeChatProfile[]>([]);
  const channelRef = useRef<any>(null);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastTypingStateRef = useRef<boolean | null>(null);
  const lastTypingSentAtRef = useRef<number>(0);

  const logRealtime = useCallback((message: string, context: Record<string, unknown> = {}) => {
    if (!DEBUG_REALTIME_CHAT) {
      return;
    }
    console.info("cofounder_realtime_debug", { message, ...context });
  }, []);

  const clearTypingProfile = useCallback((targetProfileId: string) => {
    const timeout = typingTimeoutsRef.current.get(targetProfileId);
    if (timeout) {
      clearTimeout(timeout);
      typingTimeoutsRef.current.delete(targetProfileId);
    }
    setTypingProfiles((prev) => prev.filter((item) => item.profileId !== targetProfileId));
  }, []);

  const syncPresence = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const state = channel.presenceState() as Record<string, Array<{ profileId?: string; name?: string }>>;
    const nextProfiles = new Map<string, RealtimeChatProfile>();

    Object.values(state).forEach((entries) => {
      entries.forEach((entry) => {
        if (!entry.profileId) return;
        nextProfiles.set(entry.profileId, {
          profileId: entry.profileId,
          name: entry.name || "Founder",
        });
      });
    });

    setOnlineProfiles(Array.from(nextProfiles.values()));
  }, []);

  useEffect(() => {
    if (!enabled || !conversationId || !profileId || !supabase) {
      setIsConnected(false);
      setOnlineProfiles([]);
      setTypingProfiles([]);
      return;
    }

    const accessToken = authStorage.getAccessToken();
    if (accessToken) {
      supabase.realtime.setAuth(accessToken);
    }

    const channel = supabase.channel(`cofounder-chat:${conversationId}`, {
      config: {
        broadcast: {
          ack: true,
          self: true,
        },
        presence: {
          key: profileId,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .on("broadcast", { event: TYPING_EVENT }, ({ payload }: { payload: RealtimeTypingPayload }) => {
        if (!payload?.profileId || payload.profileId === profileId) {
          return;
        }

        if (!payload.isTyping) {
          clearTypingProfile(payload.profileId);
          return;
        }

        setTypingProfiles((prev) => {
          const rest = prev.filter((item) => item.profileId !== payload.profileId);
          return [...rest, { profileId: payload.profileId, name: payload.name || "Founder" }];
        });

        const existingTimeout = typingTimeoutsRef.current.get(payload.profileId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        typingTimeoutsRef.current.set(
          payload.profileId,
          setTimeout(() => clearTypingProfile(payload.profileId), 2000)
        );
      })
      .on("broadcast", { event: READ_EVENT }, ({ payload }: { payload: RealtimeReadPayload }) => {
        if (!payload?.profileId || payload.profileId === profileId) {
          return;
        }
        onReadReceipt?.(payload);
      })
      .on("broadcast", { event: MESSAGE_INSERT_EVENT }, ({ payload }: { payload: any }) => {
        const row = (payload?.new ?? payload?.record ?? payload) as RealtimeMessageRow | undefined;
        if (!row || row.conversation_id !== conversationId || !row.id) {
          logRealtime("drop_message_payload", {
            conversationId,
            rowConversationId: row?.conversation_id,
            hasId: Boolean(row?.id),
          });
          return;
        }

        logRealtime("incoming_message_event", { conversationId, messageId: row.id });
        onMessage({
          message_id: row.id,
          conversation_id: row.conversation_id,
          sender_profile_id: row.sender_profile_id,
          sender_name: row.sender_profile_id === profileId ? profileName : undefined,
          message_text: row.message_text,
          is_read: row.is_read,
          is_ai_generated: row.is_ai_generated,
          read_at: row.read_at ?? undefined,
          created_at: row.created_at,
        });
      })
      .on("system", {}, (event: Record<string, any>) => {
        const payload = event?.payload ?? event;
        const severity = String(payload?.status ?? event?.status ?? "").toLowerCase();
        if (severity.includes("error") || severity.includes("timeout") || payload?.message) {
          console.warn("cofounder_realtime_system_event", {
            conversationId,
            extension: payload?.extension ?? event?.extension,
            channel: payload?.channel ?? event?.channel,
            status: payload?.status ?? event?.status,
            message: payload?.message ?? event?.message,
          });
        }
      })
      .subscribe(async (status: string) => {
        setIsConnected(status === "SUBSCRIBED");
        if (status !== "SUBSCRIBED") {
          console.warn("cofounder_realtime_subscription_status", { conversationId, status });
          logRealtime("subscription_status_change", { conversationId, status });
        }

        if (status === "SUBSCRIBED") {
          await channel.track({
            profileId,
            name: profileName || "Founder",
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      setTypingProfiles([]);
      setOnlineProfiles([]);
      setIsConnected(false);
      lastTypingStateRef.current = null;
      lastTypingSentAtRef.current = 0;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [
    clearTypingProfile,
    conversationId,
    enabled,
    onMessage,
    onReadReceipt,
    profileId,
    profileName,
    syncPresence,
    logRealtime,
  ]);

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !profileId) {
        return;
      }

      const now = Date.now();
      if (
        lastTypingStateRef.current === isTyping
        && now - lastTypingSentAtRef.current < TYPING_BROADCAST_MIN_INTERVAL_MS
      ) {
        return;
      }

      await channelRef.current.send({
        type: "broadcast",
        event: TYPING_EVENT,
        payload: {
          profileId,
          name: profileName || "Founder",
          isTyping,
        },
      });

      lastTypingStateRef.current = isTyping;
      lastTypingSentAtRef.current = now;
    },
    [profileId, profileName]
  );

  const broadcastReadReceipt = useCallback(
    async (messageId?: string) => {
      if (!channelRef.current || !profileId) {
        return;
      }

      await channelRef.current.send({
        type: "broadcast",
        event: READ_EVENT,
        payload: {
          profileId,
          messageId,
        },
      });
    },
    [profileId]
  );

  return {
    isConnected,
    onlineProfiles,
    typingProfiles,
    sendTyping,
    broadcastReadReceipt,
  };
}