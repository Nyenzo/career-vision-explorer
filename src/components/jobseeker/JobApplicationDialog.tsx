import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useJobApplications } from "@/hooks/use-job-applications";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { JobSummaryCard } from "./application/JobSummaryCard";
import { CoverLetterSection } from "./application/CoverLetterSection";
import { ResumeUploadSection } from "./application/ResumeUploadSection";
import { ApplicationActions } from "./application/ApplicationActions";
import { applicationsService, profileService } from "@/services";
import { ApplicationCreate } from "@/types/api";
import { useEffect } from "react";

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

interface JobApplicationDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobApplicationDialog = ({
  job,
  open,
  onOpenChange,
}: JobApplicationDialogProps) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState(false);

  const { isJobSeeker, isAuthenticated, user } = useAuth();

  // Allow job seekers to view and apply for jobs
  const canApplyForJobs = isJobSeeker();

  // Always call hooks unconditionally (Rules of Hooks)
  const { refetch: refetchFn } = useJobApplications();
  const refetchApplications = canApplyForJobs ? refetchFn : () => { };

  useEffect(() => {
    async function loadCVStatus() {
      if (open && canApplyForJobs) {
        try {
          const profile = await profileService.getProfile();
          const resumeUrl = profile.resume_url || profile.resume_link;
          const hasResume = !!resumeUrl;
          setCvUploaded(hasResume);
          setExistingResumeUrl(resumeUrl || null);
        } catch {
          setCvUploaded(false);
          setExistingResumeUrl(null);
        }
      }
    }
    loadCVStatus();
  }, [open, canApplyForJobs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!isAuthenticated || !user) {
      toast.error("Please log in to apply for jobs");
      onOpenChange(false);
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }

    if (!canApplyForJobs) {
      toast.error("Only job seekers can apply for jobs");
      return;
    }

    // Require resume if not already on profile and no new file selected
    if (!resumeFile && !cvUploaded) {
      setResumeError(true);
      toast.error("Please upload your CV to apply for this job");
      return;
    }
    setResumeError(false);

    setIsSubmitting(true);

    try {
      const applicationData: ApplicationCreate = {
        job_id: job.job_id,
        cover_letter: coverLetter,
        cv_url: existingResumeUrl || undefined,
      };

      await applicationsService.createApplication(applicationData, null);
      toast.success("Application submitted successfully!");
      refetchApplications();
      onOpenChange(false);
      setCoverLetter("");
      setResumeFile(null);
    } catch (error: any) {
      console.error("Application submission error:", error);
      toast.error(
        error.message || "Failed to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface sm:rounded-2xl border-outline-variant/30">
        <DialogHeader className="space-y-4 pt-4">
          <DialogTitle className="text-3xl font-bold font-headline text-on-surface">
            Apply for Position
          </DialogTitle>
          <DialogDescription className="text-base text-on-surface-variant max-w-[90%]">
            Transform your career architecture. Submit your application and take the next step.
          </DialogDescription>
        </DialogHeader>

        <JobSummaryCard job={job} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <CoverLetterSection
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
          />

          <ResumeUploadSection
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            cvAlreadyUploaded={cvUploaded}
            existingResumeUrl={existingResumeUrl}
            showError={resumeError}
          />

          <ApplicationActions
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

