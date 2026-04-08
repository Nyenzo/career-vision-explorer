import { apiClient } from '../lib/api-client';
import {
  AIAnalysisRequest,
  AIAnalysisResponse,
  InterviewResponse,
  InterviewQuestion
} from '../types/api';

interface SkillGapResponse {
  skill_gaps?: {
    missing_critical?: string[];
    missing_required?: string[];
  };
  recommendations?: {
    priority_actions?: string[];
  };
}

interface JobDescriptionResponse {
  technical_skills?: {
    required?: string[];
    preferred?: string[];
  };
  experience_required?: {
    level?: string;
  };
  job_title?: string;
}

interface AnalyzeSkillGapsResponse {
  skill_gaps?: Array<{ skill?: string } | string>;
  career_opportunities?: string[];
}

type GenericContext = Record<string, unknown>;

class AIService {
  private async deepseekGenerate(prompt: string): Promise<string> {
    const response = await apiClient.post<{ response: string }>('/deepseek/generate', { prompt });
    return response.response;
  }

  // Resume analysis
  async analyzeResume(resumeText: string): Promise<AIAnalysisResponse> {
    const generated = await this.deepseekGenerate(
      `Analyze this resume text and return concise strengths, skill gaps, and recommendations:\n\n${resumeText}`
    );

    return {
      analysis: generated,
      recommendations: [],
      skill_gaps: [],
    };
  }

