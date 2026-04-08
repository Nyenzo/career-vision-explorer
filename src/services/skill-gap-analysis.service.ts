import { apiClient } from '../lib/api-client';

export interface JobDescriptionAnalysis {
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  job_complexity: 'low' | 'medium' | 'high';
  key_responsibilities: string[];
  industry_insights: string[];
}

export interface AdvancedResumeData {
  personal_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  skills: {
    technical_skills: string[];
    soft_skills: string[];
    certifications: string[];
    languages: string[];
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface SkillGapAnalysis {
  overall_match: number;
  skill_gaps: Array<{
    skill: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    current_level: number;
    required_level: number;
    learning_resources: string[];
    estimated_learning_time: string;
  }>;
  strengths: string[];
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
    timeline: string;
  }>;
  career_progression: {
    current_role_fit: number;
    next_level_readiness: number;
    suggested_roles: string[];
  };
}

export interface CandidateAnalysis {
  candidate_id: string;
  overall_score: number;
  skill_match: number;
  experience_match: number;
  culture_fit_score: number;
  strengths: string[];
  areas_for_development: string[];
  interview_recommendations: string[];
  hiring_recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no';
}

export interface LearningResource {
  title: string;
  type: 'course' | 'book' | 'tutorial' | 'practice' | 'certification';
  provider: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cost: 'free' | 'paid';
  rating: number;
  description: string;
}

class SkillGapAnalysisService {
  // Analyze job description to extract requirements
  async analyzeJobDescription(jobDescription: string): Promise<JobDescriptionAnalysis> {
    return apiClient.post('/skill-gap/analyze-job-description', {
      job_description: jobDescription
    });
  }

  // Advanced resume parsing with detailed extraction
  async parseResumeAdvanced(resumeFile: File): Promise<AdvancedResumeData> {
    return apiClient.uploadFile('/skill-gap/parse-resume-advanced', resumeFile, 'resume');
  }

  // Comprehensive skill gap analysis
  async analyzeSkillGap(request: {
    candidate_resume?: File;
    job_description?: string;
    target_role?: string;
    current_skills?: string[];
  }): Promise<SkillGapAnalysis> {
    const formData = new FormData();
    
    if (request.candidate_resume) {
      formData.append('candidate_resume', request.candidate_resume);
    }
    if (request.job_description) {
      formData.append('job_description', request.job_description);
    }
    if (request.target_role) {
      formData.append('target_role', request.target_role);
    }
    if (request.current_skills) {
      formData.append('current_skills', JSON.stringify(request.current_skills));
    }

    return apiClient.post('/skill-gap/analyze-skill-gap', formData);
  }

  // Bulk analyze multiple candidates for a job
  async bulkAnalyzeCandidates(jobId: string, candidateFiles: File[]): Promise<{
    job_analysis: JobDescriptionAnalysis;
    candidate_analyses: CandidateAnalysis[];
    ranking: Array<{
      rank: number;
      candidate_id: string;
      score: number;
      key_strengths: string[];
    }>;
    hiring_insights: {
      top_candidates_count: number;
      average_skill_match: number;
      common_skill_gaps: string[];
      diversity_metrics: any;
    };
  }> {
    const formData = new FormData();
    candidateFiles.forEach((file, index) => {
      formData.append(`candidates`, file);
    });

    const response = await fetch(`${apiClient['baseURL']}/skill-gap/bulk-analyze-candidates/${jobId}`, {
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

  // Get learning resources for a specific skill
  async getLearningResources(skill: string): Promise<{
    resources: LearningResource[];
    skill_info: {
      description: string;
      market_demand: 'high' | 'medium' | 'low';
      salary_impact: string;
      related_skills: string[];
    };
    learning_path: Array<{
      level: 'beginner' | 'intermediate' | 'advanced';
      estimated_duration: string;
      key_topics: string[];
      recommended_resources: string[];
    }>;
  }> {
    return apiClient.get(`/skill-gap/learning-resources/${encodeURIComponent(skill)}`);
  }

  // Analyze target job and provide roadmap
  async analyzeTargetJob(request: {
    current_resume?: File;
    target_job_description: string;
    timeline_preference?: string;
    learning_style?: 'visual' | 'hands-on' | 'reading' | 'mixed';
  }): Promise<{
    analysis: SkillGapAnalysis;
    learning_roadmap: Array<{
      phase: number;
      title: string;
      duration: string;
      skills_to_develop: string[];
      milestones: string[];
      resources: LearningResource[];
    }>;
    career_insights: {
      job_market_outlook: string;
      salary_expectations: string;
      career_progression: string[];
      networking_suggestions: string[];
    };
  }> {
    const formData = new FormData();
    
    if (request.current_resume) {
      formData.append('current_resume', request.current_resume);
    }
    formData.append('target_job_description', request.target_job_description);
    if (request.timeline_preference) {
      formData.append('timeline_preference', request.timeline_preference);
    }
    if (request.learning_style) {
      formData.append('learning_style', request.learning_style);
    }

    const response = await fetch(`${apiClient['baseURL']}/skill-gap/analyze-target-job`, {
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

  // Get comprehensive skill insights
  async getSkillInsights(skills: string[]): Promise<{
    market_analysis: {
      trending_skills: string[];
      declining_skills: string[];
      emerging_skills: string[];
      skill_combinations: Array<{
        skills: string[];
        market_value: number;
        job_opportunities: number;
      }>;
    };
    career_paths: Array<{
      path_name: string;
      required_skills: string[];
      entry_level_salary: number;
      senior_level_salary: number;
      job_growth_rate: number;
    }>;
    recommendations: {
      skills_to_add: string[];
      skills_to_prioritize: string[];
      learning_sequence: string[];
    };
  }> {
    return apiClient.post('/skill-gap/skill-insights', { skills });
  }

  // Generate personalized development plan
  async generateDevelopmentPlan(request: {
    current_skills: string[];
    career_goals: string[];
    available_time_per_week: number;
    preferred_learning_methods: string[];
    budget_range?: string;
  }): Promise<{
    plan_overview: {
      total_duration: string;
      key_milestones: string[];
      expected_outcomes: string[];
    };
    weekly_schedule: Array<{
      week: number;
      focus_skills: string[];
      activities: Array<{
        day: string;
        activity: string;
        duration: string;
        resources: string[];
      }>;
      assessment: string;
    }>;
    progress_tracking: {
      metrics: string[];
      checkpoints: Array<{
        week: number;
        goals: string[];
        assessment_method: string;
      }>;
    };
  }> {
    return apiClient.post('/skill-gap/development-plan', request);
  }
}

export const skillGapAnalysisService = new SkillGapAnalysisService();