// Shared job-related types for consistency across the application

import { Job as APIJob } from './api';

// Extended Job type for UI components with additional fields
export interface JobListing extends APIJob {
  // UI-specific fields
  matchScore: number;
  type: string; // Maps to job_type from API
  salary: string; // Maps to salary_range from API
  posted: string; // Formatted date from created_at
  skills: string[]; // Maps to skills_required from API
  
  // Company information
  companyInfo?: {
    logoUrl?: string;
    industry?: string;
    size?: string;
  };
  
  // Additional UI fields
  remoteFriendly?: boolean;
  applicationDeadline?: string;
  experienceLevel?: string;
}

// Type for job search/filter results
export interface JobSearchResult {
  jobs: JobListing[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Type for job recommendations
export interface JobRecommendation extends JobListing {
  recommendationReason?: string;
  skillMatches?: string[];
  missingSkills?: string[];
}

// Type for saved/wishlist jobs
export interface SavedJob {
  job_id: string;
  savedAt: string;
  notes?: string;
  job?: JobListing;
}

// Helper type guards
export function isJobListing(job: any): job is JobListing {
  return job && typeof job.job_id === 'string' && typeof job.title === 'string';
}

export function hasJobId(obj: any): obj is { job_id: string } {
  return obj && typeof obj.job_id === 'string';
}

// Utility function to transform API Job to JobListing
export function transformJobToListing(apiJob: APIJob): JobListing {
  return {
    ...apiJob,
    matchScore: 0, // To be calculated based on user profile
    type: apiJob.job_type || 'Full-time',
    salary: apiJob.salary_range || 'Not specified',
    posted: formatPostedDate(apiJob.created_at),
    skills: apiJob.skills_required || [],
    // Ensure all fields are properly mapped
    description: apiJob.description || apiJob.requirements || 'No description available',
    benefits: apiJob.benefits || [],
    remoteFriendly: apiJob.remote_friendly || false,
    applicationDeadline: apiJob.application_deadline,
    experienceLevel: apiJob.experience_level || 'Mid Level',
  };
}

// Utility function to format posted date
function formatPostedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
