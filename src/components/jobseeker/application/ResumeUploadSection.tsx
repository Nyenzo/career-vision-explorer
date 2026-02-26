
import { Upload, FileText, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { aiService } from "@/services";

interface ResumeUploadSectionProps {
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  cvAlreadyUploaded?: boolean;
  showError?: boolean;
}

export const ResumeUploadSection = ({ resumeFile, setResumeFile, cvAlreadyUploaded, showError }: ResumeUploadSectionProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or Word document");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setResumeFile(file);
      toast.success("Resume uploaded successfully");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-blue-600" />
        <Label htmlFor="resume" className="text-lg font-semibold">Resume/CV</Label>
        {cvAlreadyUploaded && (
          <span className="text-sm text-green-600 font-medium">(Already in profile)</span>
        )}
      </div>
      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        showError && !resumeFile && !cvAlreadyUploaded
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 hover:border-blue-400'
      }`}>
        <Input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="resume" className="cursor-pointer">
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div className="text-sm">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
          </div>
        </label>
      </div>
      {showError && !resumeFile && !cvAlreadyUploaded && (
        <p className="text-sm text-red-600 font-medium">CV is required to apply for this job</p>
      )}
      {resumeFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{resumeFile.name}</span>
            <span className="text-xs text-green-600">
              ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
