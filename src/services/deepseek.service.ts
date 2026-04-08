import { apiClient } from '../lib/api-client';

export interface GenerateRequest {
    prompt: string;
}

export interface GenerateResponse {
    response: string;
    status: 'success' | 'error';
}

class DeepSeekService {
    // Generate text using DeepSeek AI
    async generateText(prompt: string): Promise<GenerateResponse> {
        try {
            const request: GenerateRequest = { prompt };
            const response = await apiClient.post<GenerateResponse>('/deepseek/generate', request);
            return response;
        } catch (error: any) {
            console.error('DeepSeek API Error:', error);
            return {
                response: '',
                status: 'error'
            };
        }
    }

    // Check DeepSeek AI service status
    async checkStatus(): Promise<{ status: string; message?: string }> {
        return await apiClient.get('/deepseek/status');
    }

    // Generate professional summaries
    async generateProfessionalSummary(experience: string, skills: string[]): Promise<GenerateResponse> {
        const prompt = `Write a professional summary for a candidate with ${experience} years of experience and skills in ${skills.join(', ')}. Make it concise and impactful for a resume.`;
        return this.generateText(prompt);
    }

    // Generate cover letters
    async generateCoverLetter(jobTitle: string, company: string, userSkills: string[]): Promise<GenerateResponse> {
        const prompt = `Write a professional cover letter for the position of ${jobTitle} at ${company}. The candidate has skills in ${userSkills.join(', ')}. Make it personalized and compelling.`;
        return this.generateText(prompt);
    }

    // Generate interview preparation content
    async generateInterviewPrep(jobTitle: string, company: string): Promise<GenerateResponse> {
        const prompt = `Provide interview preparation tips and potential questions for a ${jobTitle} position at ${company}. Include technical and behavioral questions with sample answers.`;
        return this.generateText(prompt);
    }

    // Generate skill development roadmap
    async generateSkillRoadmap(currentSkills: string[], targetRole: string): Promise<GenerateResponse> {
        const prompt = `Create a skill development roadmap for someone with skills in ${currentSkills.join(', ')} who wants to become a ${targetRole}. Include specific learning resources and timeline.`;
        return this.generateText(prompt);
    }

    // Generate career advice
    async generateCareerAdvice(profile: {
        skills: string[];
        experience: string;
        goals: string;
    }): Promise<GenerateResponse> {
        const prompt = `Provide personalized career advice for someone with ${profile.experience} experience, skills in ${profile.skills.join(', ')}, and career goals: ${profile.goals}. Include actionable next steps.`;
        return this.generateText(prompt);
    }

    // Generate job description analysis
    async analyzeJobDescription(jobDescription: string): Promise<GenerateResponse> {
        const prompt = `Analyze this job description and extract key requirements, skills needed, and provide insights about the role: ${jobDescription}`;
        return this.generateText(prompt);
    }

    // Generate learning recommendations
    async generateLearningRecommendations(skills: string[], targetRole?: string): Promise<GenerateResponse> {
        const basePrompt = `Based on current skills: ${skills.join(', ')}, recommend specific learning resources, courses, and certifications to advance career growth.`;
        const prompt = targetRole
            ? `${basePrompt} Focus on becoming a ${targetRole}.`
            : basePrompt;
        return this.generateText(prompt);
    }
}

export const deepseekService = new DeepSeekService();

// Backward-compatible alias retained to avoid breaking existing imports during migration.
export const geminiService = deepseekService;
