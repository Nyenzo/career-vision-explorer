
import React from "react";
import { useNavigate } from "react-router-dom";
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
import { ThumbsUp, ThumbsDown, Download, Mail, FileText, Briefcase, Check, X, Eye, Loader2, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { EmployerApplication } from "@/hooks/use-employer-applications";
import { API_CONFIG } from "@/config/api.config";
import { authStorage } from "@/lib/session-auth-storage";

interface ApplicantProfileDialogProps {
  applicant: EmployerApplication;
  onStatusChange: (id: string, status: 'Reviewed' | 'Accepted' | 'Rejected', notes?: string) => void;
  children: React.ReactNode;
}

export function ApplicantProfileDialog({
  applicant,
  onStatusChange,
  children
}: ApplicantProfileDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = React.useState<string | null>(null);
  const [pdfViewerLoading, setPdfViewerLoading] = React.useState(false);
  const navigate = useNavigate();

  const closePdfViewer = React.useCallback(() => {
    if (pdfViewerUrl) URL.revokeObjectURL(pdfViewerUrl);
    setPdfViewerUrl(null);
  }, [pdfViewerUrl]);

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

  const matchScore = applicant.match_score || 0;

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleDownloadResume = async () => {
    const directUrl = applicant.cv_url || applicant.resume_link;
    if (!directUrl) {
      toast.error("No resume available for this applicant.");
      return;
    }

    // If user_id is available, use the backend proxy; otherwise open URL directly
    if (applicant.user_id) {
      try {
        const token = authStorage.getAccessToken();
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
          throw new Error(`Download failed (${response.status})`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.match(/filename=(.+)/)?.[1] || 'resume.pdf';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Resume downloaded successfully!");
        return;
      } catch {
        // Fall through to direct URL open
      }
    }

    // Fallback: open the CV URL directly
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    toast.success("Resume opened in new tab.");
  };

  const handleViewResume = async () => {
    const directUrl = applicant.cv_url || applicant.resume_link;
    if (!directUrl) {
      toast.error("No resume available for this applicant.");
      return;
    }

    if (applicant.user_id) {
      setPdfViewerLoading(true);
      try {
        const token = authStorage.getAccessToken();
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/applications/resume/download?user_id=${applicant.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) throw new Error(`${response.status}`);
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const blob = await response.blob();
        const typedBlob = new Blob([blob], { type: contentType });
        const url = URL.createObjectURL(typedBlob);

        if (contentType.includes('pdf')) {
          setPdfViewerUrl(url);
        } else {
          // Non-PDF (e.g. DOCX) — browsers can't render these inline; trigger download
          const ext = contentType.includes('wordprocessingml') ? '.docx'
            : contentType.includes('plain') ? '.txt' : '';
          const filename = `${applicant.applicantInfo.name.replace(/\s+/g, '_')}_resume${ext}`;
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 5_000);
          toast.info("DOCX files can't be previewed in-browser — downloaded for you to open.");
        }
      } catch {
        toast.error("Could not load resume. Try downloading it instead.");
      } finally {
        setPdfViewerLoading(false);
      }
      return;
    }

    // Fallback: no user_id — open direct storage URL
    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
            <DialogDescription>
              Review application details for {applicant.applicantInfo.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-1">
            {/* Applicant Info & Match Score */}
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                {applicant.applicantInfo.avatar_url ? (
                  <img
                    src={applicant.applicantInfo.avatar_url}
                    alt={applicant.applicantInfo.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-base shrink-0">
                    {applicant.applicantInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
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
                {(applicant.cv_url || applicant.resume_link) ? (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewResume}
                      disabled={pdfViewerLoading}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    >
                      {pdfViewerLoading
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        : <Eye className="h-4 w-4 mr-2" />}
                      View Resume
                    </Button>
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
                variant="outline"
                size="sm"
                onClick={() => { navigate(`/profile/${applicant.user_id}`); setOpen(false); }}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                disabled={!applicant.user_id}
              >
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button
                onClick={handleReject}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject
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

      {/* PDF Viewer — shown inside a full-height dialog so the iframe renders
          inline regardless of the browser's top-level PDF download settings */}
      <Dialog open={!!pdfViewerUrl} onOpenChange={(isOpen) => { if (!isOpen) closePdfViewer(); }}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle>Resume — {applicant.applicantInfo.name}</DialogTitle>
            <DialogDescription className="sr-only">PDF viewer</DialogDescription>
          </DialogHeader>
          {pdfViewerUrl && (
            <iframe
              src={pdfViewerUrl}
              title={`Resume for ${applicant.applicantInfo.name}`}
              className="flex-1 w-full border-0 rounded-b-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
