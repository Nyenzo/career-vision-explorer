import React from "react";

interface JobDetailsViewProps {
  job: any;
}

const fallbackText = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return value;
};

export const JobDetailsView = ({ job }: JobDetailsViewProps) => {
  if (!job) return null;

  return (
    <div className="space-y-8">
        {/* Information Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-low p-6 rounded-lg text-center">
                <span className="text-primary material-symbols-outlined mb-2">fingerprint</span>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">Job ID</p>
                <p className="font-headline font-semibold">{fallbackText(job.job_id).substring(0, 10)}${job.job_id && '...'}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg text-center">
                <span className="text-primary material-symbols-outlined mb-2">military_tech</span>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">Experience</p>
                <p className="font-headline font-semibold capitalize">{fallbackText(job.experience_level || job.experienceLevel)}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg text-center">
                <span className="text-primary material-symbols-outlined mb-2">school</span>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">Job Type</p>
                <p className="font-headline font-semibold capitalize">{fallbackText(job.job_type || job.type)}</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg text-center">
                <span className="text-primary material-symbols-outlined mb-2">public</span>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest mb-1">Remote</p>
                <p className="font-headline font-semibold">{job.remote_friendly ? "Yes" : "No"}</p>
            </div>
        </section>

        {/* About the Role */}
        <section className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-surface-container/50">
            <h2 className="text-2xl font-headline font-bold mb-6">About the Role</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed font-body whitespace-pre-wrap">
                {job.description ? job.description : "No description provided."}
            </p>
        </section>

        {/* Responsibilities & Requirements */}
        <section className="grid md:grid-cols-2 gap-8">
            {/* Responsibilities */}
            <div className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-surface-container/50">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">task_alt</span>
                    Key Responsibilities
                </h3>
                {job.responsibilities?.length ? (
                    <ul className="space-y-4">
                        {job.responsibilities.map((resp: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-on-surface-variant">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                {resp}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-on-surface-variant italic">Not specified</p>
                )}
            </div>

            {/* Requirements */}
            <div className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-surface-container/50">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    Requirements
                </h3>
                {job.requirements ? (
                    <ul className="space-y-4">
                        {(typeof job.requirements === "string" ? job.requirements.split(/\r?\n|,/).map(r=>r.trim()).filter(Boolean) : job.requirements).map((req: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-on-surface-variant">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                {req}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-on-surface-variant italic">Not specified</p>
                )}
            </div>
        </section>

        {/* Skills & Benefits */}
        <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-surface-container/50">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    Required Skills
                </h3>
                {job.skills_required?.length || job.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                        {(job.skills_required || job.skills || []).map((skill: string, index: number) => (
                            <span key={index} className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-sm text-sm font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-on-surface-variant italic">No specific skills listed.</p>
                )}
            </div>

            <div className="bg-surface-container-lowest p-10 rounded-lg shadow-sm border border-surface-container/50">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">card_giftcard</span>
                    Benefits
                </h3>
                {job.benefits?.length ? (
                    <ul className="space-y-4">
                        {job.benefits.map((benefit: string, index: number) => (
                            <li key={index} className="flex items-center gap-3 text-on-surface-variant">
                                <span className="material-symbols-outlined text-tertiary-container text-lg">check_circle</span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-on-surface-variant italic">Not specified</p>
                )}
            </div>
        </section>

    </div>
  );
};