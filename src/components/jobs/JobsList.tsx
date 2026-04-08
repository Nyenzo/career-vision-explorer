
import { JobCard } from "./JobCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Star } from "lucide-react";

interface Job {
  job_id: string;
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
}

interface JobsListProps {
  jobs: Job[];
  isJobApplied: (jobId: string) => boolean;
  isJobSaved: (jobId: string) => boolean;
  onApply: (job: Job) => void;
  onSave: (jobId: string) => void;
}

export const JobsList = ({ jobs, isJobApplied, isJobSaved, onApply, onSave }: JobsListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">No jobs found</h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Try adjusting your filters or search term to discover more opportunities
          </p>
        </div>
      </div>
    );
  }

  const highMatchJobs = jobs.filter(job => job.matchScore >= 90);
  const recentJobs = jobs.filter(job => job.posted.includes('day') || job.posted.includes('Just now'));

  return (
    <div className="space-y-8">
      {/* Results Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="flex gap-2">
            {highMatchJobs.length > 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                {highMatchJobs.length} High Match
              </Badge>
            )}
            {recentJobs.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                {recentJobs.length} Recent
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {jobs.map(job => (
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
    </div>
  );
};
