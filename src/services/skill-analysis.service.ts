import { apiClient } from '../lib/api-client';

export interface SkillAnalysisResponse {
  extracted_skills: string[];
  skill_gaps: Array<{[key: string]: any}>;
  recommended_learning_path: Array<{[key: string]: any}>;
  career_opportunities: string[];
}

export interface SkillGapRequest {
  skills: string[];
  target_role: string;
}

export interface JobDescriptionAnalysisRequest {
  job_description: string;
}

export interface SkillGapAnalysisRequest {
  job_id?: string;
  job_description?: string;
}

export interface SkillGapAnalysisResponse {
  overall_match: number;
  fit_assessment: {[key: string]: any};
  skill_gaps: {
    [category: string]: string[];
  };
  recommendations: {[key: string]: any};
  learning_roadmap: Array<{[key: string]: any}>;
}

export interface ParsedResumeResponse {
  status: string;
  parsed_data: {[key: string]: any};
  total_skills_found: number;
  experience_years: number;
  skill_categories: {
    [category: string]: string[];
  };
}

class SkillAnalysisService {
  // Analyze skills from uploaded CV/Resume
  async analyzeSkillsFromResume(resumeFile: File): Promise<SkillAnalysisResponse> {
    return apiClient.uploadFile('/analyze/skills', resumeFile, 'file');
  }

  // Analyze skill gaps for given skills and target role
  async analyzeSkillGaps(request: SkillGapRequest): Promise<string> {
    return apiClient.post('/analyze/skill-gaps', request);
  }

  // Match user's skills to a specific job
  async matchSkillsToJob(jobId: string): Promise<string> {
    return apiClient.post(`/analyze/match-to-job/${jobId}`);
  }

  // Get job based skill recommendations
  async getJobBasedRecommendations(request: { job_title: string }): Promise<string> {
    return apiClient.post('/analyze/job-based-recommendations', request);
  }

  // Analyze job description to extract skills and requirements
  async analyzeJobDescription(request: JobDescriptionAnalysisRequest): Promise<{[key: string]: any}> {
    return apiClient.post('/skill-gap/analyze-job-description', request);
  }

  // Advanced resume parsing with skill categorization
  async parseResumeAdvanced(resumeFile: File): Promise<ParsedResumeResponse> {
    return apiClient.uploadFile('/skill-gap/parse-resume-advanced', resumeFile, 'file');
  }

  // Comprehensive skill gap analysis between user profile and job requirements
  async analyzeSkillGap(request: SkillGapAnalysisRequest): Promise<SkillGapAnalysisResponse> {
    return apiClient.post('/skill-gap/analyze-skill-gap', request);
  }

  // Analyze multiple candidates against a job posting (employers only)
  async bulkAnalyzeCandidates(jobId: string, limit: number = 50): Promise<string> {
    return apiClient.post(`/skill-gap/bulk-analyze-candidates/${jobId}?limit=${limit}`);
  }

  // Get curated learning resources for a specific skill
  async getLearningResources(skill: string): Promise<string> {
    return apiClient.get(`/skill-gap/learning-resources/${encodeURIComponent(skill)}`);
  }

  // Analyze skill gaps for a target job the seeker wants
  async analyzeTargetJob(request: {
    job_title: string;
    company?: string;
    job_description?: string;
  }): Promise<{[key: string]: any}> {
    const formData = new FormData();
    formData.append('job_title', request.job_title);
    if (request.company) {
      formData.append('company', request.company);
    }
    if (request.job_description) {
      formData.append('job_description', request.job_description);
    }

    const token = apiClient.getToken();
    const response = await fetch(`${process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/skill-gap/analyze-target-job`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // Helper method to get comprehensive skill analysis
  async getComprehensiveAnalysis(resumeFile: File, targetRole?: string): Promise<{
    resume_analysis: ParsedResumeResponse;
    skill_extraction: SkillAnalysisResponse;
    skill_gaps?: string;
  }> {
    try {
      const [resumeAnalysis, skillExtraction] = await Promise.all([
        this.parseResumeAdvanced(resumeFile),
        this.analyzeSkillsFromResume(resumeFile)
      ]);

      let skillGaps;
      if (targetRole && resumeAnalysis.parsed_data) {
        try {
          // Extract skills from parsed data for skill gap analysis
          const userSkills = Object.values(resumeAnalysis.skill_categories).flat();
          skillGaps = await this.analyzeSkillGaps({
            skills: userSkills,
            target_role: targetRole
          });
        } catch (error) {
          console.warn('Failed to analyze skill gaps:', error);
        }
      }

      return {
        resume_analysis: resumeAnalysis,
        skill_extraction: skillExtraction,
        skill_gaps: skillGaps
      };
    } catch (error) {
      console.error('Error in comprehensive analysis:', error);
      throw error;
    }
  }
}

export const skillAnalysisService = new SkillAnalysisService();