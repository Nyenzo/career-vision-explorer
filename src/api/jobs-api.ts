// Jobs API - now using real backend integration
import { jobsService, JobSearchParams } from '../../services/jobs.service';
import { Job, JobCreate, JobUpdate, PaginatedResponse } from '../../types/api';

export class JobsApi {
  static async searchJobs(params?: JobSearchParams): Promise<PaginatedResponse<Job>> {
    return jobsService.getJobs(params);
  }

  static async getJobById(jobId: string): Promise<Job> {
    return jobsService.getJobById(jobId);
  }

  static async createJob(jobData: JobCreate): Promise<Job> {
    return jobsService.createJob(jobData);
  }

  static async updateJob(jobId: string, jobData: JobUpdate): Promise<Job> {
    return jobsService.updateJob(jobId, jobData);
  }

  static async deleteJob(jobId: string): Promise<{ message: string }> {
    return jobsService.deleteJob(jobId);
  }

  static async getMyJobs(): Promise<Job[]> {
    return jobsService.getMyJobs();
  }


  // Utility methods for frontend
  static formatSalaryRange(job: Job): string {
    return job.salary_range || 'Salary not disclosed';
  }

  static isJobActive(job: Job): boolean {
    return job.is_active;
  }

  static getJobAge(job: Job): number {
    const created = new Date(job.created_at);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }
}
