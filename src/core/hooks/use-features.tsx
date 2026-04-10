
import { createContext, useContext, useState, ReactNode } from "react";

export interface FeatureFlags {
  jobMatching: boolean;
  skillsAssessment: boolean;
  microlearning: boolean;
  aiInterviewPractice: boolean;
  careerPaths: boolean;
  jobRecommendations: boolean;
  learningPaths: boolean;
  testimonials: boolean;
  partnerShowcase: boolean;
  blogSection: boolean;
  ctaSection: boolean;
  userRegistration: boolean;
  profileCreation: boolean;
  applicationTracking: boolean;
}

interface FeatureContextType {
  features: FeatureFlags;
  updateFeature: (feature: keyof FeatureFlags, enabled: boolean) => void;
  updateFeatures: (features: Partial<FeatureFlags>) => void;
}

const defaultFeatures: FeatureFlags = {
  jobMatching: true,
  skillsAssessment: true,
  microlearning: true,
  aiInterviewPractice: true,
  careerPaths: true,
  jobRecommendations: true,
  learningPaths: true,
  testimonials: true,
  partnerShowcase: true,
  blogSection: true,
  ctaSection: true,
  userRegistration: true,
  profileCreation: true,
  applicationTracking: true,
};

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider = ({ children }: { children: ReactNode }) => {
  const [features, setFeatures] = useState<FeatureFlags>(defaultFeatures);

  const updateFeature = (feature: keyof FeatureFlags, enabled: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: enabled }));
  };

  const updateFeatures = (newFeatures: Partial<FeatureFlags>) => {
    setFeatures(prev => ({ ...prev, ...newFeatures }));
  };

  return (
    <FeatureContext.Provider value={{ features, updateFeature, updateFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
};
