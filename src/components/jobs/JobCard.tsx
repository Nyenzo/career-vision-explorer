
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Briefcase, Clock, BarChart3, Heart, Home, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";

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
  companyInfo?: {
    logoUrl?: string;
  };
  // Additional fields from backend
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
  return (
    <Card className="career-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {/* Match Score Progress Bar */}
      <div className="h-2 bg-muted" aria-hidden="true">
        <div
          role="progressbar"
          aria-valuenow={job.matchScore}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`AI match score: ${job.matchScore}%`}
          className={`h-full transition-all duration-500 ${job.matchScore >= 90 ? 'bg-green-500' :
              job.matchScore >= 80 ? 'bg-blue-500' :
                job.matchScore >= 70 ? 'bg-yellow-500' :
                  'bg-orange-500'
            }`}
          style={{ width: `${job.matchScore}%` }}
        ></div>
      </div>

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.companyInfo?.logoUrl ? (
                <img
                  src={job.companyInfo.logoUrl}
                  alt={`${job.company} logo`}
                  className="w-12 h-12 rounded-lg object-contain border bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center ${job.companyInfo?.logoUrl ? 'hidden' : 'flex'
                  }`}
              >
                <Building className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-200 flex items-center gap-3">
                {job.title}
                <Badge className={`text-sm px-3 py-1 font-bold ${job.matchScore >= 90 ? 'bg-green-500 hover:bg-green-600' :
                    job.matchScore >= 80 ? 'bg-blue-500 hover:bg-blue-600' :
                      job.matchScore >= 70 ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-orange-500 hover:bg-orange-600'
                  } text-white border-0`}>
                  {job.matchScore}% Match
                </Badge>
                {isApplied && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Applied ✓
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-lg font-medium">{job.company}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave(job.job_id)}
              className={`transition-all duration-200 ${isSaved ? "text-red-500 bg-red-50 border border-red-200" : "text-gray-400 hover:text-red-500"
                }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="flex items-center gap-1">
              {job.location}
              {job.remoteFriendly && (
                <Home className="h-3 w-3 text-green-500" title="Remote friendly" />
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 text-primary" />
            {job.type}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4 text-primary" />
            {job.salary}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            {job.posted}
          </div>
        </div>

        {/* Experience Level and Application Deadline */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.experienceLevel && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {job.experienceLevel}
            </div>
          )}
          {job.applicationDeadline && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
            </div>
          )}
        </div>

        <p className="text-muted-foreground leading-relaxed line-clamp-2">
          {job.description && job.description.length > 150
            ? `${job.description.substring(0, 150)}...`
            : job.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, index) => (
            <Badge
              key={`${skill}-${index}`}
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
            >
              {skill}
            </Badge>
          ))}
        </div>

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Benefits:</h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.slice(0, 3).map((benefit, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {benefit}
                </Badge>
              ))}
              {job.benefits.length > 3 && (
                <Badge variant="outline" className="text-gray-500">
                  +{job.benefits.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <Link to={`/jobs/${job.job_id}`}
            state={{
              matchScore: job.matchScore,
              jobData: job
            }}
          >
            <Button variant="outline" className="modern-btn-secondary hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300">
              View Details
            </Button>
          </Link>
          <Button
            onClick={() => onApply(job)}
            disabled={isApplied}
            className={`${isApplied
                ? 'bg-green-600 hover:bg-green-700 text-white cursor-default'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              } transition-all duration-200`}
          >
            {isApplied ? 'Applied ✓' : 'Apply Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
