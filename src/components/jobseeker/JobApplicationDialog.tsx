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
import { applicationsService, aiService } from "@/services";
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
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [resumeError, setResumeError] = useState(false);

  const { isJobSeeker, isFreelancer, isAuthenticated, user } = useAuth();

  // Allow both job seekers and freelancers to view and apply for jobs
  const canApplyForJobs = isJobSeeker() || isFreelancer();

  // Always call hooks unconditionally (Rules of Hooks)
  const { refetch: refetchFn } = useJobApplications();
  const refetchApplications = canApplyForJobs ? refetchFn : () => {};

  useEffect(() => {
    async function checkCVStatus() {
      if (open && canApplyForJobs) {
        const isCVParsed = await aiService.checkIfCVParsed();
        setCvUploaded(isCVParsed);
      }
    }
    checkCVStatus();
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
      toast.error("Only job seekers and freelancers can apply for jobs");
      return;
    }

    // Require resume if not already uploaded
    if (!resumeFile && !cvUploaded) {
      setResumeError(true);
      toast.error("CV is required to apply for this job");
      return;
    }
    setResumeError(false);

    setIsSubmitting(true);

    try {
      // If resume file is provided and CV not already uploaded, parse it first
      if (resumeFile && !cvUploaded) {
        setIsUploadingCV(true);
        toast.info("Parsing your CV, please wait...");

        try {
          const parseResult = await aiService.uploadAndParseCV(resumeFile);
          console.log("CV parse result:", parseResult);

          if (parseResult.status === "success" || parseResult.success) {
            toast.success("CV parsed and profile updated successfully!");
            setCvUploaded(true);
          } else {
            toast.error(
              parseResult.message || "Failed to parse CV. Please try again."
            );
            return;
          }
        } catch (error: any) {
          console.error("CV parsing error:", error);

          // More specific error messages
          if (error.status === 413) {
            toast.error(
              "File too large. Please upload a file smaller than 10MB."
            );
          } else if (error.status === 400) {
            toast.error(
              "Invalid file type. Please upload PDF, DOCX, or TXT files."
            );
          } else if (error.status === 503) {
            toast.error(
              "CV parsing service is temporarily unavailable. Please try again later."
            );
          } else {
            toast.error(
              error.message || "Failed to upload CV. Please try again."
            );
          }
          return;
        } finally {
          setIsUploadingCV(false);
        }
      }

      // Continue with application submission...
      const applicationData: ApplicationCreate = {
        job_id: job.job_id,
        cover_letter: coverLetter,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold">
            Apply for Position
          </DialogTitle>
          <DialogDescription className="text-base">
            Submit your application for this exciting opportunity
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
            showError={resumeError}
          />

          <ApplicationActions
            isSubmitting={isSubmitting || isUploadingCV}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