  // Job matching
  async analyzeJobMatch(jobDescription: string, userSkills?: string[]): Promise<AIAnalysisResponse> {
    const skills = userSkills?.length
      ? userSkills
      : jobDescription
        .split(/[^a-zA-Z0-9+#.]+/)
        .filter(Boolean)
        .slice(0, 10);

    const params = new URLSearchParams();
    skills.forEach((skill) => params.append('skills', skill));

    const response = await apiClient.post<Array<{ match_score?: number }>>(`/jobs/ai-match?${params.toString()}`);
    const matchScore = response.length > 0 ? response[0].match_score : undefined;

    return {
      analysis: 'Matched jobs based on provided skills.',
      recommendations: [],
      skill_gaps: [],
      match_score: matchScore,
    };
  }

  // Skill gap analysis
  async analyzeSkillGap(jobDescription: string): Promise<{
    skill_gaps: string[];
    recommendations: string[];
    learning_resources: Array<{
      skill: string;
      resources: string[];
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    const response = await apiClient.post<SkillGapResponse>('/skill-gap/analyze-skill-gap', {
      job_description: jobDescription,
    });

    return {
      skill_gaps: response?.skill_gaps?.missing_critical || response?.skill_gaps?.missing_required || [],
      recommendations: response?.recommendations?.priority_actions || [],
      learning_resources: [],
    };
  }

  // Career path recommendations
  async getCareerPathRecommendations(): Promise<{
    recommended_paths: Array<{
      title: string;
      description: string;
      required_skills: string[];
      salary_range: string;
      growth_potential: number;
    }>;
    reasoning: string;
  }> {
    const recommendations = await apiClient.get<Array<{ suggested_skill: string; rationale: string }>>('/ai/skill-recommendations');

    return {
      recommended_paths: recommendations.slice(0, 5).map((rec) => ({
        title: rec.suggested_skill,
        description: rec.rationale,
        required_skills: [rec.suggested_skill],
        salary_range: 'N/A',
        growth_potential: 0.7,
      })),
      reasoning: 'Generated from personalized skill recommendations.',
    };
  }

  // Interview preparation
  async generateInterviewQuestions(role: string, experience_level?: string): Promise<InterviewResponse> {
    const generated = await this.deepseekGenerate(
      `Generate concise interview questions for a ${experience_level || 'mid'} ${role} role. Return plain text bullet points.`
    );

    return {
      questions: generated
        .split('\n')
        .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 8)
        .map((question) => ({
          question,
          type: 'technical' as const,
          difficulty: 'medium' as const,
        })),
      session_id: `local-${Date.now()}`,
    };
  }

  async generateRoleBasedQuestions(role: string): Promise<InterviewResponse> {
    return this.generateInterviewQuestions(role);
  }

  // Cover letter generation
  async generateCoverLetter(jobDescription: string, userProfile?: unknown): Promise<{
    cover_letter: string;
    tips: string[];
  }> {
    const generated = await this.deepseekGenerate(
      `Write a professional cover letter for this job description:\n${jobDescription}\n\nCandidate context:\n${JSON.stringify(userProfile || {}, null, 2)}`
    );

    return {
      cover_letter: generated,
      tips: ['Customize company details before sending.'],
    };
  }

  // Skills analysis from text
  async extractSkillsFromText(text: string): Promise<{
    skills: string[];
    categories: { [skill: string]: string };
    confidence_scores: { [skill: string]: number };
  }> {
    const generated = await this.deepseekGenerate(
      `Extract skills from the following text. Return a comma-separated list only:\n\n${text}`
    );
    const skills = generated
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 30);

    return {
      skills,
      categories: {},
      confidence_scores: {},
    };
  }

  // Job description analysis
  async analyzeJobDescription(jobDescription: string): Promise<{
    required_skills: string[];
    preferred_skills: string[];
    experience_level: string;
    role_type: string;
    salary_estimate?: string;
    company_insights?: string[];
  }> {
    const response = await apiClient.post<JobDescriptionResponse>('/skill-gap/analyze-job-description', {
      job_description: jobDescription
    });

    return {
      required_skills: response?.technical_skills?.required || [],
      preferred_skills: response?.technical_skills?.preferred || [],
      experience_level: response?.experience_required?.level || 'unknown',
      role_type: response?.job_title || 'unknown',
      salary_estimate: undefined,
      company_insights: [],
    };
  }

  // Personalized recommendations
  async getPersonalizedRecommendations(): Promise<{
    job_recommendations: Array<{
      job_id: string;
      match_score: number;
      reasons: string[];
    }>;
    skill_recommendations: string[];
    learning_recommendations: Array<{
      skill: string;
      resources: string[];
      priority: number;
    }>;
  }> {
    const response = await apiClient.post<Array<{ job_id: string; match_score: number }>>('/ai/job-recommendations', {});
    return {
      job_recommendations: response.map((item) => ({
        job_id: item.job_id,
        match_score: item.match_score,
        reasons: [],
      })),
      skill_recommendations: [],
      learning_recommendations: [],
    };
  }

  // Gemini-powered features
  async deepseekSkillAnalysis(skills: string[]): Promise<{
    analysis: string;
    strengths: string[];
    improvement_areas: string[];
    market_insights: string[];
  }> {
    const response = await apiClient.post<AnalyzeSkillGapsResponse>('/analyze/skill-gaps', {
      skills,
    });
    return {
      analysis: 'DeepSeek skill gap analysis completed.',
      strengths: [],
      improvement_areas:
        response?.skill_gaps
          ?.map((gap) => (typeof gap === 'string' ? gap : gap.skill || ''))
          .filter(Boolean) || [],
      market_insights: response?.career_opportunities || [],
    };
  }

  async deepseekCareerAdvice(profile: unknown): Promise<{
    advice: string;
    action_items: string[];
    resources: string[];
  }> {
    const generated = await this.deepseekGenerate(
      `Provide concise career advice and action items based on this profile:\n${JSON.stringify(profile || {}, null, 2)}`
    );
    return {
      advice: generated,
      action_items: [],
      resources: [],
    };
  }

  // Chat with AI assistant
  async chatWithAI(message: string, context?: GenericContext): Promise<{
    response: string;
    suggestions: string[];
    context: GenericContext;
  }> {
    const response = await this.deepseekGenerate(
      `User message: ${message}\nContext: ${JSON.stringify(context || {}, null, 2)}`
    );

    return {
      response,
      suggestions: [],
      context: context || {},
    };
  }

  // CV upload and parsing
  async uploadAndParseCV(file: File): Promise<{
    status: string;
    parsed_data: {
      name?: string;
      email?: string;
      phone?: string;
      skills?: string[];
      experience?: unknown[];
      education?: unknown[];
      summary?: string;
      [key: string]: unknown;
    };
    profile_updated?: boolean;
    message?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post('/ai/upload-and-parse-cv', formData);
  }

  // Check if user has uploaded CV
  async checkIfCVParsed(): Promise<boolean> {
    try {
      const profile = await apiClient.get<{ resume_link?: string; resume_analysis?: unknown }>('/profile/');
      return !!profile.resume_link || !!profile.resume_analysis;
    } catch (error) {
      console.error('Error checking CV status:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
