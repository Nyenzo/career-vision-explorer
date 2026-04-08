
export type WorkPreference = "remote" | "in-person" | "hybrid" | "";
export type SalaryRange = "entry" | "mid" | "senior" | "executive" | "";

export interface OnboardingData {
  // Job seeker fields
  careerGoals: string;
  workPreference: WorkPreference;
  salaryExpectations: SalaryRange;
  location: string;
  skills: string;
  videoIntroduction: File | null;
  desiredSalary?: number;

  // Freelancer
  hourlyRate?: number;
  dailyRate?: number;
  
  // Employer fields
  companyName?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  positions?: string;
  teamSize?: string;
  hiringTimeline?: string;
  culture?: string;
  workArrangement?: string;
  benefits?: string;
  companyLogo?: File | string | null;
}

export interface LinkedInProfile {
  name: string;
  title: string;
  skills: string[];
  education: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
  }[];
}

export interface AssessmentResult {
  id: string;
  type: string;
  score: number;
  completedAt: Date;
  recommendedSkills: string[];
}
