// Fast Fallback Service - Provides immediate responses when backend is slow
// This ensures the app never hangs waiting for slow API responses

import { Job } from '@/types/api';

interface FallbackConfig {
  maxWaitTime: number; // Maximum time to wait for real API
  enableMockData: boolean;
}

// Configuration for fallback behavior
const FALLBACK_CONFIG: FallbackConfig = {
  maxWaitTime: 3000, // 3 seconds max wait
  enableMockData: true
};

// Mock data that provides immediate responses
export class FastFallbackService {
  
  // Fast job data that loads instantly
  private static getMockJobs(): Job[] {
    return [
      {
        job_id: "mock-1",
        title: "Senior Software Engineer",
        company: "TechCorp Kenya",
        location: "Nairobi, Kenya",
        salary_range: "KES 450,000 - 600,000",
        description: "Join our engineering team to build scalable solutions.",
        requirements: "5+ years experience, Python, JavaScript, React",
        skills_required: ["Python", "JavaScript", "React", "Node.js", "AWS"],
        job_type: "Full-time",
        experience_level: "Senior",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posted_by: "mock-employer-1",
        application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        job_id: "mock-2", 
        title: "Frontend Developer",
        company: "Digital Solutions Ltd",
        location: "Nairobi, Kenya",
        salary_range: "KES 300,000 - 450,000",
        description: "Build modern web applications with React and TypeScript.",
        requirements: "3+ years experience, React, TypeScript, CSS",
        skills_required: ["React", "TypeScript", "CSS", "HTML", "Git"],
        job_type: "Full-time",
        experience_level: "Mid",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posted_by: "mock-employer-2",
        application_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        job_id: "mock-3",
        title: "Data Scientist",
        company: "Analytics Pro",
        location: "Remote",
        salary_range: "KES 500,000 - 700,000",
        description: "Analyze data and build ML models to drive business insights.",
        requirements: "4+ years experience, Python, SQL, Machine Learning",
        skills_required: ["Python", "SQL", "Machine Learning", "Pandas", "TensorFlow"],
        job_type: "Full-time",
        experience_level: "Senior",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posted_by: "mock-employer-3",
        application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        job_id: "mock-4",
        title: "DevOps Engineer",
        company: "CloudTech Africa",
        location: "Nairobi, Kenya",
        salary_range: "KES 400,000 - 550,000",
        description: "Manage cloud infrastructure and deployment pipelines.",
        requirements: "3+ years experience, AWS, Docker, Kubernetes",
        skills_required: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
        job_type: "Full-time",
        experience_level: "Mid",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posted_by: "mock-employer-4",
        application_deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        job_id: "mock-5",
        title: "Product Manager",
        company: "InnovateTech",
        location: "Nairobi, Kenya", 
        salary_range: "KES 350,000 - 500,000",
        description: "Lead product development and strategy for our SaaS platform.",
        requirements: "4+ years experience, Product Management, Agile",
        skills_required: ["Product Management", "Agile", "Scrum", "Analytics", "UX"],
        job_type: "Full-time",
        experience_level: "Senior",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posted_by: "mock-employer-5",
        application_deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Fast profile data
  private static getMockProfile() {
    return {
      user_id: "mock-user-1",
      name: "John Developer",
      email: "john@example.com",
      skills: [
        "JavaScript", "React", "Node.js", "Python", "SQL", 
        "Git", "Docker", "AWS", "TypeScript", "MongoDB"
      ],
      bio: "Passionate software developer with 5+ years of experience building web applications.",
      location: "Nairobi, Kenya",
      experience_years: 5,
      phone: "+254700123456",
      education: "BSc Computer Science",
      salary_expectation: "KES 400,000 - 600,000",
      job_type_preference: "Full-time",
      work_mode_preference: "Hybrid",
      availability: "Immediately",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Race between real API and timeout
  static async withFastFallback<T>(
    apiCall: () => Promise<T>, 
    fallbackData: T,
    customTimeout?: number
  ): Promise<{ data: T; isFallback: boolean }> {
    const timeout = customTimeout || FALLBACK_CONFIG.maxWaitTime;
    
    try {
      const result = await Promise.race([
        apiCall().then(data => ({ data, isFallback: false })),
        new Promise<{ data: T; isFallback: boolean }>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
      
      console.log('✅ Real API response received');
      return result;
    } catch (error) {
      console.warn(`⚡ API slow/failed, using fallback data:`, error.message);
      return { data: fallbackData, isFallback: true };
    }
  }

  // Fast jobs with automatic fallback
  static async getJobsFast(params?: any): Promise<{ 
    jobs: Job[]; 
    total: number; 
    isFallback: boolean;
    page: number;
    limit: number;
    pages: number;
  }> {
    const mockJobs = this.getMockJobs();
    const fallbackResponse = {
      jobs: mockJobs,
      total: mockJobs.length,
      page: 1,
      limit: 50,
      pages: 1
    };

    // Don't even try real API if config disabled or params suggest we want fast response
    if (!FALLBACK_CONFIG.enableMockData || params?.fastMode) {
      console.log('🚀 Using fast mock data (immediate response)');
      return { ...fallbackResponse, isFallback: true };
    }

    // Try real API with quick timeout
    try {
      const { jobsService } = await import('./jobs.service');
      const result = await this.withFastFallback(
        () => jobsService.getJobs(params),
        fallbackResponse,
        2000 // 2 second timeout for jobs
      );
      
      return { ...result.data, isFallback: result.isFallback };
    } catch {
      console.log('🚀 Jobs API failed, using mock data');
      return { ...fallbackResponse, isFallback: true };
    }
  }

  // Fast profile with automatic fallback  
  static async getProfileFast(): Promise<{ profile: any; isFallback: boolean }> {
    const mockProfile = this.getMockProfile();
    
    if (!FALLBACK_CONFIG.enableMockData) {
      return { profile: mockProfile, isFallback: true };
    }

    try {
      const { profileService } = await import('./profile.service');
      const result = await this.withFastFallback(
        () => profileService.getProfile(),
        mockProfile,
        1500 // 1.5 second timeout for profile
      );
      
      return { profile: result.data, isFallback: result.isFallback };
    } catch {
      console.log('🚀 Profile API failed, using mock data');
      return { profile: mockProfile, isFallback: true };
    }
  }

  // Fast AI job matching with instant fallback
  static async getAIJobMatchesFast(userSkills: string[]): Promise<{
    matches: any[];
    isFallback: boolean;
  }> {
    const mockJobs = this.getMockJobs();
    
    // Create mock AI matches based on user skills
    const mockMatches = mockJobs.map(job => ({
      job_id: job.job_id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary_range: job.salary_range,
      match_score: Math.floor(Math.random() * 30) + 70, // 70-100%
      matched_skills: job.skills_required?.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      ) || [],
      created_at: job.created_at
    })).sort((a, b) => b.match_score - a.match_score);

    // AI matching is always slow, so prefer fast mock data
    console.log('🚀 Using fast AI mock matches (avoiding slow AI API)');
    return { matches: mockMatches, isFallback: true };
  }

  // Configure fallback behavior
  static configure(config: Partial<FallbackConfig>) {
    Object.assign(FALLBACK_CONFIG, config);
  }

  // Get current config
  static getConfig(): FallbackConfig {
    return { ...FALLBACK_CONFIG };
  }

  // Check if we should use fallback based on recent performance
  static shouldUseFallback(): boolean {
    // Could implement logic based on recent API performance
    // For now, just use config
    return FALLBACK_CONFIG.enableMockData;
  }
}

export default FastFallbackService;
