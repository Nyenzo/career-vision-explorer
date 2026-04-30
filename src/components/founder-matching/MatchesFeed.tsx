import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Star, Loader2, Heart, Check } from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import { useArchiveCofounderMatch, useCofounderMatches } from "@/hooks/use-cofounder-matching";
import type { CofounderMatchWithProfile, CofounderMatchProfile } from "@/types/founder-matching";
import { cn, formatIntentType } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type FilterOption = "all" | "mutual_interest" | "interests" | "suggested" | "declined";

interface MatchCardProps {
  match: CofounderMatchWithProfile;
  onMessage: (profileId: string) => void;
  onArchive: (matchId: string) => void;
  onViewProfile: (userId: string) => void;
}

function MatchCard({ match, onMessage, onArchive, onViewProfile }: MatchCardProps) {
  const profile = match.matched_profile;
  const photo = profile.photo_urls?.[0];
  const name = profile.name || "Unknown";
  const intentLabel = formatIntentType(profile.intent_type);
  const isMutual = match.status === "mutual_interest";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md",
        isMutual ? "border-blue-200" : "border-gray-100"
      )}
    >
      <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800">
            <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          {isMutual && (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
              Connected
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{intentLabel}</p>
        {profile.industries && profile.industries.length > 0 && (
          <p className="text-xs text-gray-400 truncate">{profile.industries.slice(0, 2).join(" · ")}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          {profile.user_id && (
            <button
              onClick={() => onViewProfile(profile.user_id)}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              View Profile
            </button>
          )}
          {isMutual && (
            <button
              onClick={() => onMessage(profile.profile_id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              aria-label="Message"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onArchive(match.match_id)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition"
            aria-label="Archive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Incoming Interest Card ---------- */

interface InterestCardProps {
  profile: CofounderMatchProfile;
  onViewProfile: (userId: string) => void;
  onAccept: (profileId: string) => void;
  onDecline: (profileId: string) => void;
  isAccepting: boolean;
}

function InterestCard({ profile, onViewProfile, onAccept, onDecline, isAccepting }: InterestCardProps) {
  const photo = profile.photo_urls?.[0];
  const name = profile.name || "Unknown";
  const intentLabel = formatIntentType(profile.intent_type);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600">
            <span className="text-xl font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase tracking-wide">
            <Heart className="h-2.5 w-2.5" />
            Interested
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{intentLabel}</p>
        {profile.industries && profile.industries.length > 0 && (
          <p className="text-xs text-gray-400 truncate">{profile.industries.slice(0, 2).join(" · ")}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {profile.user_id && (
            <button
              onClick={() => onViewProfile(profile.user_id)}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              View Profile
            </button>
          )}
          <button
            onClick={() => onAccept(profile.profile_id)}
            disabled={isAccepting}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50"
            aria-label="Accept interest"
            title="Accept — match back"
          >
            {isAccepting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onDecline(profile.profile_id)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition"
            aria-label="Decline interest"
            title="Decline"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- MatchesFeed ---------- */

interface MatchesFeedProps {
  onOpenConversation: (conversationId: string, profileName: string) => void;
}

export function MatchesFeed({ onOpenConversation }: MatchesFeedProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterOption>("all");
  const matchesQuery = useCofounderMatches(filter === "interests" ? "all" : filter);
  const archiveMatchMutation = useArchiveCofounderMatch();
  const matches = matchesQuery.data?.matches ?? [];
  const isLoading = matchesQuery.isLoading;

  // Incoming interest query — only fetched when viewing "interests" filter
  const incomingInterestQuery = useQuery<CofounderMatchProfile[]>({
    queryKey: ["cofounder-matching", "incoming-interest"],
    queryFn: () => cofounderMatchingService.getIncomingInterest(),
    enabled: filter === "interests",
  });
  const incomingProfiles = incomingInterestQuery.data ?? [];

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleMessage = async (profileId: string) => {
    try {
      const conversation = await cofounderMatchingService.getOrCreateDirectConversation(profileId);
      const profile = matches.find((match) => match.matched_profile.profile_id === profileId);
      const conversationId = String(conversation.conversation_id ?? "");
      if (!conversationId) {
        throw new Error("Conversation id missing in response");
      }
      onOpenConversation(
        conversationId,
        profile?.matched_profile.name || "Match"
      );
    } catch {
      toast.error("Failed to open conversation");
    }
  };

  const handleArchive = async (matchId: string) => {
    try {
      await archiveMatchMutation.mutateAsync(matchId);
      toast.success("Match archived");
    } catch {
      toast.error("Failed to archive match");
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleAcceptInterest = async (profileId: string) => {
    setAcceptingId(profileId);
    try {
      const result = await cofounderMatchingService.swipeRight(profileId);
      if (result.is_mutual) {
        toast.success("It's a match! You can now chat.");
      } else {
        toast.success("Interest accepted");
      }
      // Invalidate queries so the lists refresh
      queryClient.invalidateQueries({ queryKey: ["cofounder-matching"] });
    } catch {
      toast.error("Failed to accept interest");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineInterest = async (profileId: string) => {
    try {
      await cofounderMatchingService.swipeLeft(profileId);
      toast.success("Interest declined");
      queryClient.invalidateQueries({ queryKey: ["cofounder-matching"] });
    } catch {
      toast.error("Failed to decline");
    }
  };

  const filters: { key: FilterOption; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "interests", label: "Interests", count: incomingProfiles.length || undefined },
    { key: "mutual_interest", label: "Connected" },
    { key: "suggested", label: "Suggested" },
    { key: "declined", label: "Declined" },
  ];

  const showInterests = filter === "interests";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {filters.map((entry) => (
            <button
              key={entry.key}
              onClick={() => setFilter(entry.key)}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-xs font-semibold transition",
                filter === entry.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {entry.label}
              {entry.count != null && entry.count > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                  {entry.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interests view — incoming interest cards */}
      {showInterests && (
        <>
          {incomingInterestQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : incomingProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 gap-3">
              <Heart className="h-10 w-10 text-gray-200" />
              <p className="text-gray-400 font-medium">No pending interest requests.</p>
              <p className="text-gray-400 text-xs">When someone swipes right on you, they'll appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {incomingProfiles.map((profile) => (
                <InterestCard
                  key={profile.profile_id}
                  profile={profile}
                  onViewProfile={handleViewProfile}
                  onAccept={handleAcceptInterest}
                  onDecline={handleDeclineInterest}
                  isAccepting={acceptingId === profile.profile_id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Standard matches view */}
      {!showInterests && (
        <>
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
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
