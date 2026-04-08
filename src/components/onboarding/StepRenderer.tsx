
import { CareerGoalsStep } from "./steps/CareerGoalsStep";
import { WorkPreferenceStep } from "./steps/WorkPreferenceStep";
import { SalaryExpectationsStep } from "./steps/SalaryExpectationsStep";
import { LocationStep } from "./steps/LocationStep";
import { VideoIntroductionStep } from "./steps/VideoIntroductionStep";
import { ProfileSummaryStep } from "./steps/ProfileSummaryStep";
import { LinkedInImportStep } from "./steps/LinkedInImportStep";
import { OnboardingData } from "./types";

interface StepRendererProps {
  currentStep: number;
  data: OnboardingData;
  updateField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  handleLinkedInImport: (data: any) => void;
  handleNext: () => void;
  handleVideoUpload: (file: File) => void;
  openVideoRecording: () => void;
  videoAnalyzing: boolean;
  videoAnalysisResult: string | null;
}

export const StepRenderer = ({
  currentStep,
  data,
  updateField,
  handleLinkedInImport,
  handleNext,
  handleVideoUpload,
  openVideoRecording,
  videoAnalyzing,
  videoAnalysisResult
}: StepRendererProps) => {

  switch (currentStep) {
    case 0:
      return (
        <LinkedInImportStep 
          onImport={handleLinkedInImport}
          onSkip={handleNext}
        />
      );
    
    case 1:
      return (
        <CareerGoalsStep 
          value={data.careerGoals} 
          onChange={(value) => updateField("careerGoals", value)} 
        />
      );
    
    case 2:
      return (
        <WorkPreferenceStep 
          value={data.workPreference} 
          onChange={(value) => updateField("workPreference", value)} 
        />
      );
    
    case 3:
      return (
   
        <>
       
         <SalaryExpectationsStep 
            value={data.salaryExpectations} 
            onChange={(value) => updateField("salaryExpectations", value)} 
          />
          <div className="mt-4">
            <label className="block text-sm font-medium">Desired Salary (Optional)</label>
            <input
              type="number"
              placeholder="e.g., 60000"
              className="mt-1 block w-full border rounded-md px-3 py-2"
              value={data.desiredSalary || ""}
              onChange={(e) => updateField("desiredSalary", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          </>
      );
    
    case 4:
      return (
        <LocationStep 
          value={data.location} 
          onChange={(value) => updateField("location", value)} 
        />
      );
    
    case 5:
      return (
        <VideoIntroductionStep 
          videoFile={data.videoIntroduction}
          onVideoUpload={handleVideoUpload}
          openVideoRecording={openVideoRecording}
          videoAnalyzing={videoAnalyzing}
          videoAnalysisResult={videoAnalysisResult}
        />
      );
    
    case 6:
      return <ProfileSummaryStep data={data} />;
    
    default:
      return null;
  }
};
