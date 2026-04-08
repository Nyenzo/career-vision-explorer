import { apiClient } from '../lib/api-client';

export interface SkillExtractionResponse {
  extracted_skills: string[];
  confidence_scores: { [skill: string]: number };
  categories: { [skill: string]: string };
  recommendations: string[];
}

export interface JobRecommendationResponse {
  recommended_jobs: Array<{
    job_id: string;
    title: string;
    company: string;
    match_score: number;
    reasons: string[];
    salary_range?: string;
  }>;
  total_matches: number;
  search_criteria: {
    skills_matched: string[];
    location_preference?: string;
    experience_level?: string;
  };
}

export interface ResumeAnalysisResponse {
  analysis: {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  extracted_data: {
    skills: string[];
    experience_years: number;
    education: string[];
    certifications: string[];
  };
  market_insights: {
    skill_demand: { [skill: string]: 'high' | 'medium' | 'low' };
    salary_insights: string[];
    trending_skills: string[];
  };
}

export interface CandidateMatch {
  candidate_id: string;
  name: string;
  email: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_level: string;
  availability: string;
}

class EnhancedAIService {
  // Check AI service status
  async getAIStatus(): Promise<string> {
    return apiClient.get('/ai/status');
  }

  // Extract skills from resume (PDF or DOCX)
  async extractSkillsFromResume(resumeFile: File): Promise<{
    skills: string[];
    confidence: number;
  }> {
    return apiClient.uploadFile('/ai/extract-skills', resumeFile, 'file');
  }

  // Get AI-powered job recommendations based on user profile and preferences
  async getJobRecommendations(preferences: {
    location?: string;
    salary_range?: string;
    job_type?: string;
  }): Promise<Array<{
    job_id: string;
    match_score: number;
    reasons: string[];
  }>> {
    try {
      const params = new URLSearchParams(preferences as any).toString();
      const response = await apiClient.get<any[]>(`/vector/jobs/recommendations?${params}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      return [];
    }
  }

  // Get personalized skill recommendations for career growth
  async getSkillRecommendations(targetRole?: string): Promise<Array<{
    skill: string;
    rationale: string;
    demand_level: string;
  }>> {
    const params = targetRole ? `?target_role=${encodeURIComponent(targetRole)}` : '';
    return apiClient.get(`/ai/skill-recommendations${params}`);
  }

  // Get AI-powered resume analysis and improvement suggestions
  async analyzeResume(resumeFile: File, targetRole: string): Promise<{
    overall_score: number;
    strengths: string[];
    improvements: Array<{[key: string]: string}>;
    keywords_to_add: string[];
    formatting_tips: string[];
  }> {
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('target_role', targetRole);

    const token = apiClient.getToken();
    const response = await fetch(`${process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/ai/analyze-resume`, {
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

  // AI-powered candidate matching for a job posting (employers only)
  async matchCandidatesToJob(jobId: string, limit: number = 10): Promise<string> {
    return apiClient.get(`/ai/match-candidates/${jobId}?limit=${limit}`);
  }

  // Enhanced interview questions with job context
  async generateEnhancedInterviewQuestions(request: {
    job_description?: string;
    candidate_resume?: File;
    interview_type?: 'screening' | 'technical' | 'behavioral' | 'final';
    difficulty_level?: 'entry' | 'mid' | 'senior';
  }): Promise<{
    questions: Array<{
      question: string;
      type: string;
      difficulty: string;
      expected_answer_points: string[];
      evaluation_criteria: string[];
      follow_up_questions?: string[];
    }>;
    interview_structure: {
      total_duration: number;
      sections: Array<{
        name: string;
        duration: number;
        focus_areas: string[];
      }>;
    };
    candidate_specific_notes?: string[];
  }> {
    const formData = new FormData();
    Object.entries(request).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${apiClient['baseURL']}/ai/interview-questions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  // Job matching AI for advanced search
  async aiMatchJobs(criteria: {
    skills: string[];
    experience_level?: string;
    location?: string;
    salary_expectations?: number;
    job_type?: string;
    industry_preference?: string[];
  }): Promise<{
    matched_jobs: Array<{
      job_id: string;
      title: string;
      company: string;
      location: string;
      match_score: number;
      matching_factors: string[];
      salary_match: boolean;
      skills_match_percentage: number;
    }>;
    search_insights: {
      total_jobs_analyzed: number;
      high_match_threshold: number;
      recommendations: string[];
    };
  }> {
    return apiClient.post('/jobs/ai-match', criteria);
  }

  // Smart career path analysis
  async analyzeCareerPath(currentRole: string, targetRole: string): Promise<{
    path_analysis: {
      feasibility_score: number;
      estimated_timeline: string;
      difficulty_level: 'easy' | 'medium' | 'hard';
    };
    required_skills: string[];
    skill_gaps: string[];
    recommended_steps: Array<{
      step_number: number;
      title: string;
      description: string;
      estimated_duration: string;
      resources: string[];
    }>;
    market_insights: {
      job_availability: number;
      salary_progression: string;
      growth_potential: string;
    };
  }> {
    return apiClient.post('/ai/career-path-analysis', {
      current_role: currentRole,
      target_role: targetRole
    });
  }

  // Salary negotiation insights
  async getSalaryInsights(jobTitle: string, location: string, experience: number): Promise<{
    salary_range: {
      min: number;
      max: number;
      median: number;
      currency: string;
    };
    market_data: {
      percentile_25: number;
      percentile_75: number;
      percentile_90: number;
    };
    negotiation_tips: string[];
    factors_affecting_salary: string[];
    benchmark_companies: Array<{
      company: string;
      estimated_range: string;
    }>;
  }> {
    return apiClient.post('/ai/salary-insights', {
      job_title: jobTitle,
      location,
      experience_years: experience
    });
  }
}

export const enhancedAIService = new EnhancedAIService();