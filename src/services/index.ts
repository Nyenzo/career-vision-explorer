// Export all services for easy importing
export { authService } from './auth.service';
export { jobsService } from './jobs.service';
export { profileService } from './profile.service';
export { applicationsService } from './applications.service';
export { skillsService } from './skills.service';
export { aiService } from './ai.service';
export { interviewService } from './interview.service';
export { enhancedAIService } from './enhanced-ai.service';
export { skillGapAnalysisService } from './skill-gap-analysis.service';
export { deepseekService, geminiService } from './deepseek.service';
export { skillAnalysisService } from './skill-analysis.service';

// Export service types
export type { JobSearchParams } from './jobs.service';
export type { ApplicationFilters } from './applications.service';
export type { SkillFilters } from './skills.service';
export type { InterviewQuestion } from './interview.service';
export type { SkillExtractionResponse, JobRecommendationResponse, ResumeAnalysisResponse } from './enhanced-ai.service';
export type { SkillGapAnalysis, LearningResource } from './skill-gap-analysis.service';
export type { GenerateRequest, GenerateResponse } from './deepseek.service';
export type { SkillAnalysisResponse, SkillGapAnalysisResponse, ParsedResumeResponse } from './skill-analysis.service';