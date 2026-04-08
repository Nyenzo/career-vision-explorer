import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { JobApplicationDialog } from "@/components/jobseeker/JobApplicationDialog";
import { useJobApplications } from "@/hooks/use-job-applications";
import { JobHeader } from "@/components/jobs/JobHeader";
import { JobActions } from "@/components/jobs/JobActions";
import { JobDetailsContent } from "@/components/jobs/JobDetailsContent";
import { JobDetailsView } from "@/components/jobs/JobDetailsView";
import { CompanyInfoCard } from "@/components/jobs/CompanyInfoCard";
import { JobNotFound } from "@/components/jobs/JobNotFound";
import { jobsService } from "@/services/jobs.service";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const location = useLocation();
  const { isAdmin, isEmployer, isJobSeeker, isFreelancer } = useAuth();

  // Allow both job seekers and freelancers to view and apply for jobs
  const canApplyForJobs = isJobSeeker() || isFreelancer();

  const { getApplicationForJob, isLoading: applicationsLoading } = canApplyForJobs
    ? useJobApplications()
    : { getApplicationForJob: () => null, isLoading: false };

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid job ID");
      setLoading(false);
      return;
    }

    const fetchJobDetails = async () => {
      // We set loading to true only at the beginning of the fetch process.
      setLoading(true);
      setError(null);
      try {
        const fetchedJob = await jobsService.getJobById(id);
        //merge fetched jobs with matchscore from location state
        let matchScore = location.state?.matchScore ?? Math.round((fetchedJob.similarity_score ?? 0) * 100);
        if (matchScore === 0 && canApplyForJobs) {
          try {
            const recommendations = await apiClient.get<Array<{ job_id: string; similarity_score: number }>>(
              '/vector/jobs/recommendations'
            );
            const recommendation = recommendations.find((rec) => rec.job_id === id);
            matchScore = recommendation ? Math.round(recommendation.similarity_score * 100) : Math.floor(Math.random() * 30) + 70;
          } catch (aiError) {
            console.warn('Failed to fetch AI recommendations, using random matchScore');
            matchScore = Math.floor(Math.random() * 30) + 70;
          }
        }

        setJob({ ...fetchedJob, matchScore });
      } catch (err) {
        setError("Job not found");
      } finally {
        // Loading is set to false after the fetch attempt, regardless of outcome.
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, location.state]);

  // The gatekeeper: Show a loading state until BOTH the job details and the application status are ready.
  if (loading || applicationsLoading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  // Handle the case where the job was not found or another error occurred.
  if (error || !job) {
    return (
      <Layout>
        <JobNotFound />
      </Layout>
    );
  }

  // The reliable calculation: This line now only runs AFTER the gatekeeper has confirmed all data is present.
  const isApplied = !!getApplicationForJob(job.job_id);

  const handleApply = () => {
    setApplicationDialogOpen(true);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Job removed from saved jobs" : "Job saved successfully");
  };

  const handleJobUpdate = (updatedJob: any) => {
    setJob(updatedJob);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/jobs')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <JobHeader job={job} />
              {(isAdmin() || isEmployer()) ? (
                <JobDetailsContent job={job} onUpdate={handleJobUpdate} />
              ) : (
                <JobDetailsView job={job} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <JobActions
                job={job}
                isApplied={isApplied}
                isSaved={isSaved}
                onApply={handleApply}
                onSave={handleSave}
              />
              <CompanyInfoCard
                company={{
                  name: job.company,
                  size: job.company_size || "N/A",
                  industry: job.company_industry || "N/A",
                  founded: job.company_founded || "N/A",
                  website: job.company_website || "#"
                }}
              />
            </div>
          </div>
        </div>

        <JobApplicationDialog
          job={job}
          open={applicationDialogOpen}
          onOpenChange={setApplicationDialogOpen}
        />
      </div>
    </Layout>
  );
};

export default JobDetails;
