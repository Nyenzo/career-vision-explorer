import { jobsService } from './jobs.service';
import { profileService } from './profile.service';
import { aiJobMatchingService } from './ai-job-matching.service';
import { deepseekService } from './deepseek.service';

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requiredSkills: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillOverlap: number;
  experienceLevel?: string;
  postedDate?: string;
  // Additional fields
  benefits?: string[];
  remoteFriendly?: boolean;
  applicationDeadline?: string;
}

export interface MarketAnalysis {
  totalJobs: number;
  averageMatchScore: number;
  topMatches: JobMatch[];
  skillDemand: SkillDemandData[];
  insights: MarketInsight[];
  userSkillsCount: number;
  marketSkillsCount: number;
}

export interface SkillDemandData {
  skill: string;
  demand: number;
  percentage: number;
  averageSalary?: string;
}

export interface MarketInsight {
  type: 'strength' | 'opportunity' | 'gap' | 'trend';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

class JobMatchingService {

  /**
   * Calculate skill-based match score between user and job
   */
  private calculateMatchScore(userSkills: string[], jobSkills: string[]): {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    overlap: number;
  } {
    if (!jobSkills.length) return { score: 0, matchedSkills: [], missingSkills: [], overlap: 0 };

    // Normalize skills for better matching (case-insensitive, trim spaces)
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());

    // Find exact matches
    const exactMatches = normalizedJobSkills.filter(jobSkill =>
      normalizedUserSkills.includes(jobSkill)
    );

    // Find partial matches (e.g., "React" matches "React.js")
    const partialMatches = normalizedJobSkills.filter(jobSkill =>
      !exactMatches.includes(jobSkill) &&
      normalizedUserSkills.some(userSkill =>
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )
    );

    const totalMatches = exactMatches.length + (partialMatches.length * 0.7); // Partial matches count as 70%
    const matchPercentage = (totalMatches / normalizedJobSkills.length) * 100;

    // Get original case skills for display
    const matchedSkills = jobSkills.filter(jobSkill =>
      exactMatches.includes(jobSkill.toLowerCase().trim()) ||
      partialMatches.includes(jobSkill.toLowerCase().trim())
    );

    const missingSkills = jobSkills.filter(jobSkill =>
      !matchedSkills.some(matched => matched.toLowerCase().trim() === jobSkill.toLowerCase().trim())
    );

    return {
      score: Math.round(Math.min(matchPercentage, 100)),
      matchedSkills,
      missingSkills,
      overlap: totalMatches
    };
  }

