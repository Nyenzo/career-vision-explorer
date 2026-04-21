import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { profileService } from "@/services/profile.service";
import { ParseResumeResponse } from "@/types/api";
import { toast } from "sonner";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface ResumeAnalysisProps {
  onProfileParsed?: (data: ParseResumeResponse) => void;
  existingResumeUrl?: string | null;
}

const ResumeAnalysis = ({
  onProfileParsed,
  existingResumeUrl,
}: ResumeAnalysisProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ParseResumeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const isValidType =
      ACCEPTED_TYPES.includes(f.type) ||
      (ext !== undefined && ACCEPTED_EXTENSIONS.includes(`.${ext}`));
    if (!isValidType) {
      return "Invalid file type. Please upload a PDF, DOCX, or TXT file.";
    }
    if (f.size === 0) {
      return "File is empty. Please select a valid resume file.";
    }
    if (f.size > MAX_SIZE_BYTES) {
      return "File is too large. Maximum size is 5 MB.";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const err = validateFile(selected);
    if (err) {
      setValidationError(err);
      setFile(null);
      e.target.value = "";
      return;
    }

    setValidationError(null);
    setError(null);
    setResult(null);
    setFile(selected);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await profileService.parseResume(file);
      setResult(response);
      onProfileParsed?.(response);
      toast.success("Profile updated from your CV");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to upload resume. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setValidationError(null);
  };

  const resumeUrl = result?.resume_url || existingResumeUrl;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume / CV Upload</CardTitle>
          <CardDescription>
            Upload your CV to automatically fill in your profile. Accepted
            formats: PDF, DOCX, TXT — max 5 MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current CV link (before upload or when no new result yet) */}
          {resumeUrl && !result && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
            >
              <FileText className="h-4 w-4" />
              View uploaded CV
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {/* Upload area — hidden after a successful parse */}
          {!result && (
            <>
              {!file ? (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Upload your resume
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    PDF, DOCX or TXT up to 5 MB
                  </p>
                  <div className="mt-4">
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => inputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                  </div>
                  {validationError && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {isUploading ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Uploading and parsing your CV…
                      </p>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-[progress-indeterminate_1.5s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleUpload} className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload &amp; Parse CV
                    </Button>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              )}
            </>
          )}

          {/* Success state */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  Profile updated from your CV ✓
                </span>
              </div>

              {result.warning && (
                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Your CV was saved, but we couldn&apos;t auto-fill your
                    profile. You can fill it in manually.
                  </span>
                </div>
              )}

              {result.resume_url && (
                <a
                  href={result.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View uploaded CV
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Upload Another CV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeAnalysis;
