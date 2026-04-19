
import { Building, MapPin, Briefcase, DollarSign } from "lucide-react";

interface JobSummaryCardProps {
  job: any;
}

export const JobSummaryCard = ({ job }: JobSummaryCardProps) => {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 space-y-4">
      <h3 className="text-xl font-bold font-headline text-on-surface">{job.title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Building className="h-5 w-5 text-primary" />
          <span className="font-medium">{job.company}</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <MapPin className="h-5 w-5 text-primary" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Briefcase className="h-5 w-5 text-primary" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <DollarSign className="h-5 w-5 text-tertiary" />
          <span className="font-semibold text-tertiary">{job.salary}</span>
        </div>
      </div>
      
      {job.matchScore != null && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Match Score:</span>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            job.matchScore >= 90 ? 'bg-green-100 text-green-800' : 
            job.matchScore >= 80 ? 'bg-blue-100 text-blue-800' : 
            job.matchScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-orange-100 text-orange-800'
          }`}>
            {job.matchScore}%
          </div>
        </div>
      )}
    </div>
  );
};
