
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ThumbsUp, ThumbsDown, Download, Mail, FileText, Briefcase, Check, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { EmployerApplication } from "@/hooks/use-employer-applications";
import { API_CONFIG } from "@/config/api.config";

interface ApplicantProfileDialogProps {
  applicant: EmployerApplication;
  onStatusChange: (id: string, status: 'Reviewed' | 'Accepted' | 'Rejected', notes?: string) => void;
  onScheduleInterview: (id: string) => void;
  children: React.ReactNode;
}

export function ApplicantProfileDialog({
  applicant,
  onStatusChange,
  onScheduleInterview,
  children
}: ApplicantProfileDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleAccept = () => {
    onStatusChange(applicant.id, "Accepted");
    toast.success(`${applicant.applicantInfo.name} has been accepted!`);
    setOpen(false);
  };

  const handleReject = () => {
    onStatusChange(applicant.id, "Rejected");
    toast.success(`${applicant.applicantInfo.name} has been rejected.`);
    setOpen(false);
  };

  const handleScheduleInterview = () => {
    onScheduleInterview(applicant.id);
    toast.success(`Interview scheduled with ${applicant.applicantInfo.name}`);
    setOpen(false);
  };

  const matchScore = applicant.match_score || 0;

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleDownloadResume = async () => {
    if (!applicant.resume_link) {
      toast.error("No resume available for this applicant.");
      return;
    }

    try {
      // Use the backend proxy endpoint to download the resume
      const token = localStorage.getItem('access_token');
      const baseUrl = API_CONFIG.BASE_URL;
      const response = await fetch(
        `${baseUrl}/applications/resume/download?user_id=${applicant.user_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Download failed (${response.status})`);
      }

      // Create a blob and trigger download inline
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Extract filename from Content-Disposition header or fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.match(/filename=(.+)/)?.[1] || 'resume.pdf';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Resume downloaded successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to download resume.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Applicant Profile</DialogTitle>
          <DialogDescription>
            Review application details for {applicant.applicantInfo.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Info & Match Score */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">{applicant.applicantInfo.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                Applied for: {applicant.jobInfo.title}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {applicant.applicantInfo.email || 'No email provided'}
              </p>
              <p className="text-sm text-gray-500">
                Applied: {applicant.appliedDate}
              </p>
            </div>
            <div>
              <span className={`${getScoreBadgeColor(matchScore)} text-xs px-3 py-1 rounded-full font-medium`}>
                {matchScore}% Match
              </span>
            </div>
          </div>

          {/* Skill Match */}
          <div className="border-t border-b py-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Skill Match</h4>
              <span className="text-sm text-gray-500">Based on required vs. applicant skills</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${matchScore >= 70 ? 'bg-green-500' : matchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {matchScore > 0
                ? `${matchScore}% match score`
                : 'No skill data available for comparison'}
            </p>

            {/* Matched skills breakdown */}
            {applicant.matched_skills && applicant.matched_skills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-green-700 mb-1 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Matched Skills ({applicant.matched_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.matched_skills.map((skill, i) => (
                    <Badge key={i} className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills breakdown */}
            {applicant.missing_skills && applicant.missing_skills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                  <X className="h-3 w-3" /> Missing Skills ({applicant.missing_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {applicant.missing_skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-red-200 text-red-600">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {applicant.applicant_skills && applicant.applicant_skills.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {applicant.applicant_skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {applicant.cover_letter && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Cover Letter
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                {applicant.cover_letter}
              </p>
            </div>
          )}

          {/* Resume */}
          <div>
            <h4 className="font-medium mb-2">Resume</h4>
            <div className="bg-gray-50 p-4 rounded border">
              {applicant.resume_link ? (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadResume}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-center text-gray-400">
                  No resume uploaded by this applicant.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm text-gray-600">
              {applicant.notes || "No notes available for this candidate."}
            </p>
          </div>

        </div>

        <DialogFooter className="flex justify-between">
          <div className="space-x-2">
            <Button
              onClick={handleReject}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleScheduleInterview}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>
          <Button
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
