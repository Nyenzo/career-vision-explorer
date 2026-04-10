// Export all services for easy importing
export { authService } from './auth.service';
export { jobsService } from './jobs.service';
export { profileService } from './profile.service';
export { applicationsService } from './applications.service';
export { skillsService } from './skills.service';
export { aiService } from './ai.service';
export { interviewService } from './interview.service';
export { notificationService } from './notification.service';

// Export service types
export type { JobSearchParams } from './jobs.service';
export type { ApplicationFilters } from './applications.service';
export type { SkillFilters } from './skills.service';
export type { InterviewQuestion } from './interview.service';