  /**
   * Analyze user's market competitiveness across all jobs with AI enhancement
   */
  async analyzeJobMarket(): Promise<MarketAnalysis> {
    try {
      // Get user profile and skills
      const userProfile = await profileService.getProfile();
      const userSkills = userProfile.skills || [];

      // Get all active job listings
      const jobsResponse = await jobsService.getJobs({
        is_active: true,
        page: 1,
        limit: 100, // Get more jobs for better analysis
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      const jobs = jobsResponse.jobs || [];

      if (!jobs.length) {
        // Return analysis with mock data if no real jobs
        return this.getMockMarketAnalysis();
      }

      // Calculate matches for each job with AI enhancement
      const jobMatches: JobMatch[] = await this.calculateEnhancedJobMatches(userProfile, jobs);

      // Calculate market statistics
      const averageMatchScore = jobMatches.length > 0
        ? Math.round(jobMatches.reduce((sum, job) => sum + job.matchScore, 0) / jobMatches.length)
        : 0;

      // Get top 10 matches
      const topMatches = jobMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      // Analyze skill demand across all jobs
      const skillDemand = this.analyzeSkillDemand(jobs);

      // Generate AI-powered market insights
      const marketInsights = await this.generateAIMarketInsights(userProfile, jobMatches, skillDemand);

      // Count unique skills in market
      const allMarketSkills = new Set();
      jobs.forEach(job => {
        const skills = job.skills_required || job.skills || [];
        skills.forEach(skill => allMarketSkills.add(skill.toLowerCase().trim()));
      });

      return {
        totalJobs: jobs.length,
        averageMatchScore,
        topMatches,
        skillDemand,
        insights: marketInsights,
        userSkillsCount: userSkills.length,
        marketSkillsCount: allMarketSkills.size
      };

    } catch (error) {
      console.error('Error analyzing job market:', error);
      // Return mock data as fallback
      return this.getMockMarketAnalysis();
    }
  }

  /**
   * Analyze skill demand across job listings
   */
  private analyzeSkillDemand(jobs: any[]): SkillDemandData[] {
    const skillCounts = new Map<string, number>();

    jobs.forEach(job => {
      const skills = job.skills_required || job.skills || [];
      skills.forEach(skill => {
        const normalizedSkill = skill.toLowerCase().trim();
        skillCounts.set(normalizedSkill, (skillCounts.get(normalizedSkill) || 0) + 1);
      });
    });

    const totalJobs = jobs.length;

    return Array.from(skillCounts.entries())
      .map(([skill, count]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize
        demand: count,
        percentage: Math.round((count / totalJobs) * 100)
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 20); // Top 20 most demanded skills
  }

  /**
   * Generate actionable market insights
   */
  private generateMarketInsights(
    userSkills: string[],
    jobMatches: JobMatch[],
    skillDemand: SkillDemandData[]
  ): MarketInsight[] {
    const insights: MarketInsight[] = [];
    const averageScore = jobMatches.length > 0
      ? jobMatches.reduce((sum, job) => sum + job.matchScore, 0) / jobMatches.length
      : 0;

    // Strength analysis
    if (averageScore >= 80) {
      insights.push({
        type: 'strength',
        title: 'Strong Market Position',
        description: `Your skills align well with ${Math.round(averageScore)}% of job requirements on average.`,
        action: 'Focus on applying to high-match positions and consider leadership roles.',
        priority: 'high'
      });
    }

    // Opportunity analysis
    const highDemandSkills = skillDemand.slice(0, 5);
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const missingHighDemandSkills = highDemandSkills.filter(skill =>
      !userSkillsLower.includes(skill.skill.toLowerCase())
    );

    if (missingHighDemandSkills.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'High-Demand Skills Gap',
        description: `Consider learning ${missingHighDemandSkills[0].skill} - it's required in ${missingHighDemandSkills[0].percentage}% of jobs.`,
        action: `Start with ${missingHighDemandSkills[0].skill} courses or certifications.`,
        priority: 'high'
      });
    }

    // Gap analysis
    if (averageScore < 60) {
      insights.push({
        type: 'gap',
        title: 'Skill Development Needed',
        description: 'Your current skills match fewer than 60% of job requirements on average.',
        action: 'Focus on building foundational skills in your target industry.',
        priority: 'high'
      });
    }

    // Trend analysis
    const topSkillsYouHave = userSkills.filter(userSkill =>
      skillDemand.some(demand => demand.skill.toLowerCase() === userSkill.toLowerCase())
    );

    if (topSkillsYouHave.length > 0) {
      insights.push({
        type: 'trend',
        title: 'Market-Relevant Skills',
        description: `You have ${topSkillsYouHave.length} skills that are in high market demand.`,
        action: 'Highlight these skills prominently in your applications.',
        priority: 'medium'
      });
    }

    return insights;
  }

  /**
   * Calculate enhanced job matches using AI assistance
   */
  private async calculateEnhancedJobMatches(userProfile: any, jobs: any[]): Promise<JobMatch[]> {
    try {
      // Use AI job matching service for enhanced scoring
      const aiMatches = await aiJobMatchingService.matchJobsWithAI(userProfile, {
        max_results: 50,
        min_match_score: 30
      });

      // If AI matching succeeds, convert to JobMatch format
      if (aiMatches.length > 0) {
        return aiMatches.map(aiMatch => ({
          id: aiMatch.id,
          title: aiMatch.title,
          company: aiMatch.company,
          location: aiMatch.location,
          type: aiMatch.type,
          salary: aiMatch.salary,
          description: aiMatch.description,
          requiredSkills: aiMatch.requiredSkills,
          matchScore: aiMatch.ai_score.overall_score,
          matchedSkills: aiMatch.matchedSkills,
          missingSkills: aiMatch.missingSkills,
          skillOverlap: aiMatch.skillOverlap,
          experienceLevel: aiMatch.experienceLevel,
          postedDate: aiMatch.postedDate
        }));
      }
    } catch (error) {
      console.error('AI matching failed, falling back to basic matching:', error);
    }

    // Fallback to basic skill-based matching
    return this.calculateBasicJobMatches(userProfile, jobs);
  }

  /**
   * Basic job matching fallback
   */
  private calculateBasicJobMatches(userProfile: any, jobs: any[]): JobMatch[] {
    const userSkills = userProfile.skills || [];

    return jobs.map(job => {
      const jobSkills = job.skills_required || job.skills || [];
      const matchData = this.calculateMatchScore(userSkills, jobSkills);

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.job_type || 'Full-time',
        salary: job.salary_range || 'Competitive',
        description: job.description || '',
        requiredSkills: jobSkills,
        matchScore: matchData.score,
        matchedSkills: matchData.matchedSkills,
        missingSkills: matchData.missingSkills,
        skillOverlap: matchData.overlap,
        experienceLevel: job.experience_level,
        postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'
      };
    });
  }

