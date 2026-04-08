import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VideoRecordingModal } from "./VideoRecordingModal";
const AIAssistant = lazy(() => import("./AIAssistant").then(module => ({ default: module.AIAssistant })));
import { submitOnboardingData } from "@/services/onboarding.service";
import { ProgressIndicator } from "./ProgressIndicator";
import { StepNavigation } from "./StepNavigation";
import { StepRenderer } from "./StepRenderer";
import { FreelancerStepRenderer } from "./FreelancerStepRenderer";
import { EmployerStepRenderer } from "./EmployerStepRenderer";
import { OnboardingData } from "./types";

interface OnboardingWizardProps {
  onComplete: () => void;
  userRole?: 'jobseeker' | 'employer' | 'freelancer';
  signupData?: any; // Data from signup form including role-specific fields
}

const OnboardingWizard = ({ onComplete, userRole = 'jobseeker', signupData }: OnboardingWizardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    careerGoals: "",
    workPreference: "remote",
    salaryExpectations: "entry",
    location: "",
    skills: "",
    videoIntroduction: null,
  });
  const [videoRecordingOpen, setVideoRecordingOpen] = useState(false);
  const [videoAnalyzing, setVideoAnalyzing] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);
const [aiResponses, setAiResponses] = useState<string[]>([
    userRole === 'freelancer' 
      ? "Welcome to Visiondrill! I'm here to help you set up your freelancer profile. Let's showcase your skills and services to connect with potential clients."
      : userRole === 'employer'
      ? "Welcome to Visiondrill! I'm here to help you set up your company profile and find the best talent for your team. Let's start by gathering information about your company."
      : "Hello Welcome to Visiondrill! I'm here to help you set up your profile and find the perfect career opportunities. "
  ]);
  
  // Different user types have different number of steps
  const totalSteps = userRole === 'employer' ? 6 : userRole === 'freelancer' ? 6 : 5;
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;
  
  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
    
  const simulateAiResponse = () => {
  const freelancerResponses = [
   // "Tell me about your services and expertise. This will help potential clients understand what you offer.",
    "Great! Your experience and skills are valuable. Let's make sure clients can find you based on your expertise.",
    "Next up—how do you usually charge for your work? Setting your rates helps us connect you with clients who value your skills.",
    "Got it. Do you prefer short-term gigs, long-term projects, or both? This will guide the kind of projects we match you with.",
    "Great 👍. Do you have a portfolio or past work you’d like to showcase? It’s one of the best ways to stand out to clients.",
    "Almost there! Where are you based, and do you speak other languages? This can help you attract both local and international clients.",
    "Fantastic 🎉. Your freelancer profile is now complete and ready to attract projects that match your expertise."
  ];

    const jobSeekerResponses = [
    // "Hello 👋. To make things easier, would you like to import your LinkedIn profile? This helps us quickly match you with roles that fit your experience. Or, you can start fresh and build your profile from scratch—it’s totally up to you.",
      "Great! What are your career goals? Knowing this helps us understand what you’re aiming for and connect you with the right jobs and employers.",
      "Nice. What’s your preferred work style—remote, hybrid, or on-site? This way, we’ll filter and show you opportunities that fit your workstyle.",
      "Got it 👍. What’s your expected salary range? We’ll use this to make sure you see roles that align with your expectations.",
      "Perfect. Where are you located cities, regions, or are you open to relocation? This helps us focus on the right locations.",
    //  "Almost done 🙌. What skills would you like to highlight? Employers love knowing what you’re strongest at from the start.",
      "All set 🎉! Your profile is ready, and from what you’ve shared, we can already start matching you with career opportunities that fit your goals."
    ];

  const employerResponses = [
   // "Welcome! First, what’s the name of your company? We’ll use this to set up your company profile.",
    "Great. What roles are you currently hiring for? This helps us connect you with the most relevant candidates.",
    "Good to know. Can you describe your company culture or values? This helps us recommend candidates who align with your ethos.",
    "Now, what type of work arrangement are you offering—remote, hybrid, or on-site? Candidates want to know how they’ll work with you.",
    "Perfect. What benefits or perks does your company provide? Highlighting these makes your job posts stand out.",
    "Last step 🎉—can you upload your company logo? It gives your postings a professional, branded look."
  ];

  const responses =
    userRole === "freelancer"
      ? freelancerResponses
      : userRole === "employer"
      ? employerResponses
      : jobSeekerResponses;

  if (currentStep < responses.length) {
    // optional: add typing delay for realism
    setTimeout(() => {
      setAiResponses((prev) => [...prev, responses[currentStep]]);
    }, 400); // 0.8s delay feels natural
  }
};
  
  const handleNext = () => {
    simulateAiResponse();
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleComplete = () => {
    const completionMessages = {
      employer: {
        title: "Company Profile Created Successfully!",
        description: "Your company profile is ready. Start posting jobs to find the best talent!",
        redirect: "/employer/dashboard"
      },
      freelancer: {
        title: "Freelancer Profile Created Successfully!",
        description: "Your profile is ready. Start browsing projects and connecting with clients!",
        redirect: "/freelancer/dashboard"
      },
      jobseeker: {
        title: "Profile Created Successfully!",
        description: "Your profile is ready. Let's explore career opportunities!",
        redirect: "/jobs"
      }
    };
    
    const message = completionMessages[userRole] || completionMessages.jobseeker;
    
    // Add API call here to submit onboarding data
    submitOnboardingData(data, signupData, userRole).then(() => {
      toast({
        title: message.title,
        description: message.description,
      });
      onComplete();
      navigate(message.redirect);
    }).catch(error => {
      console.error('Onboarding error:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "Could not complete onboarding, please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error.response?.status === 400) {
        errorMessage = "Some of the information provided is invalid. Please check your inputs.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (error.message?.includes('network')) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    });
  };
  
  const handleVideoUpload = (file: File) => {
    updateField("videoIntroduction", file);
    analyzeVideo(file);
  };
  
  const saveRecording = () => {
    // In a real app, this would save the recorded video blob
    const mockFile = new File([""], "video-intro.mp4", { type: "video/mp4" });
    updateField("videoIntroduction", mockFile);
    analyzeVideo(mockFile);
  };
  
  const analyzeVideo = (videoFile: File) => {
    setVideoAnalyzing(true);
    
    // This simulates AI analysis of the video
    setTimeout(() => {
      setVideoAnalyzing(false);
      setVideoAnalysisResult(
        "Our AI analysis indicates strong communication skills, clear articulation, and excellent eye contact. Your enthusiasm comes across very well, which is a significant advantage for client-facing roles and team collaboration."
      );
    }, 2000);
  };
  
  const handleLinkedInImport = (data: any) => {
    toast({
      title: "LinkedIn Profile Imported",
      description: "Your profile information has been successfully imported.",
    });
    // In a real app, this would populate the form with LinkedIn data
    setCurrentStep(1); // Move to career goals after import
  };
  
  return (
    <>
      <Dialog open={true}>
        <DialogContent className="max-w-xl space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              {userRole === 'employer' 
                ? "Let's set up your company profile to attract the best talent."
                : userRole === 'freelancer'
                ? "Let's create your freelancer profile to connect with potential clients."
                : "Let's set up your profile so we can find the perfect opportunities for you."}
            </DialogDescription>
          </DialogHeader>
          
          <ProgressIndicator progress={progress} />
          
          
          <AIAssistant message={aiResponses[aiResponses.length - 1]} />

 
          
          <div className="mb-6 space-y-4">
{userRole === 'freelancer' ? (
              <FreelancerStepRenderer
                currentStep={currentStep}
                data={data}
                updateField={updateField}
                handleNext={handleNext}
                handleVideoUpload={handleVideoUpload}
                openVideoRecording={() => setVideoRecordingOpen(true)}
                videoAnalyzing={videoAnalyzing}
                videoAnalysisResult={videoAnalysisResult}
              />
            ) : userRole === 'employer' ? (
              <EmployerStepRenderer
                currentStep={currentStep}
                data={data}
                updateField={updateField}
                handleNext={handleNext}
                handleLogoUpload={(file) => updateField("companyLogo", file)}
              />
            ) : (
              <StepRenderer
                currentStep={currentStep}
                data={data}
                updateField={updateField}
                handleLinkedInImport={handleLinkedInImport}
                handleNext={handleNext}
                handleVideoUpload={handleVideoUpload}
                openVideoRecording={() => setVideoRecordingOpen(true)}
                videoAnalyzing={videoAnalyzing}
                videoAnalysisResult={videoAnalysisResult}
              />
            )}
          </div>
          
          <DialogFooter>
            <StepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <VideoRecordingModal 
        isOpen={videoRecordingOpen}
        onClose={() => setVideoRecordingOpen(false)}
        onSave={saveRecording}
      />
    </>
  );
};

export default OnboardingWizard;