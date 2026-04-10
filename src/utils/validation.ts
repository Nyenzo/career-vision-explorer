import * as z from "zod";

// Common validation schemas
export const commonProfileSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  location: z.string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  bio: z.string()
    .max(2000, "Bio must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
});

// Job seeker specific validation
export const jobSeekerProfileSchema = commonProfileSchema.extend({
  skills: z.array(z.string()).min(1, "Please add at least one skill"),
  experience_years: z.number()
    .min(0, "Experience years cannot be negative")
    .max(50, "Experience years must be less than 50")
    .optional(),
  education: z.string()
    .min(2, "Education must be at least 2 characters")
    .max(500, "Education must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  resume_link: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  linkedin_url: z.string()
    .url("Please enter a valid LinkedIn URL")
    .regex(/linkedin\.com/, "Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  github_url: z.string()
    .url("Please enter a valid GitHub URL")
    .regex(/github\.com/, "Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  portfolio_url: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  availability: z.enum(['Available', 'Not Available', 'Available in 2 weeks', 'Available in 1 month'])
    .optional(),
  preferred_job_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .optional(),
  salary_expectation: z.string()
    .max(100, "Salary expectation must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  work_experience: z.array(z.object({
    company: z.string().min(1, "Company name is required"),
    position: z.string().min(1, "Position is required"),
    duration: z.string().min(1, "Duration is required"),
    description: z.string().min(1, "Description is required"),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Project description is required"),
    tech_stack: z.array(z.string()).min(1, "At least one technology is required"),
    url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  })).optional(),
});

// Employer specific validation
export const employerProfileSchema = commonProfileSchema.extend({
  company_name: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters"),
  company_website: z.string()
    .url("Please enter a valid company website URL")
    .optional()
    .or(z.literal("")),
  industry: z.string()
    .min(2, "Industry must be at least 2 characters")
    .max(100, "Industry must not exceed 100 characters"),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
});

// Freelancer specific validation
export const freelancerProfileSchema = jobSeekerProfileSchema.extend({
  hourly_rate: z.number()
    .min(1, "Hourly rate must be at least $1")
    .max(1000, "Hourly rate must be reasonable")
    .optional(),
  availability_hours: z.number()
    .min(1, "Availability must be at least 1 hour per week")
    .max(168, "Availability cannot exceed 168 hours per week")
    .optional(),
  service_categories: z.array(z.string())
    .min(1, "Please select at least one service category")
    .optional(),
});

// File validation utilities
export const validateImageFile = (file: File): string | null => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) return "Please select a file";
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please upload a valid image file (JPEG, PNG, or WebP)";
  }
  
  if (file.size > MAX_SIZE) {
    return "Image size must be less than 5MB";
  }
  
  return null;
};

export const validateResumeFile = (file: File): string | null => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!file) return "Please select a file";
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please upload a valid document file (PDF, DOC, or DOCX)";
  }
  
  if (file.size > MAX_SIZE) {
    return "Document size must be less than 10MB";
  }
  
  return null;
};

// Get validation schema based on account type
export const getProfileValidationSchema = (accountType: string) => {
  switch (accountType) {
    case 'employer':
      return employerProfileSchema;
    case 'freelancer':
      return freelancerProfileSchema;
    case 'job_seeker':
    default:
      return jobSeekerProfileSchema;
  }
};

// Get required fields based on account type
export const getRequiredFields = (accountType: string): string[] => {
  const commonRequired = ['name', 'email'];
  
  switch (accountType) {
    case 'employer':
      return [...commonRequired, 'company_name', 'industry', 'company_size'];
    case 'freelancer':
      return [...commonRequired, 'skills', 'service_categories'];
    case 'job_seeker':
    default:
      return [...commonRequired, 'skills'];
  }
};

// Validate specific field
export const validateField = (fieldName: string, value: any, accountType: string): string | null => {
  try {
    const schema = getProfileValidationSchema(accountType);
    const fieldSchema = schema.shape[fieldName];
    
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid value";
    }
    return "Validation error";
  }
};

// Profile completion calculator
export const calculateProfileCompletion = (profile: any, accountType: string): number => {
  let filledFields = 0;
  let totalFields = 0;
  
  // Common fields
  const commonFields = ['name', 'email', 'phone', 'location', 'bio', 'profile_image_url'];
  
  // Role-specific fields
  const roleFields = {
    job_seeker: [
      'skills', 'experience_years', 'education', 'resume_link',
      'linkedin_url', 'github_url', 'portfolio_url', 'availability',
      'preferred_job_type', 'salary_expectation', 'languages',
      'certifications', 'work_experience', 'projects'
    ],
    employer: [
      'company_name', 'company_website', 'industry', 'company_size'
    ],
    freelancer: [
      'skills', 'experience_years', 'education', 'resume_link',
      'linkedin_url', 'github_url', 'portfolio_url', 'hourly_rate',
      'availability_hours', 'service_categories', 'work_experience',
      'projects'
    ]
  };
  
  const fieldsToCheck = [...commonFields, ...(roleFields[accountType] || roleFields.job_seeker)];
  
  fieldsToCheck.forEach(field => {
    totalFields++;
    const value = profile[field];
    
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        filledFields++;
      } else if (!Array.isArray(value)) {
        filledFields++;
      }
    }
  });
  
  return Math.round((filledFields / totalFields) * 100);
};
