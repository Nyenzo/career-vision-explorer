import React from "react";
import { formatDistanceToNow } from "date-fns";

interface JobHeaderProps {
    job: {
        title?: string;
        job_title?: string;
        company?: string;
        company_name?: string;
        location?: string;
        type?: string;
        job_type?: string;
        posted?: string;
        created_at?: string;
        matchScore: number;
        match_score?: number;
        similarity_score?: number;
        company_logo_url?: string;
        companyInfo?: {
            name?: string;
            logoUrl?: string;
        };
    };
    showMatchScore?: boolean;
}

export const JobHeader = ({ job, showMatchScore = true }: JobHeaderProps) => {
    const score = Math.round((job.matchScore ?? job.similarity_score ?? 0) * ((job.matchScore <= 1 || job.similarity_score <= 1) ? 100 : 1));
    const roleTitle = job.title || job.job_title || "Untitled Role";
    const companyName = job.company || job.company_name || job.companyInfo?.name || "Unknown Company";
    const logoUrl = job.companyInfo?.logoUrl || job.company_logo_url;
    const locationLabel = job.location || "Location not specified";
    const postedValue = job.posted || job.created_at || "recently";

    const getPostedLabel = (value: string) => {
        if (!value) return "recently";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        const formatted = new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);

        const relative = formatDistanceToNow(date, { addSuffix: true });
        return `${formatted} (${relative})`;
    };

    const getMatchColorClassname = (matchScore: number) => {
        if (matchScore >= 90) return 'bg-tertiary-container text-on-tertiary-container ring-tertiary-container/30';
        if (matchScore >= 70) return 'bg-surface-container-highest text-on-surface-variant ring-surface-variant/30';
        return 'bg-surface-container-highest text-on-surface-variant ring-surface-variant/30';
    };

    return (
        <section className="bg-surface-container-lowest p-10 rounded-lg shadow-sm relative overflow-hidden">
            {/* Match badge is only shown for job seeker-facing views */}
            {showMatchScore && (
                <div className="absolute top-0 right-0 p-8">
                    <div className={`${getMatchColorClassname(score)} px-6 py-3 rounded-full flex items-center gap-2 shadow-sm ring-4`}>
                        <span className="font-headline font-bold text-xl">{score}%</span>
                        <span className="text-xs font-label font-semibold tracking-wider uppercase">Match</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Company Logo + Name */}
                <div className="w-28 flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg bg-surface-container-low p-4 flex items-center justify-center">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`${companyName} logo`}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <span className="material-symbols-outlined text-4xl text-outline">domain</span>
                    )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-on-surface-variant leading-tight line-clamp-2">
                        {companyName}
                    </p>
                </div>

                {/* Job Title & Meta */}
                <div>
                    <h1 className={`text-4xl font-headline font-bold text-on-surface tracking-tight mb-4 ${showMatchScore ? "pr-32" : ""}`}>
                        {roleTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
                        <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                            {locationLabel}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                            Posted {getPostedLabel(postedValue)}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
