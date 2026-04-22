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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "cofounder_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            conversation_id: string;
            sender_profile_id: string;
            message_text: string;
            is_read: boolean;
            is_ai_generated: boolean;
            read_at?: string | null;
            created_at?: string;
          };

          onMessage({
            message_id: row.id,
            conversation_id: row.conversation_id,
            sender_profile_id: row.sender_profile_id,
            message_text: row.message_text,
            is_read: row.is_read,
            is_ai_generated: row.is_ai_generated,
            read_at: row.read_at ?? undefined,
            created_at: row.created_at,
          });
        }
      )
      .subscribe(async (status: string) => {
        setIsConnected(status === "SUBSCRIBED");

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
  ]);

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !profileId) {
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