import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, RefreshCw, Star } from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { SwipeCard } from "./SwipeCard";
import { toast } from "sonner";
import type { CofounderMatchWithProfile } from "@/types/founder-matching";

interface RecentMatchCardProps {
  match: CofounderMatchWithProfile;
}

function RecentMatchCard({ match }: RecentMatchCardProps) {
  const profile = match.matched_profile;
  const photo = profile.photo_urls?.[0];
  const name = profile.name || "Unknown";
  const role = profile.current_role || "Co-founder";

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm min-w-[130px]">
      <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800">
            <span className="text-lg font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 truncate max-w-[110px]">{name}</p>
        <p className="text-xs text-gray-500 truncate max-w-[110px]">{role}</p>
      </div>
      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600">
        Recently connected
      </span>
    </div>
  );
}

interface MatchDiscoveryProps {
  onViewAllMatches: () => void;
}

export function MatchDiscovery({ onViewAllMatches }: MatchDiscoveryProps) {
  const [queue, setQueue] = useState<CofounderMatchWithProfile[]>([]);
  const [recentMatches, setRecentMatches] = useState<CofounderMatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwipeLoading, setIsSwipeLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const loadDiscover = useCallback(async () => {
    setIsLoading(true);
    setIsEmpty(false);
    try {
      const [discoverRes, mutualRes] = await Promise.all([
        cofounderMatchingService.discoverMatches({ limit: 10, min_score: 0.3 }),
        cofounderMatchingService.getMutualMatches().catch(() => ({ mutual_matches: [] })),
      ]);
      setQueue(discoverRes.matches);
      setRecentMatches(mutualRes.mutual_matches.slice(0, 6));
      if (discoverRes.matches.length === 0) setIsEmpty(true);
    } catch {
      toast.error("Failed to load matches");
      setIsEmpty(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscover();
  }, [loadDiscover]);

  const removeTop = (profileId: string) => {
    setQueue((prev) => prev.filter((match) => match.matched_profile.profile_id !== profileId));
  };

  const replenishQueue = useCallback(() => {
    cofounderMatchingService
      .discoverMatches({ limit: 10, min_score: 0.3 })
      .then((res) => {
        setQueue((prev) => {
          const existingIds = new Set(prev.map((match) => match.matched_profile.profile_id));
          const newMatches = res.matches.filter(
            (match) => !existingIds.has(match.matched_profile.profile_id)
          );
          return [...prev, ...newMatches];
        });
      })
      .catch(() => { });
  }, []);

  const handleLike = async (profileId: string) => {
    setIsSwipeLoading(true);
    try {
      const res = await cofounderMatchingService.swipeRight(profileId);
      if (res.is_mutual) {
        toast.success("It's a match! You both expressed interest");
        cofounderMatchingService.getMutualMatches().then((result) => {
          setRecentMatches(result.mutual_matches.slice(0, 6));
        });
      } else {
        toast.success("Interest sent");
      }
    } catch {
      toast.error("Failed to record swipe");
    } finally {
      setIsSwipeLoading(false);
      removeTop(profileId);
      if (queue.length <= 2) {
        replenishQueue();
      }
    }
  };

  const handleDecline = async (profileId: string) => {
    setIsSwipeLoading(true);
    try {
      await cofounderMatchingService.swipeLeft(profileId);
    } catch {
      // Non-critical
    } finally {
      setIsSwipeLoading(false);
      removeTop(profileId);
      if (queue.length <= 2) {
        replenishQueue();
      }
    }
  };

  const handleSkip = async (profileId: string) => {
    setIsSwipeLoading(true);
    try {
      await cofounderMatchingService.swipeSkip(profileId);
    } catch {
      // Non-critical
    } finally {
      setIsSwipeLoading(false);
      removeTop(profileId);
      if (queue.length <= 2) {
        replenishQueue();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden animate-pulse">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-72 w-full h-56 md:h-64 bg-slate-200" />
            <div className="flex flex-1 flex-col p-5 gap-3">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
              <div className="h-16 w-full bg-gray-100 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
          <div className="h-16 bg-gray-50" />
        </div>
      </div>
    );
  }

  const current = queue[0];

  return (
    <div className="flex flex-col gap-8">

      {isEmpty || !current ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 gap-4">
          <Star className="h-10 w-10 text-gray-300" />
          <p className="text-gray-500 font-medium">No more profiles to discover right now.</p>
          <button
            onClick={loadDiscover}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      ) : (
        <SwipeCard
          match={current}
          onLike={handleLike}
          onDecline={handleDecline}
          onSkip={handleSkip}
          isLoading={isSwipeLoading}
        />
      )}

      {recentMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Matches</h2>
            <button
              onClick={onViewAllMatches}
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              View All Network
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentMatches.map((match) => (
              <RecentMatchCard key={match.matched_profile.profile_id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
