import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, UserCheck, Loader2, Bell } from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import type { CofounderMatchWithProfile } from "@/types/founder-matching";

interface NotificationCardProps {
  match: CofounderMatchWithProfile;
  onMessage: (profileId: string) => void;
}

function NotificationCard({ match, onMessage }: NotificationCardProps) {
  const profile = match.matched_profile;
  const photo = profile.photo_urls?.[0];
  const name = profile.name || "Unknown";
  const role = profile.current_role || "Co-founder";

  return (
    <div className="flex items-center gap-6 rounded-[1.5rem] border border-blue-100 bg-blue-50/50 p-6 shadow-[0_8px_30px_rgb(37,99,235,0.06)] transition-all">
      <div className="relative flex-shrink-0">
        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
          {photo ? (
            <img src={photo} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
            </div>
          )}
        </div>
        <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-sm">
          <UserCheck className="h-3.5 w-3.5 text-white" />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-[15px]">
          <span className="font-bold text-blue-700 tracking-tight">{name}</span> expressed mutual interest
        </p>
        <p className="text-sm font-semibold text-gray-500 truncate mt-1">{role} · ready to connect</p>
        {profile.industries && profile.industries.length > 0 && (
          <p className="text-xs text-gray-400 truncate">{profile.industries.slice(0, 2).join(" · ")}</p>
        )}
      </div>

      <button
        onClick={() => onMessage(profile.profile_id)}
        className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 transition"
      >
        <MessageCircle className="h-4 w-4" />
        Message
      </button>
    </div>
  );
}

interface NotificationsFeedProps {
  onOpenConversation: (conversationId: string, profileName: string) => void;
}

export function NotificationsFeed({ onOpenConversation }: NotificationsFeedProps) {
  const [mutualMatches, setMutualMatches] = useState<CofounderMatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cofounderMatchingService.getMutualMatches();
      setMutualMatches(res.mutual_matches);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMessage = async (profileId: string) => {
    try {
      const conversation = await cofounderMatchingService.getOrCreateDirectConversation(profileId);
      const match = mutualMatches.find((entry) => entry.matched_profile.profile_id === profileId);
      onOpenConversation(
        String(conversation.conversation_id),
        match?.matched_profile.name || "Match"
      );
    } catch {
      toast.error("Failed to open conversation");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
        {mutualMatches.length > 0 && (
          <span className="ml-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-[11px] font-bold text-white shadow-sm">
            {mutualMatches.length}
          </span>
        )}
      </div>

      {mutualMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 gap-3">
          <Bell className="h-10 w-10 text-gray-200" />
          <p className="text-gray-400 font-medium">No mutual matches yet.</p>
          <p className="text-sm text-gray-300">Keep swiping to find your co-founder!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            {mutualMatches.length} mutual {mutualMatches.length === 1 ? "match" : "matches"} - these
            founders also expressed interest in you.
          </p>
          {mutualMatches.map((match) => (
            <NotificationCard
              key={match.match_id}
              match={match}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
