import React, { useState, useEffect, useCallback } from "react";
import { MessageCircle, X, Star, Loader2 } from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import type { CofounderMatchWithProfile } from "@/types/founder-matching";
import { cn } from "@/lib/utils";

type FilterOption = "all" | "mutual_interest" | "suggested" | "declined";

interface MatchCardProps {
  match: CofounderMatchWithProfile;
  onMessage: (profileId: string) => void;
  onArchive: (matchId: string) => void;
}

function MatchCard({ match, onMessage, onArchive }: MatchCardProps) {
  const profile = match.matched_profile;
  const photo = profile.photo_urls?.[0];
  const name = profile.name || "Unknown";
  const role = profile.current_role || "Co-founder";
  const isMutual = match.status === "mutual_interest";

  return (
    <div
      className={cn(
        "flex items-center gap-6 rounded-[1.5rem] bg-white p-6 transition-all border",
        isMutual ? "border-blue-100 shadow-[0_8px_30px_rgb(37,99,235,0.06)]" : "border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
      )}
    >
      <div className="h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xl font-bold text-gray-900 tracking-tight truncate">{name}</p>
          {isMutual && (
            <span className="rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-[9px] font-bold text-green-600 uppercase tracking-widest">
              Mutual
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-blue-600 mt-1 truncate">{role}</p>
        {profile.industries && profile.industries.length > 0 && (
          <p className="text-xs text-gray-400 truncate">{profile.industries.slice(0, 2).join(" · ")}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-4 flex-shrink-0">
        <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-400">
          {isMutual ? "Connected" : "Open"}
        </span>
        <div className="flex items-center gap-1">
          {isMutual && (
            <button
              onClick={() => onMessage(profile.profile_id)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition hover:scale-105"
              aria-label="Message"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onArchive(match.match_id)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition hover:bg-red-50"
            aria-label="Archive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface MatchesFeedProps {
  onOpenConversation: (conversationId: string, profileName: string) => void;
}

export function MatchesFeed({ onOpenConversation }: MatchesFeedProps) {
  const [matches, setMatches] = useState<CofounderMatchWithProfile[]>([]);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cofounderMatchingService.listMatches(
        filter === "all" ? undefined : filter,
        50,
        0
      );
      setMatches(res.matches);
    } catch {
      toast.error("Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMessage = async (profileId: string) => {
    try {
      const conversation = await cofounderMatchingService.getOrCreateDirectConversation(profileId);
      const profile = matches.find((match) => match.matched_profile.profile_id === profileId);
      onOpenConversation(
        String(conversation.conversation_id),
        profile?.matched_profile.name || "Match"
      );
    } catch {
      toast.error("Failed to open conversation");
    }
  };

  const handleArchive = async (matchId: string) => {
    try {
      await cofounderMatchingService.archiveMatch(matchId);
      setMatches((prev) => prev.filter((match) => match.match_id !== matchId));
      toast.success("Match archived");
    } catch {
      toast.error("Failed to archive match");
    }
  };

  const filters: { key: FilterOption; label: string }[] = [
    { key: "all", label: "All" },
    { key: "mutual_interest", label: "Mutual" },
    { key: "suggested", label: "Suggested" },
    { key: "declined", label: "Declined" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Matches</h1>
        <div className="flex items-center gap-1 rounded-xl bg-gray-100/80 p-1">
          {filters.map((entry) => (
            <button
              key={entry.key}
              onClick={() => setFilter(entry.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition",
                filter === entry.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 gap-3">
          <Star className="h-10 w-10 text-gray-200" />
          <p className="text-gray-400 font-medium">No matches found for this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <MatchCard
              key={match.match_id}
              match={match}
              onMessage={handleMessage}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
