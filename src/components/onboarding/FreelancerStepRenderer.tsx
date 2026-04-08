import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, DollarSign, Globe, Target, PenTool, Camera, Upload } from "lucide-react";
import { TypingQuestion } from "./steps/TypingQuestion";

interface FreelancerStepRendererProps {
  currentStep: number;
  data: any;
  updateField: (field: string, value: any) => void;
  handleNext: () => void;
  handleVideoUpload: (file: File) => void;
  openVideoRecording: () => void;
  videoAnalyzing: boolean;
  videoAnalysisResult: string | null;
}

export const FreelancerStepRenderer = ({
  currentStep,
  data,
  updateField,
  handleNext,
  handleVideoUpload,
  openVideoRecording,
  videoAnalyzing,
  videoAnalysisResult
}: FreelancerStepRendererProps) => {
  const steps = [
    // Step 0: Service Overview
    () => (
      <TypingQuestion 
        question="What services do you offer?"
        icon={<Briefcase className="w-8 h-8 text-blue-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Professional Title</Label>
          <Input
            placeholder="e.g., UI/UX Designer, Full Stack Developer, Content Writer"
            value={data.professionalTitle || ""}
            onChange={(e) => updateField("professionalTitle", e.target.value)}
          />
          <Label>Service Description</Label>
          <Textarea
            placeholder="Describe the services you offer and your expertise..."
            value={data.serviceDescription || ""}
            onChange={(e) => updateField("serviceDescription", e.target.value)}
            rows={4}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 1: Experience & Skills
    () => (
      <TypingQuestion 
        question="Share your experience and skills"
        icon={<PenTool className="w-8 h-8 text-green-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Years of Experience</Label>
          <RadioGroup value={data.experienceYears || ""} onValueChange={(value) => updateField("experienceYears", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0-2" id="exp1" />
              <Label htmlFor="exp1">0-2 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3-5" id="exp2" />
              <Label htmlFor="exp2">3-5 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5-10" id="exp3" />
              <Label htmlFor="exp3">5-10 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10+" id="exp4" />
              <Label htmlFor="exp4">10+ years</Label>
            </div>
          </RadioGroup>
          
          <Label className="mt-4">Core Skills (comma separated)</Label>
          <Textarea
            placeholder="e.g., React, Node.js, MongoDB, UI Design, Figma"
            value={data.skills || ""}
            onChange={(e) => updateField("skills", e.target.value)}
            rows={3}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 2: Pricing & Availability
    () => (
      <TypingQuestion 
        question="What are your rates and availability?"
        icon={<DollarSign className="w-8 h-8 text-yellow-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Hourly Rate (USD)</Label>
          <Input
            type="number"
            placeholder="e.g., 50"
            value={data.hourlyRate || ""}
            onChange={(e) => updateField("hourlyRate", e.target.value)}
          />
          
             <Label>Daily Rate (USD) (Optional)</Label>
          <Input
            type="number"
            placeholder="e.g., 400"
            value={data.dailyRate || ""}
            onChange={(e) => updateField("dailyRate", e.target.value)}
          />
          <Label className="mt-4">Availability</Label>
          <RadioGroup value={data.availability || "full-time"} onValueChange={(value) => updateField("availability", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full-time" id="avail1" />
              <Label htmlFor="avail1">Full-time (40+ hours/week)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="part-time" id="avail2" />
              <Label htmlFor="avail2">Part-time (20-40 hours/week)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="avail3" />
              <Label htmlFor="avail3">Hourly (Less than 20 hours/week)</Label>
            </div>
          </RadioGroup>
        </div>
      </TypingQuestion>
    ),
    // Step 3: Work Preferences
    () => (
      <TypingQuestion 
        question="What are your work preferences?"
        icon={<Globe className="w-8 h-8 text-purple-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Preferred Work Arrangement</Label>
          <RadioGroup value={data.workPreference || "remote"} onValueChange={(value) => updateField("workPreference", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="work1" />
              <Label htmlFor="work1">Remote Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="work2" />
              <Label htmlFor="work2">Hybrid (Remote + On-site)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onsite" id="work3" />
              <Label htmlFor="work3">On-site preferred</Label>
            </div>
          </RadioGroup>
          
          <Label className="mt-4">Preferred Project Length</Label>
          <RadioGroup value={data.projectLength || ""} onValueChange={(value) => updateField("projectLength", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id="proj1" />
              <Label htmlFor="proj1">Short-term (Less than 1 month)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="proj2" />
              <Label htmlFor="proj2">Medium-term (1-3 months)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="long" id="proj3" />
              <Label htmlFor="proj3">Long-term (3+ months)</Label>
            </div>
          </RadioGroup>
        </div>
      </TypingQuestion>
    ),
    // Step 4: Portfolio
    () => (
      <TypingQuestion 
        question="Tell us about your portfolio"
        icon={<Target className="w-8 h-8 text-red-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>Portfolio Website (Optional)</Label>
          <Input
            type="url"
            placeholder="https://yourportfolio.com"
            value={data.portfolioUrl || ""}
            onChange={(e) => updateField("portfolioUrl", e.target.value)}
          />
          
          <Label className="mt-4">LinkedIn Profile (Optional)</Label>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={data.linkedinUrl || ""}
            onChange={(e) => updateField("linkedinUrl", e.target.value)}
          />
          
          <Label className="mt-4">Brief description of your best work</Label>
          <Textarea
            placeholder="Describe 1-2 projects you're most proud of..."
            value={data.bestWork || ""}
            onChange={(e) => updateField("bestWork", e.target.value)}
            rows={4}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 5: Location
    () => (
      <TypingQuestion 
        question="Where are you based?"
        icon={<Globe className="w-8 h-8 text-indigo-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <Label>City, Country</Label>
          <Input
            placeholder="e.g., San Francisco, USA"
            value={data.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
          />
          
          <Label className="mt-4">Languages you speak</Label>
          <Input
            placeholder="e.g., English, Spanish, Mandarin"
            value={data.languages || ""}
            onChange={(e) => updateField("languages", e.target.value)}
          />
        </div>
      </TypingQuestion>
    ),
    // Step 6: Video Introduction
    () => (
      <TypingQuestion 
        question="Would you like to create a video introduction?"
        icon={<Camera className="w-8 h-8 text-pink-500" />}
        typingSpeed={30}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            A video introduction helps clients get to know you better and can increase your chances of getting hired.
          </p>
          
          {!data.videoIntroduction && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={openVideoRecording}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Record Video
              </Button>
              <Button variant="outline" asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file);
                    }}
                  />
                </label>
              </Button>
            </div>
          )}
          
          {videoAnalyzing && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Analyzing your video...</p>
            </div>
          )}
          
          {videoAnalysisResult && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <p className="text-sm text-green-800">{videoAnalysisResult}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {data.videoIntroduction && !videoAnalyzing && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-blue-500 mb-2">✓</div>
                  <p className="text-blue-800 font-medium">Video uploaded successfully!</p>
                  <Button 
                    variant="link" 
                    onClick={() => updateField("videoIntroduction", null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Upload a different video
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button
            className="w-full mt-4"
            variant={data.videoIntroduction ? "default" : "outline"}
            onClick={handleNext}
          >
            {data.videoIntroduction ? "Continue" : "Skip for now"}
          </Button>
        </div>
      </TypingQuestion>
    )
  ];

  const StepComponent = steps[currentStep];
  
  if (!StepComponent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <StepComponent />
    </div>
  );
};