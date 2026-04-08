
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TypingQuestion } from "./TypingQuestion";
interface VideoIntroductionStepProps {
  videoFile: File | null;
  onVideoUpload: (file: File) => void;
  openVideoRecording: () => void;
  videoAnalyzing: boolean;
  videoAnalysisResult: string | null;
}

export const VideoIntroductionStep = ({ 
  videoFile, 
  onVideoUpload, 
  openVideoRecording, 
  videoAnalyzing, 
  videoAnalysisResult 
}: VideoIntroductionStepProps) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload a video file (MP4, WebM, or QuickTime)"
        });
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Video must be less than 50MB"
        });
        return;
      }
      
      toast.success("Video uploaded", {
        description: "Your video is being processed"
      });
      onVideoUpload(file);
    }
  };

  const handleRecordClick = () => {
    toast("Ready to record", {
      description: "Prepare for your 30-60 second introduction"
    });
    openVideoRecording();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add a video introduction  (Optional)</h3>
      <TypingQuestion
        question="Add a video introduction"
        typingSpeed={25}>
      <h3 className="text-lg font-medium">Add a video introduction (Optional)</h3>
      <p className="text-sm text-gray-500">
        Record a 30-60 second introduction. Our AI will analyze your communication style.
      </p>
      <div className="flex flex-col gap-3">
        <Button onClick={handleRecordClick}>
          <Video className="mr-2 h-4 w-4" />
          Record Video
        </Button>
        <div className="relative">
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            data-testid="video-upload-input"
          />
          <Button variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload Video (Optional)
          </Button>
        </div>
      </div>
      {videoFile && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span>{videoFile.name || "Video recorded successfully"}</span>
        </div>
      )}
      {videoAnalyzing && (
        <div className="text-sm text-gray-500">
          Analyzing your video with AI...
          <Progress value={65} className="mt-2" />
        </div>
      )}
      {videoAnalysisResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <p className="font-medium mb-1">AI Communication Analysis:</p>
          <p>{videoAnalysisResult}</p>
        </div>
      )}
      </TypingQuestion>
    </div>
  );
};
