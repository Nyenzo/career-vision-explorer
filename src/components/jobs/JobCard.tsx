import { Link } from "react-router-dom";

interface Job {
  job_id: string;
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  matchScore: number;
  skills: string[];
  description: string;
  experienceLevel?: string;
  companyInfo?: {
    logoUrl?: string;
  };
  benefits?: string[];
  remoteFriendly?: boolean;
  applicationDeadline?: string;
  requirements?: string;
  postedBy?: string;
  isActive?: boolean;
}

interface JobCardProps {
  job: Job;
  isApplied: boolean;
  isSaved: boolean;
  onApply: (job: Job) => void;
  onSave: (jobId: string) => void;
}

export const JobCard = ({ job, isApplied, isSaved, onApply, onSave }: JobCardProps) => {
  const getMatchColorClassname = (score: number) => {
    if (score >= 90) return 'bg-tertiary-container text-on-tertiary-container match-glow';
    if (score >= 70) return 'bg-surface-container-highest text-on-surface-variant';
    return 'bg-surface-container-highest text-on-surface-variant';
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0_2px_10px_rgba(25,28,30,0.06)] hover:shadow-[0_8px_20px_rgba(25,28,30,0.08)] transition-all duration-300 group">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Company Logo */}
        <div className="w-20 h-20 rounded-md bg-surface-container-low flex items-center justify-center flex-shrink-0 overflow-hidden border border-surface-container">
          {job.companyInfo?.logoUrl ? (
            <img alt={`${job.company} logo`} className="w-12 h-12 object-contain" src={job.companyInfo.logoUrl} />
          ) : (
            <span className="material-symbols-outlined text-outline text-3xl">domain</span>
          )}
        </div>

        {/* Job Content */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                {job.title}
              </h2>
              <p className="text-primary font-semibold text-lg">{job.company}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`${getMatchColorClassname(job.matchScore)} px-4 py-2 rounded-full flex items-center gap-2`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <span className="font-label text-xs font-bold tracking-wider">{job.matchScore || 0}% MATCH</span>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); onSave(job.job_id); }}
                className={`p-2 transition-colors ${isSaved ? 'text-primary' : 'text-outline hover:text-primary'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              </button>
              <button className="p-2 text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined">bar_chart</span>
              </button>
            </div>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-4 text-on-surface-variant font-body">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span className="text-sm">{job.location} {job.remoteFriendly ? "(Remote)" : ""}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span className="text-sm">{job.type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">payments</span>
              <span className="text-sm">{job.salary}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs font-medium text-outline">Posted {job.posted}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex justify-between items-center border-t border-surface-container">
            <Link
              className="text-primary font-bold hover:underline underline-offset-4 flex items-center gap-2 transition-all"
              to={`/jobseeker/jobs/${job.job_id}`}
              state={{ matchScore: job.matchScore, jobData: job }}
            >
              View Details
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <button
              onClick={(e) => { e.preventDefault(); onApply(job); }}
              disabled={isApplied}
              className={`px-10 py-3 font-bold rounded-full transition-transform active:scale-95 ${isApplied
                  ? 'bg-secondary-fixed text-on-secondary-fixed shadow-none cursor-default'
                  : 'gradient-btn text-on-primary hover:scale-[1.02] shadow-md shadow-primary/20'
                }`}
            >
              {isApplied ? 'Applied ✓' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
