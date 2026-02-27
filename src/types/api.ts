// Complete API types matching FastAPI backend schemas

export interface Job {
  job_id: string;
  title: string;
  company: string;
  requirements: string;
  location: string;
  salary_range?: string;
  posted_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  application_count?: number;
  posted_by_company?: string;
  // Enhanced fields
  job_type?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  experience_level?: "Entry Level" | "Mid Level" | "Senior Level" | "Executive";
  skills_required?: string[];
  description?: string;
  benefits?: string[];
  application_deadline?: string;
  remote_friendly?: boolean;
  // Profile information (from view)
  posted_by_name?: string;
  posted_by_email?: string;
  posted_by_account_type?: string;
}

export interface JobCreate {
  title: string;
  company: string;
  requirements: string[];
  location: string;
  salary_range?: string;
  job_type?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  experience_level?: "Entry Level" | "Mid Level" | "Senior Level" | "Executive";
  skills_required?: string[];
  description?: string;
  benefits?: string[];
  application_deadline?: string;
  remote_friendly?: boolean;
}

export interface JobUpdate {
  title?: string;
  company?: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  is_active?: boolean;
  job_type?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  experience_level?: "Entry Level" | "Mid Level" | "Senior Level" | "Executive";
  skills_required?: string[];
  description?: string;
  benefits?: string[];
  application_deadline?: string;
  remote_friendly?: boolean;
}

export interface Application {
  application_id: string;
  user_id: string;
  job_id: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  applied_at: string;
  cover_letter?: string;
  notes?: string;
  // Additional fields from backend joins
  job_title?: string;
  company_name?: string;
  applicant_name?: string;
  applicant_email?: string;
  resume_link?: string;
  match_score?: number;
  applicant_skills?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  // Compatibility field for components expecting job object
  job?: {
    title: string;
    company: string;
  };
  // Compatibility field for created_at
  created_at: string;
}

export interface ApplicationCreate {
  job_id: string;
  cover_letter?: string;
}

export interface ApplicationUpdate {
  status?: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  notes?: string;
}

export interface Profile {
  id?: string; // ✅ ADD THIS - can be optional since user_id is primary
  user_id: string;
  name: string;
  email: string;
  skills: string[];
  resume_link?: string;
  account_type: "job_seeker" | "employer" | "admin" | "freelancer";
  created_at: string;
  updated_at: string;
  // Enhanced fields
  bio?: string;
  location?: string;
  experience_years?: number;
  education?: Education[]; // ✅ FIXED: Should be array of objects
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  whatsapp_dm?: string;
  stackoverflow_url?: string;
  portfolio_url?: string;
  profile_image_url?: string;
  video_intro_url?: string;
  date_of_birth?: string;
  salary_expectation?: string;
  availability?:
  | "Available"
  | "Not Available"
  | "Available in 2 weeks"
  | "Available in 1 month";
  preferred_job_type?:
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Remote";
  work_authorization?: string;
  languages?: string[];
  certifications?: string[];
  work_experience?: WorkExperience[];
  projects?: Project[];
  preferences?: Record<string, any>;
  active_role?: string;
  profile_completion_percentage?: number;

  // ✅ ADD THESE TOP-LEVEL COMPANY FIELDS:
  company_name?: string;
  industry?: string;
  company_website?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  founded_year?: number;
  company_description?: string;
  company_culture?: string;

  // Freelancer-specific fields (only present when account_type is 'freelancer')
  freelancer_data?: {
    freelancer_id: string;
    title: string;
    hourly_rate?: number;
    available_for_hire: boolean;
    rating: number;
    total_reviews: number;
    total_projects: number;
    last_active?: string;
    portfolio_items?: Array<{
      id: string;
      title: string;
      description: string;
      image_url: string;
      project_url?: string;
      tags: string[];
      created_at: string;
    }>;
    pricing?: {
      basic_package?: {
        name: string;
        price: number;
        description: string;
        features: string[];
        delivery_days: number;
        revisions: number;
      };
      standard_package?: {
        name: string;
        price: number;
        description: string;
        features: string[];
        delivery_days: number;
        revisions: number;
      };
      premium_package?: {
        name: string;
        price: number;
        description: string;
        features: string[];
        delivery_days: number;
        revisions: number;
      };
    };
  };

  // Company-specific nested object
  company_data?: CompanyData;
}

// ✅ ADD SUPPORTING INTERFACES
export interface Education {
  institution: string;
  degree: string;
  start_year: number;
  end_year: number;
  field_of_study?: string;
  gpa?: number;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
}

export interface Project {
  name: string;
  description: string;
  tech_stack: string[];
  url?: string;
  start_date?: string;
  end_date?: string;
}

