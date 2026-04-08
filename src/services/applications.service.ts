import { apiClient } from '../lib/api-client';
import { Application, ApplicationCreate, ApplicationUpdate, PaginatedResponse } from '../types/api';

export interface ApplicationFilters {
  status_filter?: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  job_id?: string;
  page?: number;
  limit?: number;
}

class ApplicationsService {
  async getApplications(filters?: ApplicationFilters): Promise<PaginatedResponse<Application>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/applications/?${queryString}` : '/applications/';
    
    return await apiClient.get<PaginatedResponse<Application>>(endpoint);
  }

  async getApplicationById(applicationId: string): Promise<Application> {
    return await apiClient.get<Application>(`/applications/${applicationId}`);
  }

  async createApplication(applicationData: ApplicationCreate, resumeFile: File | null): Promise<Application> {
    // If no resume file, send as JSON
    if (!resumeFile) {
      return await apiClient.post<Application>('/applications/', applicationData);
    }
    
    // If resume file exists, use FormData
    const formData = new FormData();
    formData.append('job_id', applicationData.job_id);
    formData.append('cover_letter', applicationData.cover_letter);
    formData.append('resume_file', resumeFile);

    return await apiClient.post<Application>('/applications/', formData);
  }

  async updateApplication(applicationId: string, applicationData: ApplicationUpdate): Promise<Application> {
    return await apiClient.put<Application>(`/applications/${applicationId}`, applicationData);
  }

  async withdrawApplication(applicationId: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/applications/${applicationId}`);
  }

  async getMyApplications(status_filter?: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected'): Promise<Application[]> {
    const endpoint = status_filter ? `/applications/my?status_filter=${status_filter}` : '/applications/my';
    return await apiClient.get<Application[]>(endpoint);
  }

  // For employers - get applications for their jobs
  async getJobApplications(jobId: string, status_filter?: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected'): Promise<Application[]> {
    const endpoint = status_filter ? `/applications/job/${jobId}?status_filter=${status_filter}` : `/applications/job/${jobId}`;
    return await apiClient.get<Application[]>(endpoint);
  }

  async reviewApplication(applicationId: string, status: 'Reviewed' | 'Accepted' | 'Rejected', notes?: string): Promise<Application> {
    // Use query parameters as the backend expects
    const params = new URLSearchParams({
      status: status,
      ...(notes && { notes })
    });
    return await apiClient.post<Application>(`/applications/${applicationId}/review?${params.toString()}`);
  }

  // Application analytics
  async getApplicationStats(): Promise<{
    total_applications: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  }> {
    return await apiClient.get('/applications/stats');
  }

  // For employers - get all applications for their posted jobs
  // Uses the standard applications endpoint which returns applications based on user role
  async getEmployerApplications(): Promise<Application[]> {
    // The backend returns applications based on the authenticated user's role
    // For employers, it returns applications for their job postings
    const response = await apiClient.get<PaginatedResponse<Application>>('/applications/');
    return response.applications || [];
  }

}

export const applicationsService = new ApplicationsService();