  /**
   * Generate AI-powered market insights
   */
  private async generateAIMarketInsights(
    userProfile: any,
    jobMatches: JobMatch[],
    skillDemand: SkillDemandData[]
  ): Promise<MarketInsight[]> {
    try {
      const userSkills = userProfile.skills || [];
      const averageScore = jobMatches.length > 0
        ? jobMatches.reduce((sum, job) => sum + job.matchScore, 0) / jobMatches.length
        : 0;

      const prompt = `
        Analyze this job seeker's market position and provide actionable insights:
        
        Profile Summary:
        - Skills: ${userSkills.join(', ')}
        - Experience: ${userProfile.experience_years || 0} years
        - Location: ${userProfile.location || 'Not specified'}
        - Average Match Score: ${Math.round(averageScore)}%
        - Total Jobs Analyzed: ${jobMatches.length}
        
        Top 5 Skills in Demand:
        ${skillDemand.slice(0, 5).map(skill => `${skill.skill}: ${skill.percentage}% of jobs`).join('\n')}
        
        Based on this data, provide 3-5 strategic insights in JSON format:
        {
          "insights": [
            {
              "type": "strength|opportunity|gap|trend",
              "title": "Brief insight title",
              "description": "Detailed analysis",
              "action": "Specific actionable recommendation",
              "priority": "high|medium|low"
            }
          ]
        }
        
        Focus on practical, actionable advice for career advancement.
      `;

      const response = await deepseekService.generateText(prompt);

      if (response.status === 'success') {
        try {
          const aiInsights = JSON.parse(response.response);
          return aiInsights.insights || [];
        } catch {
          // Parse error, fallback to basic insights
          return this.generateMarketInsights(userSkills, jobMatches, skillDemand);
        }
      }
    } catch (error) {
      console.error('AI insights generation failed:', error);
    }

    // Fallback to basic insights
    return this.generateMarketInsights(userProfile.skills || [], jobMatches, skillDemand);
  }

  /**
   * Get specific job matches with detailed analysis
   */
  async getJobMatches(filters?: {
    minMatchScore?: number;
    skills?: string[];
    location?: string;
    jobType?: string;
  }): Promise<JobMatch[]> {
    const analysis = await this.analyzeJobMarket();
    let matches = analysis.topMatches;

    // Apply filters
    if (filters?.minMatchScore) {
      matches = matches.filter(job => job.matchScore >= filters.minMatchScore!);
    }

    if (filters?.location) {
      matches = matches.filter(job =>
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.jobType) {
      matches = matches.filter(job =>
        job.type.toLowerCase() === filters.jobType!.toLowerCase()
      );
    }

    return matches;
  }

  /**
   * Fallback mock data for when backend is unavailable
   */
  private getMockMarketAnalysis(): MarketAnalysis {
    const mockJobMatches: JobMatch[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'Tech Solutions Ltd',
        location: 'Nairobi, Kenya',
        type: 'Full-time',
        salary: '80K-120K KES/month',
        description: 'Build responsive web applications using React and TypeScript.',
        requiredSkills: ['React', 'JavaScript', 'CSS', 'HTML'],
        matchScore: 95,
        matchedSkills: ['React', 'JavaScript', 'CSS'],
        missingSkills: ['HTML'],
        skillOverlap: 3,
        experienceLevel: 'Mid Level',
        postedDate: '2 days ago'
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        type: 'Full-time',
        salary: '100K-150K KES/month',
        description: 'Work on both frontend and backend systems.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        matchScore: 75,
        matchedSkills: ['React', 'Node.js'],
        missingSkills: ['MongoDB', 'Express'],
        skillOverlap: 2,
        experienceLevel: 'Senior',
        postedDate: '1 week ago'
      }
    ];

    const mockSkillDemand: SkillDemandData[] = [
      { skill: 'JavaScript', demand: 45, percentage: 75 },
      { skill: 'React', demand: 38, percentage: 63 },
      { skill: 'Python', demand: 32, percentage: 53 },
      { skill: 'CSS', demand: 28, percentage: 47 },
      { skill: 'Node.js', demand: 25, percentage: 42 }
    ];

    const mockInsights: MarketInsight[] = [
      {
        type: 'strength',
        title: 'Strong Frontend Skills',
        description: 'Your React and JavaScript skills are highly valued in the market.',
        action: 'Focus on frontend positions with companies using modern frameworks.',
        priority: 'high'
      }
    ];

    return {
      totalJobs: 60,
      averageMatchScore: 78,
      topMatches: mockJobMatches,
      skillDemand: mockSkillDemand,
      insights: mockInsights,
      userSkillsCount: 8,
      marketSkillsCount: 45
    };
  }
}

export const jobMatchingService = new JobMatchingService();