export interface CompanyData {
  company_name?: string;
  company_website?: string;
  industry?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  founded_year?: number;
  company_description?: string;
  company_culture?: string;
  company_logo_url?: string;
  cover_image_url?: string;
  contact_email?: string;
  contact_phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  glassdoor_url?: string;
  benefits?: Benefit[];
  tech_stack?: string[];
  offices?: Office[];
  preferred_skills?: string[];
  hiring_process?: string;
  remote_work_policy?: "No Remote" | "Hybrid" | "Fully Remote" | "Flexible";
  is_verified?: boolean;
  verification_date?: string | null;
}

export interface Benefit {
  name: string;
  description?: string;
  icon?: string;
}

export interface Office {
  address: string;
  city: string;
  state_province?: string;
  country: string;
  postal_code?: string;
  is_headquarters: boolean;
}

export interface ProfileUpdate {
  name?: string;
  skills?: string[];
  resume_link?: string;
  bio?: string;
  location?: string;
  experience_years?: number;
  education?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  stackoverflow_url?: string;
  instagram_url?: string;
  whatsapp_dm?: string;
  portfolio_url?: string;
  profile_image_url?: string;
  video_intro_url?: string;
  date_of_birth?: string;
  salary_expectation?: string;
  availability?:
  | "Available"
  | "Not Available"
  | "Available in 2 weeks"
  | "Available in 1 month";
  preferred_job_type?:
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Remote";
  work_authorization?: string;
  languages?: string[];
  certifications?: string[];
  work_experience?: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    tech_stack: string[];
    url?: string;
  }>;
  preferences?: Record<string, any>;
  active_role?: string;

  // Company-specific fields
  company_name?: string;
  industry?: string;
  company_website?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  founded_year?: number;
  company_description?: string;
  company_culture?: string;

  // Freelancer-specific fields
  freelancer_data?: {
    title?: string;
    hourly_rate?: number;
    available_for_hire?: boolean;
    portfolio_items?: Array<{
      title: string;
      description: string;
      image_url: string;
      project_url?: string;
      tags: string[];
    }>;
    pricing?: {
      basic_package?: {
        name: string;
        price: number;
        description: string;
        features: string[];
        delivery_days: number;
        revisions: number;
      };
      standard_package?: {
        name: string;
        price: number;
        description: string;
        features: string[];
        delivery_days: number;
        revisions: number;
      };
      premium_package?: {
        name: string;
        price: number;
        description: string;
        features: string[];
        delivery_days: number;
        revisions: number;
      };
    };
  };

  // Company-specific nested object
  company_data?: {
    company_name?: string;
    company_website?: string;
    industry?: string;
    company_size?:
    | "1-10"
    | "11-50"
    | "51-200"
    | "201-500"
    | "501-1000"
    | "1000+";
    founded_year?: number;
    company_description?: string;
    company_culture?: string;
    company_logo_url?: string;
    cover_image_url?: string;
    contact_email?: string;
    contact_phone?: string;
    linkedin_url?: string;
    twitter_url?: string;
    facebook_url?: string;
    glassdoor_url?: string;
    benefits?: Array<{
      name: string;
      description?: string;
      icon?: string;
    }>;
    tech_stack?: string[];
    offices?: Array<{
      address: string;
      city: string;
      state_province?: string;
      country: string;
      postal_code?: string;
      is_headquarters: boolean;
    }>;
    preferred_skills?: string[];
    hiring_process?: string;
    remote_work_policy?: "No Remote" | "Hybrid" | "Fully Remote" | "Flexible";
  };
}

export interface Skill {
  skill_id: string;
  name: string;
  category: string;
  associated_jobs: string[];
  demand_level: "High" | "Medium" | "Low";
  created_at: string;
  updated_at: string;
}

export interface SkillCreate {
  name: string;
  category: string;
  demand_level: "High" | "Medium" | "Low";
  associated_jobs?: string[];
}

export interface Recommendation {
  recommendation_id: string;
  user_id: string;
  suggested_skill: string;
  rationale: string;
  is_read: boolean;
  created_at: string;
}

export interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  difficulty: "easy" | "medium" | "hard";
}

export interface InterviewResponse {
  questions: InterviewQuestion[];
  session_id: string;
}

export interface SkillAssessment {
  skill_name: string;
  questions: string[];
  answers: number[];
}

export interface SkillAssessmentResult {
  skill_name: string;
  score: number;
  level: string;
  recommendations: string[];
}

export interface AIAnalysisRequest {
  resume_text?: string;
  job_description?: string;
  user_skills?: string[];
}

export interface AIAnalysisResponse {
  analysis: string;
  recommendations: string[];
  skill_gaps: string[];
  match_score?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  jobs: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  detail: string;
  status_code: number;
  type?: string;
}
