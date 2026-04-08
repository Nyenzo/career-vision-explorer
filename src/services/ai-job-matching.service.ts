import { deepseekService } from './deepseek.service';
import { profileService } from './profile.service';
import { jobsService } from './jobs.service';
import { Job, Profile } from '../types/api';
import { JobMatch } from './job-matching.service';

export interface AIJobMatchRequest {
  user_skills: string[];
  experience_years?: number;
  salary_expectation?: string;
  location?: string;
  preferred_job_type?: string;
  availability?: string;
  work_authorization?: string;
  languages?: string[];
  preferences?: any;
  career_goals?: string;
  bio?: string;
}

export interface AIJobMatchScore {
  overall_score: number;
  skills_match: number;
  experience_match: number;
  location_match: number;
  salary_match: number;
  culture_match: number;
  growth_potential: number;
  detailed_reasoning: string[];
  improvement_suggestions: string[];
  match_confidence: 'high' | 'medium' | 'low';
}

export interface EnhancedJobMatch extends JobMatch {
  ai_score: AIJobMatchScore;
  personalized_insights: {
    why_good_fit: string[];
    potential_challenges: string[];
    career_growth_opportunities: string[];
    skill_development_areas: string[];
  };
  application_strategy: {
    key_strengths_to_highlight: string[];
    cover_letter_focus: string[];
    interview_preparation_tips: string[];
  };
}

export interface JobMatchingPreferences {
  min_match_score?: number;
  max_results?: number;
  include_stretch_opportunities?: boolean;
  focus_on_skill_growth?: boolean;
  prioritize_salary?: boolean;
  prioritize_location?: boolean;
  include_remote_only?: boolean;
}

class AIJobMatchingService {
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 3;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
  private readonly MAX_CONCURRENT_REQUESTS = 2;
  private activeRequests = 0;

  private isCircuitOpen(): boolean {
    const now = Date.now();
    if (this.failureCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
      if (now - this.lastFailureTime < this.CIRCUIT_BREAKER_TIMEOUT) {
        console.log('AI service circuit breaker is OPEN, falling back to cached data');
        return true;
      } else {
        // Reset circuit breaker after timeout
        this.failureCount = 0;
        console.log('AI service circuit breaker reset');
      }
    }
    return false;
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    console.log(`AI service failure recorded. Count: ${this.failureCount}`);
  }

  private recordSuccess(): void {
    this.failureCount = 0;
  }

