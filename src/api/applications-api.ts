// Applications API - now using real backend integration
import { applicationsService, ApplicationFilters } from '../../services/applications.service';
import { Application, ApplicationCreate, ApplicationUpdate, PaginatedResponse } from '../../types/api';

export class ApplicationsApi {
  static async getApplications(filters?: ApplicationFilters): Promise<PaginatedResponse<Application>> {
    return applicationsService.getApplications(filters);
  }

  static async getApplicationById(applicationId: string): Promise<Application> {
    return applicationsService.getApplicationById(applicationId);
  }

  static async submitApplication(applicationData: ApplicationCreate): Promise<Application> {
    return applicationsService.createApplication(applicationData);
  }

  static async updateApplication(applicationId: string, applicationData: ApplicationUpdate): Promise<Application> {
    return applicationsService.updateApplication(applicationId, applicationData);
  }

  static async withdrawApplication(applicationId: string): Promise<{ message: string }> {
    return applicationsService.withdrawApplication(applicationId);
  }

  static async getMyApplications(): Promise<Application[]> {
    return applicationsService.getMyApplications();
  }

  // For employers - get applications for their jobs
  static async getJobApplications(jobId: string): Promise<Application[]> {
    return applicationsService.getJobApplications(jobId);
  }


  // Utility methods
  static getStatusColor(status: string): string {
    const statusColors = {
      'Pending': 'yellow',
      'Reviewed': 'blue',
      'Accepted': 'green',
      'Rejected': 'red'
    };
    return statusColors[status as keyof typeof statusColors] || 'gray';
  }

  static getStatusIcon(status: string): string {
    const statusIcons = {
      'Pending': '⏳',
      'Reviewed': '👀',
      'Accepted': '✅',
      'Rejected': '❌'
    };
    return statusIcons[status as keyof typeof statusIcons] || '📄';
  }

  static formatApplicationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }
}
