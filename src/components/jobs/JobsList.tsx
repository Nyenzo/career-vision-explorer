import { JobCard } from "./JobCard";
import { TrendingUp } from "lucide-react";

interface Job {
  job_id: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  matchScore: number | null;
  skills: string[];
  description: string;
  experienceLevel?: string;
}

interface JobsListProps {
  jobs: Job[];
  isJobApplied: (jobId: string) => boolean;
  isJobSaved: (jobId: string) => boolean;
  onApply: (job: Job) => void;
  onSave: (jobId: string) => void;
}

export const JobsList = ({
  jobs,
  isJobApplied,
  isJobSaved,
  onApply,
  onSave,
}: JobsListProps) => {
  if (jobs.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 pb-24 space-y-6">
        <div className="text-center py-20 bg-surface-container-lowest rounded-lg shadow-sm border border-surface-container">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-outline" />
          </div>
          <h3 className="font-headline text-2xl font-bold mb-4 text-on-surface">
            No jobs found
          </h3>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed">
            Try adjusting your filters or search term to discover more
            opportunities
          </p>
        </div>
      </section>
    );
  }

  const highMatchJobs = jobs.filter(
    (job) => job.matchScore != null && job.matchScore >= 90,
  );
  const recentJobs = jobs.filter(
    (job) =>
      job.posted.includes("day") ||
      job.posted.includes("Just now") ||
      job.posted.includes("hours"),
  );

  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 space-y-6 z-10 relative">
      {/* Results Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-surface-container-lowest rounded-lg shadow-sm border border-surface-container">
        <div className="flex items-center gap-4">
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Found
          </h2>
          <div className="flex gap-2">
            {highMatchJobs.length > 0 && (
              <span className="bg-tertiary-container text-on-tertiary-container border border-tertiary/20 px-3 py-1 rounded-full text-xs font-bold font-label tracking-wide flex items-center">
                <span
                  className="material-symbols-outlined text-[14px] mr-1"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bolt
                </span>
                {highMatchJobs.length} High Match
              </span>
            )}
            {recentJobs.length > 0 && (
              <span className="bg-secondary-fixed text-on-secondary-fixed border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold font-label tracking-wide flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">
                  schedule
                </span>
                {recentJobs.length} Recent
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {jobs.map((job) => (
          <JobCard
            key={job.job_id}
            job={job}
            isApplied={isJobApplied(job.job_id)}
            isSaved={isJobSaved(job.job_id)}
            onApply={onApply}
            onSave={onSave}
          />
        ))}
      </div>
    </section>
  );
};
