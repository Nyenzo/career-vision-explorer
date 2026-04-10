// Mock data service for demo purposes
import { Job } from '@/types';

interface MockDataConfig {
  useMockData: boolean;
  mockDataPath?: string;
}

class MockDataService {
  private jobs: Job[] = [];
  private isLoaded = false;
  private config: MockDataConfig = {
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true' || true, // Default to true for demo
  };

  async loadMockJobs(): Promise<Job[]> {
    if (this.isLoaded) {
      return this.jobs;
    }

    try {
      // Dynamic import of JSON data
      const mockData = await import('@/data/mock/jobs.json');
      this.jobs = mockData.default || mockData;
      this.isLoaded = true;
      
      console.log(`Loaded ${this.jobs.length} mock jobs from JSON file`);
      return this.jobs;
    } catch (error) {
      console.error('Failed to load mock jobs data:', error);
      // Return empty array if loading fails
      return [];
    }
  }

  async getJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    company?: string;
    skills?: string[];
    is_active?: boolean;
    remote_friendly?: boolean;
  }): Promise<{ jobs: Job[]; total: number }> {
    const jobs = await this.loadMockJobs();
    
    let filteredJobs = [...jobs];

    // Apply filters
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    }

    if (params?.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location?.toLowerCase().includes(params.location!.toLowerCase())
      );
    }

    if (params?.company) {
      filteredJobs = filteredJobs.filter(job => 
        job.company.toLowerCase().includes(params.company!.toLowerCase())
      );
    }

    if (params?.skills && params.skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => {
        const jobSkills = job.skills_required || [];
        return params.skills!.some(skill => 
          jobSkills.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });
    }

    if (params?.is_active !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.is_active === params.is_active);
    }

    if (params?.remote_friendly !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.remote_friendly === params.remote_friendly);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length
    };
  }

  async getJobById(id: string): Promise<Job | null> {
    const jobs = await this.loadMockJobs();
    return jobs.find(job => job.id === id) || null;
  }

  async getJobStats(): Promise<any> {
    const jobs = await this.loadMockJobs();
    
    const activeJobs = jobs.filter(job => job.is_active);
    const companies = new Set(jobs.map(job => job.company));
    const locations = new Set(jobs.map(job => job.location?.split(',')[0]?.trim()).filter(Boolean));
    
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
    const avgApplicationsPerJob = jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0;

    return {
      total_jobs: jobs.length,
      active_jobs: activeJobs.length,
      companies_count: companies.size,
      locations_count: locations.size,
      avg_applications_per_job: avgApplicationsPerJob,
      total_applications: totalApplications,
      remote_jobs: jobs.filter(job => job.remote_friendly).length,
      jobs_by_location: Array.from(locations).map(location => ({
        location,
        count: jobs.filter(job => job.location?.includes(location as string)).length
      })).sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }

  async searchJobs(query: string): Promise<Job[]> {
    const { jobs } = await this.getJobs({ search: query, limit: 50 });
    return jobs;
  }

  isUsingMockData(): boolean {
    return this.config.useMockData;
  }
}

export const mockDataService = new MockDataService();
