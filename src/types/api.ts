// Complete API types matching FastAPI backend schemas

export interface Job {
  // Current backend fields
  id?: string;
  job_title?: string;
  job_description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  required_skills?: string[];
  location?: string;
  job_type?:
  | "full_time"
  | "part_time"
  | "remote"
  | "internship"
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Remote";
  salary_range?: string;
  experience_level?:
  | "entry_level"
  | "mid_level"
  | "senior_level"
  | "executive_level"
  | "Entry Level"
  | "Mid Level"
  | "Senior Level"
  | "Executive";
  status?: "draft" | "open" | "closed";
  application_deadline?: string;
  company_name?: string;
  employer_id?: string;
  application_count?: number;
  created_at?: string;
  updated_at?: string;

  // Legacy compatibility fields used in older UI modules
  job_id?: string;
  title?: string;
  company?: string;
  posted_by?: string;
  is_active?: boolean;
  posted_by_company?: string;
  skills_required?: string[];
  description?: string;
  remote_friendly?: boolean;
  // Vector match score (cosine similarity, 0-100 scale, null if no embedding)
  match_score?: number | null;
  // Profile information (from view)
  posted_by_name?: string;
  posted_by_email?: string;
  posted_by_account_type?: string;
}

export interface JobCreate {
  // Current backend contract (preferred)
  job_title?: string;
  job_description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  required_skills?: string[];
  location?: string;
  job_type?:
  | "full_time"
  | "part_time"
  | "remote"
  | "internship"
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Remote";
  salary_range?: string;
  experience_level?:
  | "entry_level"
  | "mid_level"
  | "senior_level"
  | "executive_level"
  | "Entry Level"
  | "Mid Level"
  | "Senior Level"
  | "Executive";
  status?: "draft" | "open" | "closed";
  application_deadline?: string;

  // Legacy compatibility fields
  title?: string;
  company?: string;
  skills_required?: string[];
  description?: string;
  remote_friendly?: boolean;
}

export interface JobUpdate {
  // Current backend contract (preferred)
  job_title?: string;
  job_description?: string;
  requirements?: string[] | string;
  responsibilities?: string[];
  benefits?: string[];
  required_skills?: string[];
  job_type?:
  | "full_time"
  | "part_time"
  | "remote"
  | "internship"
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Remote";
  experience_level?:
  | "entry_level"
  | "mid_level"
  | "senior_level"
  | "executive_level"
  | "Entry Level"
  | "Mid Level"
  | "Senior Level"
  | "Executive";
  status?: "draft" | "open" | "closed";
  application_deadline?: string;

  // Legacy compatibility fields
  title?: string;
  company?: string;
  location?: string;
  salary_range?: string;
  is_active?: boolean;
  skills_required?: string[];
  description?: string;
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
  company_logo_url?: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_avatar_url?: string;
  resume_link?: string;
  cv_url?: string;
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
  cv_url?: string;
}

export interface ApplicationUpdate {
  status?: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  notes?: string;
}

export interface Profile {
  id?: string;
  user_id: string;
  name: string;        // normalized from full_name at fetch time
  full_name?: string;  // raw field from users table
  email: string;
  skills: string[];
  resume_link?: string;
  resume_url?: string;
  account_type: "job_seeker" | "employer";
  created_at: string;
  updated_at: string;
  // Enhanced fields
  bio?: string;
  location?: string;
  experience_years?: number;
  education?: Education[];
  phone_number?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  whatsapp_dm?: string;
  stackoverflow_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
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
  | "Freelance"
  | "Hybrid"
  | "Remote";
  work_authorization?: string;
  languages?: string[];
  certifications?: string[];
  work_experience?: WorkExperience[];
  projects?: Project[];
  preferences?: Record<string, any>;
  active_role?: string;
  professional_title?: string;
  profile_completion_percentage?: number;

  // ✅ ADD THESE TOP-LEVEL COMPANY FIELDS:
  company_name?: string;
  industry?: string;
  company_website?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  founded_year?: number;
  company_description?: string;
  company_culture?: string;


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
  description: string;
  start_date?: string;
  end_date?: string;
  currently_working?: boolean;
  /** @deprecated use start_date/end_date/currently_working instead */
  duration?: string;
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
  name?: string;       // kept for internal use; mapped to full_name before API call
  full_name?: string;  // actual API field name
  skills?: string[];
  resume_link?: string;
  bio?: string;
  location?: string;
  experience_years?: number;
  education?: string;
  phone_number?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  stackoverflow_url?: string;
  instagram_url?: string;
  whatsapp_dm?: string;
  portfolio_url?: string;
  avatar_url?: string;
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
  | "Freelance"
  | "Hybrid"
  | "Remote";
  work_authorization?: string;
  languages?: string[];
  certifications?: string[];
  work_experience?: WorkExperience[];
  projects?: Array<{
    name: string;
    description: string;
    tech_stack: string[];
    url?: string;
  }>;
  preferences?: Record<string, any>;
  active_role?: string;
  professional_title?: string;

  // Company-specific fields
  company_name?: string;
  industry?: string;
  company_website?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  founded_year?: number;
  company_description?: string;
  company_culture?: string;


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
