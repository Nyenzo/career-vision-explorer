import React from "react";
import { X, Bookmark, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-gray-600 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {label}
        </span>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
            <p className="mt-0.5 text-xs font-semibold text-gray-800 truncate">{value}</p>
        </div>
    );
}

export function SwipeCard({ match, onLike, onDecline, onSkip, isLoading }: SwipeCardProps) {
    const profile = match.matched_profile;

    const photo = profile.photo_urls?.[0];
    const name = profile.name || "Unknown";
    const role = profile.current_role || "Co-founder";
    const experience = profile.years_experience;
    const bio = profile.bio || "Looking to build something great together.";
    const education = profile.education?.[0];
    const achievements = profile.achievements?.[0];

    // Build tags from profile fields
    const tags: string[] = [
        profile.location_preference,
        profile.commitment_level?.replace("_", "-"),
        ...(profile.industries?.slice(0, 2) ?? []),
        ...(profile.technical_skills?.slice(0, 1) ?? []),
    ]
        .filter(Boolean)
        .map((t) => String(t))
        .slice(0, 5);

    const profileId = profile.profile_id;

    return (
        <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Photo section */}
                <div className="relative md:w-72 w-full h-56 md:h-auto flex-shrink-0 bg-slate-800">
                    {photo ? (
                        <img
                            src={photo}
                            alt={name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                            <span className="text-4xl font-bold text-white opacity-50">
                                {name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    {/* Profile badge */}
                    <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            Profile Preview
                        </span>
                    </div>
                </div>

                {/* Details section */}
                <div className="flex flex-1 flex-col p-5 gap-3">
                    {/* Name + experience row */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                            <p className="text-sm font-semibold text-blue-600">{role}</p>
                        </div>
                        {experience !== undefined && experience !== null && (
                            <div className="text-right flex-shrink-0">
                                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Experience</p>
                                <p className="text-base font-bold text-gray-900">{experience}+ Years</p>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{bio}</p>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <TagChip key={tag} label={tag} />
                            ))}
                        </div>
                    )}

                    {/* Info boxes */}
                    <div className="flex gap-2">
                        {achievements && <InfoBox label="Previous Exit" value={achievements} />}
                        {education && <InfoBox label="Education" value={education} />}
                    </div>

                    {/* Swipe hint */}
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-300 mt-auto pt-1">
                        Swipe to Explore
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6 border-t border-gray-100 py-4 bg-gray-50/50">
                <button
                    onClick={() => onDecline(profileId)}
                    disabled={isLoading}
                    aria-label="Decline"
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 shadow-sm transition hover:border-red-300 hover:text-red-500 hover:shadow-md disabled:opacity-50"
                >
                    <X className="h-5 w-5" />
                </button>

                <button
                    onClick={() => onLike(profileId)}
                    disabled={isLoading}
                    aria-label="Like"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:opacity-50"
                >
                    <Check className="h-6 w-6" />
                </button>

                <button
                    onClick={() => onSkip(profileId)}
                    disabled={isLoading}
                    aria-label="Skip"
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-400 shadow-sm transition hover:border-gray-400 hover:text-gray-600 hover:shadow-md disabled:opacity-50"
                >
                    <Bookmark className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
