import { jobsService } from './jobs.service';
import { profileService } from './profile.service';
import { deepseekService } from './deepseek.service';
import { Job, Profile } from '../types/api';

export interface JobMatchRequest {
  profile: Profile;
  batchSize?: number;
  minMatchScore?: number;
  signal?: AbortSignal;
  pauseCheck?: () => boolean;
}

export interface JobMatchResult {
  job: Job;
  score: number;
  analysis: {
    matchPercentage: number;
    keyStrengths: string[];
    improvementAreas: string[];
    whyGoodFit: string;
    applicationTips: string[];
  };
  timestamp: Date;
}

export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedJobs: number;
  totalJobs: number;
  matches: JobMatchResult[];
}

type ProgressCallback = (progress: BatchProgress) => void;

class EnhancedJobMatchingService {
  private readonly BATCH_SIZE = 5;
  private readonly MIN_MATCH_SCORE = 60;
  private readonly API_DELAY = 1500; // Delay between batches

  async processJobMatching(
    request: JobMatchRequest,
    onProgress: ProgressCallback,
    onMatch: (match: JobMatchResult) => void
  ): Promise<JobMatchResult[]> {
    const { profile, batchSize = this.BATCH_SIZE, minMatchScore = this.MIN_MATCH_SCORE, signal, pauseCheck } = request;

    // Fetch all available jobs
    console.log('Fetching jobs for matching...');
    const jobsResponse = await jobsService.getJobs({
      is_active: true,
      page: 1,
      limit: 100
    });

    console.log('Jobs response:', jobsResponse);
    const allJobs = jobsResponse.jobs || [];
    console.log(`Found ${allJobs.length} jobs to process`);
    const totalBatches = Math.ceil(allJobs.length / batchSize);
    const matches: JobMatchResult[] = [];

    // Initial progress update
    onProgress({
      currentBatch: 0,
      totalBatches,
      processedJobs: 0,
      totalJobs: allJobs.length,
      matches: []
    });

    // Process jobs in batches
    for (let i = 0; i < allJobs.length; i += batchSize) {
      // Check if cancelled
      if (signal?.aborted) {
        break;
      }

      // Check if paused and wait
      while (pauseCheck && pauseCheck() && !signal?.aborted) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const batch = allJobs.slice(i, i + batchSize);
      const currentBatchNumber = Math.floor(i / batchSize) + 1;

      // Process batch
      const batchMatches = await this.processBatch(batch, profile, minMatchScore);

      // Add matches and notify
      for (const match of batchMatches) {
        matches.push(match);
        onMatch(match);
      }

      // Update progress
      onProgress({
        currentBatch: currentBatchNumber,
        totalBatches,
        processedJobs: Math.min(i + batchSize, allJobs.length),
        totalJobs: allJobs.length,
        matches: [...matches]
      });

      // Add delay between batches to prevent API throttling
      if (i + batchSize < allJobs.length && !signal?.aborted) {
        await new Promise(resolve => setTimeout(resolve, this.API_DELAY));
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private async processBatch(
    jobs: Job[],
    profile: Profile,
    minMatchScore: number
  ): Promise<JobMatchResult[]> {
    const matches: JobMatchResult[] = [];

    // Build profile context
    const profileContext = this.buildProfileContext(profile);

    // Process each job in the batch
    for (const job of jobs) {
      try {
        // Get full AI analysis for every job
        console.log(`Getting AI analysis for ${job.title}...`);
        const analysis = await this.getAIAnalysis(job, profile, profileContext);

        // Use AI's match percentage as the score
        if (analysis.matchPercentage >= minMatchScore) {
          const match: JobMatchResult = {
            job,
            score: analysis.matchPercentage,
            analysis,
            timestamp: new Date()
          };

          matches.push(match);
          console.log(`Added match for ${job.title} with AI score ${analysis.matchPercentage}`);
        } else {
          console.log(`Job ${job.title} scored ${analysis.matchPercentage}% - below threshold`);
        }
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        // Continue with next job even if one fails
      }
    }

    return matches;
  }

  private calculateBasicMatchScore(job: Job, profile: Profile): number {
    let score = 0;
    console.log(`\nCalculating match for ${job.title}:`);
    console.log('Profile skills:', profile.skills);
    console.log('Job skills:', job.skills_required);

    // Skills match (40% weight)
    const jobSkills = job.skills_required || [];
    const userSkills = profile.skills || [];
    const matchedSkills = jobSkills.filter((skill: string) =>
      userSkills.some((userSkill: string) =>
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    const skillScore = (matchedSkills.length / Math.max(jobSkills.length, 1)) * 40;
    console.log(`Matched skills: ${matchedSkills.length}/${jobSkills.length}, Score: ${skillScore}`);
    score += skillScore;

    // Experience match (30% weight)
    if (job.experience_level !== undefined && profile.experience_years !== undefined) {
      const expDiff = Math.abs(job.experience_level - profile.experience_years);
      const expScore = Math.max(0, 30 - expDiff * 5);
      console.log(`Experience: Job=${job.experience_level}, Profile=${profile.experience_years}, Diff=${expDiff}, Score: ${expScore}`);
      score += expScore;
    } else {
      console.log(`Experience: Using default score (15) - Job level: ${job.experience_level}, Profile years: ${profile.experience_years}`);
      score += 15; // Default experience score
    }

    // Location match (20% weight)
    if (job.location && profile.location) {
      const jobLocation = job.location.toLowerCase();
      const userLocation = profile.location.toLowerCase();
      let locScore = 0;

      if (jobLocation.includes('remote') || job.remote_friendly) {
        locScore = 20;
      } else if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
        locScore = 20;
      } else {
        locScore = 5; // Partial score for being in same country/region
      }
      console.log(`Location: Job=${job.location}, Profile=${profile.location}, Score: ${locScore}`);
      score += locScore;
    } else {
      console.log(`Location: Missing data - Job: ${job.location}, Profile: ${profile.location}`);
    }

    // Job type match (10% weight)
    if (job.job_type && profile.preferred_job_type) {
      let typeScore = 0;
      if (job.job_type === profile.preferred_job_type) {
        typeScore = 10;
      } else {
        typeScore = 5; // Partial score for different but compatible types
      }
      console.log(`Job type: Job=${job.job_type}, Profile=${profile.preferred_job_type}, Score: ${typeScore}`);
      score += typeScore;
    } else {
      console.log(`Job type: Missing data - Job: ${job.job_type}, Profile: ${profile.preferred_job_type}`);
    }

    const finalScore = Math.min(100, Math.round(score));
    console.log(`Total score for ${job.title}: ${finalScore}\n`);
    return finalScore;
  }

  private async getAIAnalysis(
    job: Job,
    profile: Profile,
    profileContext: string
  ): Promise<JobMatchResult['analysis']> {
    try {
      const prompt = `
        Analyze this job opportunity for the candidate and provide a personalized assessment.
        
        ${profileContext}
        
        JOB DETAILS:
        - Title: ${job.title}
        - Company: ${job.company}
        - Location: ${job.location}
        - Type: ${job.job_type || 'Not specified'}
        - Experience Level: ${job.experience_level || 'Not specified'}
        - Salary: ${job.salary_range || 'Not disclosed'}
        - Skills Required: ${job.skills_required?.join(', ') || 'Not specified'}
        - Description: ${job.description?.substring(0, 500) || 'No description'}
        - Remote: ${job.remote_friendly ? 'Yes' : 'No'}
        
        Provide a detailed analysis in the following JSON format:
        {
          "matchPercentage": <number 0-100>,
          "keyStrengths": [
            "Your experience in X directly aligns with...",
            "Your skill in Y would be valuable for...",
            "Your background demonstrates..."
          ],
          "improvementAreas": [
            "Consider highlighting your experience with...",
            "Emphasize your skills in..."
          ],
          "whyGoodFit": "This position is an excellent match because you have [specific strengths]. The role offers [specific benefits] that align with your goals of [career goals]. Your experience in [relevant experience] directly translates to their need for [job requirements].",
          "applicationTips": [
            "In your cover letter, specifically mention...",
            "Highlight your project where you...",
            "Research the company's recent..."
          ]
        }
        
        Make the analysis personal by using "you" and "your". Be specific and actionable.
      `;

      const response = await deepseekService.generateText(prompt);

      if (response.status === 'success') {
        try {
          // Clean and parse the response
          let cleanResponse = response.response.trim();

          // Remove markdown code blocks if present
          if (cleanResponse.includes('```json')) {
            cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```/g, '');
          }

          const analysis = JSON.parse(cleanResponse);

          // Ensure all required fields are present
          return {
            matchPercentage: analysis.matchPercentage || this.calculateBasicMatchScore(job, profile),
            keyStrengths: analysis.keyStrengths || ['Your skills align with this role'],
            improvementAreas: analysis.improvementAreas || ['Consider highlighting relevant experience'],
            whyGoodFit: analysis.whyGoodFit || 'This role matches your profile and career goals',
            applicationTips: analysis.applicationTips || ['Customize your resume for this role']
          };
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          return this.getFallbackAnalysis(job, profile);
        }
      }

      return this.getFallbackAnalysis(job, profile);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis(job, profile);
    }
  }

  private getFallbackAnalysis(job: Job, profile: Profile): JobMatchResult['analysis'] {
    const matchPercentage = this.calculateBasicMatchScore(job, profile);

    return {
      matchPercentage,
      keyStrengths: [
        `Your experience in ${profile.skills?.[0] || 'your field'} aligns with this role`,
        `Your ${profile.experience_years || 'professional'} years of experience matches their requirements`,
        'Your location and work preferences are compatible'
      ],
      improvementAreas: [
        'Consider highlighting specific projects relevant to this role',
        'Emphasize your teamwork and collaboration skills'
      ],
      whyGoodFit: `This position leverages your skills in ${profile.skills?.slice(0, 3).join(', ') || 'your area of expertise'}. The ${job.job_type || 'work'} arrangement and company culture appear to align with your preferences.`,
      applicationTips: [
        'Tailor your resume to highlight relevant experience',
        'Research the company culture and mention it in your cover letter',
        'Prepare examples that demonstrate your key skills'
      ]
    };
  }

  private buildProfileContext(profile: Profile): string {
    return `
      CANDIDATE PROFILE:
      - Name: ${profile.name}
      - Experience: ${profile.experience_years || 0} years
      - Current Location: ${profile.location || 'Not specified'}
      - Preferred Job Type: ${profile.preferred_job_type || 'Not specified'}
      - Skills: ${profile.skills?.join(', ') || 'Not specified'}
      - Languages: ${profile.languages?.join(', ') || 'Not specified'}
      - Bio: ${profile.bio || 'Not provided'}
      - Salary Expectation: ${profile.salary_expectation || 'Not specified'}
      - Work Authorization: ${profile.work_authorization || 'Not specified'}
      - Career Goals: Focus on growth, learning, and making an impact
    `;
  }
}

export const enhancedJobMatchingService = new EnhancedJobMatchingService();