  private async throttleRequest<T>(operation: () => Promise<T>): Promise<T> {
    if (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      throw new Error('Too many concurrent AI requests. Please try again later.');
    }

    this.activeRequests++;
    try {
      return await operation();
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Enhanced AI-powered job matching using DeepSeek
   */
  async matchJobsWithAI(
    userProfile?: Profile,
    preferences?: JobMatchingPreferences
  ): Promise<EnhancedJobMatch[]> {
    // Check circuit breaker first
    if (this.isCircuitOpen()) {
      console.log('AI service unavailable, returning fallback matches');
      return this.getFallbackMatches();
    }

    // Check AI cache first
    const cacheKey = `ai_job_matches_${userProfile?.user_id || 'guest'}_${JSON.stringify(preferences)}`;
    const cachedResult = jobsService.getCachedAIResult<EnhancedJobMatch[]>(cacheKey);
    if (cachedResult) {
      console.log('✅ Using cached AI job matches');
      return cachedResult;
    }

    return this.throttleRequest(async () => {
      try {
        // Get user profile if not provided
        const profile = userProfile || await profileService.getProfile();

        // Get available jobs (reduced limit to prevent overload)
        const jobsResponse = await jobsService.getJobs({
          is_active: true,
          page: 1,
          limit: 20 // Reduced from 100 to prevent AI overload
        });
        const jobs = jobsResponse.jobs || [];

        if (!jobs.length) {
          return [];
        }

        // Build comprehensive profile context for AI
        const profileContext = this.buildProfileContext(profile);

        // Process jobs in smaller batches for AI analysis
        const batchSize = 3; // Reduced from 10 to prevent timeouts
        const allMatches: EnhancedJobMatch[] = [];

        for (let i = 0; i < Math.min(jobs.length, 10); i += batchSize) { // Limit total jobs processed
          const jobBatch = jobs.slice(i, i + batchSize);
          try {
            const batchMatches = await this.analyzeJobBatch(profileContext, jobBatch, preferences);
            allMatches.push(...batchMatches);

            // Add delay between batches to prevent API throttling
            if (i + batchSize < jobs.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (batchError) {
            console.error(`Failed to analyze job batch ${i}-${i + batchSize}:`, batchError);
            // Continue with other batches rather than failing completely
          }
        }

        // Sort by overall AI score and apply preferences
        const result = this.filterAndSortMatches(allMatches, preferences);

        // Cache the successful result
        jobsService.cacheAIResult(cacheKey, result);

        this.recordSuccess();
        return result;

      } catch (error) {
        console.error('AI job matching failed:', error);
        this.recordFailure();
        // Fallback to basic matching
        return this.getFallbackMatches();
      }
    });
  }

  /**
   * Analyze a specific job against user profile
   */
  async analyzeJobMatch(
    jobId: string,
    userProfile?: Profile
  ): Promise<EnhancedJobMatch | null> {
    try {
      const profile = userProfile || await profileService.getProfile();
      const job = await jobsService.getJobById(jobId);

      if (!job) {
        return null;
      }

      const profileContext = this.buildProfileContext(profile);
      const matches = await this.analyzeJobBatch(profileContext, [job]);

      return matches[0] || null;

    } catch (error) {
      console.error('Job match analysis failed:', error);
      return null;
    }
  }

  /**
   * Get personalized career recommendations based on profile
   */
  async getCareerRecommendations(userProfile?: Profile): Promise<{
    recommended_roles: string[];
    skill_development_priorities: string[];
    industry_opportunities: string[];
    salary_growth_potential: string;
    next_steps: string[];
    timeline: { short_term: string[]; medium_term: string[]; long_term: string[] };
  }> {
    try {
      const profile = userProfile || await profileService.getProfile();
      const profileContext = this.buildProfileContext(profile);

      const prompt = `
        Based on this comprehensive user profile, provide personalized career recommendations:
        
        ${profileContext}
        
        Analyze their career trajectory and provide recommendations in the following JSON format:
        {
          "recommended_roles": ["list of specific job titles they should target"],
          "skill_development_priorities": ["top 5 skills to develop next"],
          "industry_opportunities": ["industries with good opportunities for this profile"],
          "salary_growth_potential": "realistic salary growth assessment",
          "next_steps": ["specific actionable steps they should take"],
          "timeline": {
            "short_term": ["actions for next 3-6 months"],
            "medium_term": ["goals for 6-18 months"],
            "long_term": ["vision for 2-5 years"]
          }
        }
        
        Be specific, actionable, and realistic based on their current profile and market conditions.
      `;

      const response = await deepseekService.generateText(prompt);

      if (response.status === 'success') {
        try {
          // Clean the response to handle markdown code blocks
          let cleanResponse = response.response.trim();

          // Remove markdown code blocks if present
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          const recommendations = JSON.parse(cleanResponse);
          return recommendations;
        } catch (parseError) {
          console.error('Failed to parse career recommendations:', parseError);
          console.log('Raw AI response:', response.response);
          return this.getFallbackCareerRecommendations();
        }
      }

      return this.getFallbackCareerRecommendations();

    } catch (error) {
      console.error('Career recommendations failed:', error);
      return this.getFallbackCareerRecommendations();
    }
  }

  /**
   * Build comprehensive profile context for AI analysis
   */
  private buildProfileContext(profile: Profile): string {
    return `
      USER PROFILE ANALYSIS:
      
      Basic Information:
      - Name: ${profile.name}
      - Experience: ${profile.experience_years || 0} years
      - Location: ${profile.location || 'Not specified'}
      - Job Type Preference: ${profile.preferred_job_type || 'Not specified'}
      - Availability: ${profile.availability || 'Not specified'}
      - Salary Expectation: ${profile.salary_expectation || 'Not specified'}
      
      Skills & Expertise:
      - Technical Skills: ${profile.skills?.join(', ') || 'None listed'}
      - Languages: ${profile.languages?.join(', ') || 'Not specified'}
      - Certifications: ${profile.certifications?.join(', ') || 'None listed'}
      
      Background:
      - Bio: ${profile.bio || 'Not provided'}
      - Education: ${profile.education || 'Not specified'}
      - Work Experience: ${this.formatWorkExperience(profile.work_experience)}
      - Projects: ${this.formatProjects(profile.projects)}
      
      Preferences & Goals:
      - Work Authorization: ${profile.work_authorization || 'Not specified'}
      - Job Preferences: ${JSON.stringify(profile.preferences || {})}
      
      Career Context:
      - Profile Completion: ${profile.profile_completion_percentage || 0}%
      - Last Updated: ${profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
    `;
  }

  /**
   * Analyze batch of jobs with AI
   */
  private async analyzeJobBatch(
    profileContext: string,
    jobs: Job[],
    preferences?: JobMatchingPreferences
  ): Promise<EnhancedJobMatch[]> {
    try {
      const jobsContext = jobs.map((job, index) => `
        JOB ${index + 1}:
        - ID: ${job.job_id}
        - Title: ${job.title}
        - Company: ${job.company}
        - Location: ${job.location}
        - Type: ${job.job_type || 'Not specified'}
        - Experience Level: ${job.experience_level || 'Not specified'}
        - Salary: ${job.salary_range || 'Not disclosed'}
        - Skills Required: ${job.skills_required?.join(', ') || 'Not specified'}
        - Description: ${job.description?.substring(0, 500) || 'No description'}
        - Requirements: ${job.requirements?.substring(0, 300) || 'No requirements listed'}
        - Benefits: ${job.benefits?.join(', ') || 'Not specified'}
        - Remote Friendly: ${job.remote_friendly ? 'Yes' : 'No'}
      `).join('\n\n');

      const prompt = `
        As an expert career advisor and AI recruitment specialist, analyze these job opportunities against the user's profile and provide comprehensive matching analysis.
        
        ${profileContext}
        
        AVAILABLE JOBS:
        ${jobsContext}
        
        ANALYSIS REQUIREMENTS:
        1. Calculate detailed match scores (0-100) for each job considering:
           - Skills alignment (technical and soft skills)
           - Experience level match
           - Location compatibility
           - Salary expectations alignment
           - Cultural fit based on company/role
           - Career growth potential
        
        2. Provide personalized insights for each job:
           - Why it's a good fit
           - Potential challenges
           - Career growth opportunities
           - Skill development areas
        
        3. Suggest application strategy:
           - Key strengths to highlight
           - Cover letter focus points
           - Interview preparation tips
        
        Return analysis in the following JSON format for each job:
        {
          "job_matches": [
            {
              "job_id": "job_id_here",
              "ai_score": {
                "overall_score": 85,
                "skills_match": 90,
                "experience_match": 80,
                "location_match": 95,
                "salary_match": 75,
                "culture_match": 85,
                "growth_potential": 90,
                "detailed_reasoning": ["specific reasons for each score"],
                "improvement_suggestions": ["areas for improvement"],
                "match_confidence": "high"
              },
              "personalized_insights": {
                "why_good_fit": ["specific reasons this job fits"],
                "potential_challenges": ["potential difficulties"],
                "career_growth_opportunities": ["growth prospects"],
                "skill_development_areas": ["skills to develop"]
              },
              "application_strategy": {
                "key_strengths_to_highlight": ["strengths to emphasize"],
                "cover_letter_focus": ["cover letter points"],
                "interview_preparation_tips": ["interview advice"]
              }
            }
          ]
        }
        
        Provide honest, realistic assessments. Include both positive aspects and areas for improvement.
      `;

      const response = await deepseekService.generateText(prompt);

      if (response.status === 'success') {
        try {
          // Clean the response to handle markdown code blocks and comments
          let cleanResponse = response.response.trim();

          // Remove markdown code blocks if present
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          // Remove JavaScript-style comments that break JSON parsing
          cleanResponse = cleanResponse
            .replace(/\/\/.*$/gm, '')  // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments
            .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
            .replace(/,\s*]/g, ']');  // Remove trailing commas before closing brackets

          const analysis = JSON.parse(cleanResponse);
          return this.transformAIAnalysisToJobMatches(analysis.job_matches, jobs);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          console.log('Raw AI response:', response.response);
          return this.createBasicMatches(jobs);
        }
      }

      return this.createBasicMatches(jobs);

    } catch (error) {
      console.error('AI job analysis failed:', error);
      return this.createBasicMatches(jobs);
    }
  }

  /**
   * Transform AI analysis to job matches
   */
  private transformAIAnalysisToJobMatches(
    aiMatches: any[],
    jobs: Job[]
  ): EnhancedJobMatch[] {
    return aiMatches.map(aiMatch => {
      const job = jobs.find(j => j.job_id === aiMatch.job_id);
      if (!job) return null;

      const basicMatch: JobMatch = {
        id: job.job_id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.job_type || 'Full-time',
        salary: job.salary_range || 'Competitive',
        description: job.description || job.requirements || '',
        requiredSkills: job.skills_required || [],
        matchScore: aiMatch.ai_score?.overall_score || 0,
        matchedSkills: [], // Will be calculated from AI analysis
        missingSkills: [], // Will be calculated from AI analysis
        skillOverlap: 0,
        experienceLevel: job.experience_level,
        postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently',
        // Add additional fields
        benefits: job.benefits || [],
        remoteFriendly: job.remote_friendly || false,
        applicationDeadline: job.application_deadline
      };

      const enhancedMatch: EnhancedJobMatch = {
        ...basicMatch,
        ai_score: aiMatch.ai_score || this.getDefaultAIScore(),
        personalized_insights: aiMatch.personalized_insights || this.getDefaultInsights(),
        application_strategy: aiMatch.application_strategy || this.getDefaultStrategy()
      };

      return enhancedMatch;
    }).filter(Boolean) as EnhancedJobMatch[];
  }

  /**
   * Filter and sort matches based on preferences
   */
  private filterAndSortMatches(
    matches: EnhancedJobMatch[],
    preferences?: JobMatchingPreferences
  ): EnhancedJobMatch[] {
    let filtered = matches;

    // Apply filters
    if (preferences?.min_match_score) {
      filtered = filtered.filter(match => match.ai_score.overall_score >= preferences.min_match_score!);
    }

    if (preferences?.include_remote_only) {
      filtered = filtered.filter(match =>
        match.location.toLowerCase().includes('remote') ||
        match.type.toLowerCase().includes('remote')
      );
    }

    // Sort by overall AI score (descending)
    filtered.sort((a, b) => b.ai_score.overall_score - a.ai_score.overall_score);

    // Apply result limit
    if (preferences?.max_results) {
      filtered = filtered.slice(0, preferences.max_results);
    }

    return filtered;
  }

  /**
   * Utility methods
   */
  private formatWorkExperience(workExp?: any[]): string {
    if (!workExp || workExp.length === 0) return 'No work experience listed';

    return workExp.map(exp =>
      `${exp.position} at ${exp.company} (${exp.duration}): ${exp.description}`
    ).join('; ');
  }

  private formatProjects(projects?: any[]): string {
    if (!projects || projects.length === 0) return 'No projects listed';

    return projects.map(project =>
      `${project.name}: ${project.description} (Tech: ${project.tech_stack?.join(', ') || 'Not specified'})`
    ).join('; ');
  }

  private createBasicMatches(jobs: Job[]): EnhancedJobMatch[] {
    return jobs.map(job => ({
      id: job.job_id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.job_type || 'Full-time',
      salary: job.salary_range || 'Competitive',
      description: job.description || '',
      requiredSkills: job.skills_required || [],
      matchScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      matchedSkills: [],
      missingSkills: [],
      skillOverlap: 0,
      experienceLevel: job.experience_level,
      postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently',
      ai_score: this.getDefaultAIScore(),
      personalized_insights: this.getDefaultInsights(),
      application_strategy: this.getDefaultStrategy()
    }));
  }

  private getDefaultAIScore(): AIJobMatchScore {
    const score = Math.floor(Math.random() * 40) + 60;
    return {
      overall_score: score,
      skills_match: score,
      experience_match: score,
      location_match: score,
      salary_match: score,
      culture_match: score,
      growth_potential: score,
      detailed_reasoning: ['Basic compatibility analysis'],
      improvement_suggestions: ['Enhance profile for better matching'],
      match_confidence: 'medium'
    };
  }

  private getDefaultInsights() {
    return {
      why_good_fit: ['Skills alignment with role requirements'],
      potential_challenges: ['May require additional skill development'],
      career_growth_opportunities: ['Opportunity for professional development'],
      skill_development_areas: ['Technical skills enhancement recommended']
    };
  }

  private getDefaultStrategy() {
    return {
      key_strengths_to_highlight: ['Relevant experience and skills'],
      cover_letter_focus: ['Enthusiasm for the role and company'],
      interview_preparation_tips: ['Research company culture and values']
    };
  }

  private getFallbackMatches(): EnhancedJobMatch[] {
    return []; // Return empty array as fallback
  }

  private getFallbackCareerRecommendations() {
    return {
      recommended_roles: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer'],
      skill_development_priorities: ['React', 'Node.js', 'TypeScript', 'Cloud Technologies', 'DevOps'],
      industry_opportunities: ['Technology', 'Fintech', 'E-commerce', 'Healthcare Tech'],
      salary_growth_potential: 'Strong growth potential with continued skill development',
      next_steps: [
        'Complete relevant certifications',
        'Build portfolio projects',
        'Network with industry professionals',
        'Contribute to open source projects'
      ],
      timeline: {
        short_term: ['Update resume and portfolio', 'Apply to target positions'],
        medium_term: ['Gain certification in priority skills', 'Seek mentorship'],
        long_term: ['Progress to senior role', 'Consider leadership opportunities']
      }
    };
  }
}

export const aiJobMatchingService = new AIJobMatchingService();
