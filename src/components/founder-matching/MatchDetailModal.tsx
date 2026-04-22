import React, { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  UserPlus,
  UserMinus,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CofounderMatchWithProfile, FollowStats } from "@/types/founder-matching";

interface MatchDetailModalProps {
  match: CofounderMatchWithProfile | null;
  onClose: () => void;
  onMessage: (conversationId: string, profileName: string) => void;
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 uppercase tracking-wide">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      {label}
    </span>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 flex-shrink-0 text-blue-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export function MatchDetailModal({ match, onClose, onMessage }: MatchDetailModalProps) {
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!match) return;
    setActivePhoto(0);
    cofounderMatchingService
      .getFollowStats(match.matched_profile.profile_id)
      .then((stats) => {
        setFollowStats(stats);
        setIsFollowing(stats.is_following ?? false);
      })
      .catch(() => { });
  }, [match]);

  if (!match) return null;

  const profile = match.matched_profile;
  const photos = profile.photo_urls ?? [];
  const name = profile.name || "Unknown";
  const role = profile.current_role || "Co-founder";

  const tags: string[] = [
    profile.location_preference,
    profile.commitment_level?.replace("_", "-"),
    ...(profile.industries ?? []),
    ...(profile.technical_skills?.slice(0, 3) ?? []),
  ]
    .filter(Boolean)
    .map(String)
    .slice(0, 8);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await cofounderMatchingService.unfollowProfile(profile.profile_id);
        setIsFollowing(false);
        toast.success("Unfollowed");
      } else {
        await cofounderMatchingService.followProfile(profile.profile_id);
        setIsFollowing(true);
        toast.success("Following");
      }
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    setMsgLoading(true);
    try {
      const conversation = await cofounderMatchingService.getOrCreateDirectConversation(profile.profile_id);
      onMessage(String(conversation.conversation_id), name);
      onClose();
    } catch {
      toast.error("Failed to open conversation");
    } finally {
      setMsgLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow text-gray-600 hover:text-gray-900 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative h-64 sm:h-80 bg-slate-800 overflow-hidden rounded-t-2xl">
          {photos.length > 0 ? (
            <>
              <img
                src={photos[activePhoto]}
                alt={name}
                className="h-full w-full object-cover"
              />
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePhoto(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        index === activePhoto ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      )}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <span className="text-6xl font-bold text-white/30">{name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <p className="text-base font-semibold text-blue-600">{role}</p>
              {profile.years_experience != null && (
                <p className="text-sm text-gray-500">{profile.years_experience}+ years experience</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:opacity-50",
                  isFollowing
                    ? "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
                    : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button
                onClick={handleMessage}
                disabled={msgLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {msgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                Message
              </button>
            </div>
          </div>

          {profile.bio && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">About</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {profile.location_preference && (
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={profile.preferred_locations?.join(", ") || profile.location_preference}
              />
            )}
            {profile.seeking_roles && profile.seeking_roles.length > 0 && (
              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Seeking Roles"
                value={profile.seeking_roles.join(", ")}
              />
            )}
            {profile.education && profile.education.length > 0 && (
              <InfoRow
                icon={<GraduationCap className="h-4 w-4" />}
                label="Education"
                value={profile.education.join(", ")}
              />
            )}
            {profile.achievements && profile.achievements.length > 0 && (
              <InfoRow
                icon={<Star className="h-4 w-4" />}
                label="Achievements"
                value={profile.achievements.join(" · ")}
              />
            )}
          </div>

          {followStats && (
            <div className="flex gap-4 text-center border-t border-gray-100 pt-4">
              <div>
                <p className="text-lg font-bold text-gray-900">{followStats.follower_count ?? 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{followStats.following_count ?? 0}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
              {profile.views_count != null && (
                <div>
                  <p className="text-lg font-bold text-gray-900">{profile.views_count}</p>
                  <p className="text-xs text-gray-400">Profile Views</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
