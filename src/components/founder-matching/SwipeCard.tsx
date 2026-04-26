import React, { useState } from "react";
import {
  X,
  Bookmark,
  Check,
  MapPin,
  Award,
  Building,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  Star,
} from "lucide-react";
import { cn, getMatchScoreBgClass } from "@/lib/utils";
import type { CofounderMatchWithProfile } from "@/types/founder-matching";

interface SwipeCardProps {
  match: CofounderMatchWithProfile;
  onLike: (profileId: string) => void;
  onDecline: (profileId: string) => void;
  onSkip: (profileId: string) => void;
  isLoading?: boolean;
}

function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-gray-50 px-2 py-1 text-[9px] font-bold tracking-wider text-gray-600 uppercase border border-gray-100">
      <span className="text-gray-400">•</span>
      {label}
    </span>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50/60 p-3 min-w-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50/50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 mb-0.5">
          {label}
        </p>
        <p className="text-xs font-bold text-gray-900 truncate">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

export function SwipeCard({
  match,
  onLike,
  onDecline,
  onSkip,
  isLoading,
}: SwipeCardProps) {
  const profile = match.matched_profile;
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const photo = profile.photo_urls?.[0];
  const name = profile.name || "Unknown";
  const role = profile.current_role || "Co-founder";
  const experience = profile.years_experience;
  const bio = profile.bio || "Looking to build something great together.";

  const bioWords = bio.split(" ");
  const isBioLong = bioWords.length > 25;
  const displayBio = isBioExpanded
    ? bio
    : isBioLong
      ? bioWords.slice(0, 25).join(" ") + "..."
      : bio;

  // Build tags from profile fields
  const skills = profile.technical_skills || [];
  const seekingRoles = profile.seeking_roles || ["Technical Co-founder"];

  const profileId = profile.profile_id || (profile as any).id;
  const matchPercent =
    match.overall_score != null ? Math.round(match.overall_score * 100) : null;

  return (
    <div className="flex flex-col items-center gap-4 w-full pb-6">
      <div className="relative w-full rounded-[2rem] bg-white shadow-sm border border-gray-100 overflow-hidden max-w-[1000px] flex flex-col md:flex-row">
        {" "}
        {matchPercent != null && (
          <div
            className={`absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-md ${getMatchScoreBgClass(matchPercent)}`}
          >
            <Star className="h-3 w-3 text-white fill-white" />
            <span className="text-xs font-bold text-white tracking-wide">
              {matchPercent}% MATCH
            </span>
          </div>
        )}{" "}
        {/* Photo section */}
        <div className="relative w-full md:w-[320px] shrink-0 bg-slate-900 m-4 rounded-[1.5rem] overflow-hidden h-[280px] md:h-auto md:max-h-[380px]">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <span className="text-6xl font-bold text-white opacity-50">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {/* Details section */}
        <div className="flex flex-col p-5 gap-3 w-full justify-center min-w-0">
          {/* Name and Role */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {name}
            </h2>
            <p className="text-sm font-bold text-blue-600 mt-0.5">{role}</p>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {displayBio}
            </p>
            {isBioLong && (
              <button
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 self-start flex items-center gap-1 mt-1"
              >
                {isBioExpanded ? (
                  <>
                    Read less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <InfoBox
              icon={MapPin}
              label="Location"
              value={profile.location_preference?.replace(/_/g, " ") || ""}
            />
            <InfoBox
              icon={Award}
              label="Commitment"
              value={profile.commitment_level?.replace(/_/g, " ") || ""}
            />
            <InfoBox
              icon={Building}
              label="Industry"
              value={profile.industries?.[0] || ""}
            />
            <InfoBox
              icon={Clock}
              label="Experience"
              value={experience ? `${experience} years` : ""}
            />
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <TagChip key={skill} label={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Seeking Roles */}
          {seekingRoles.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Looking for a co-founder who is
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {seekingRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-full bg-blue-50/50 px-3 py-1.5 text-[11px] font-bold text-blue-700 border border-blue-100"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 w-full max-w-[1000px]">
        <button
          onClick={() => onDecline(profileId)}
          disabled={isLoading}
          className="flex flex-col items-center gap-2 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 shadow-sm group-hover:border-red-200 group-hover:text-red-500 group-hover:bg-red-50">
            <X className="h-6 w-6" />
          </div>
        </button>

        <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-gray-100 shadow-sm text-xs font-bold text-gray-400 tracking-widest uppercase">
          <span>← Pass</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-2" />
          <span>Connect →</span>
        </div>

        <button
          onClick={() => onLike(profileId)}
          disabled={isLoading}
          className="flex flex-col items-center gap-2 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 group"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg group-hover:bg-blue-700 group-hover:shadow-xl">
            <Check className="h-6 w-6" />
          </div>
        </button>
      </div>
    </div>
  );
}
