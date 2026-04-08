import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services/applications.service';
import { Application, ApplicationUpdate } from '@/types/api';
import { toast } from 'sonner';
import { useState, useMemo, useEffect } from 'react';
import { employerMockService } from '@/services/employer-mock.service';
import { useApiErrorHandler } from './use-api-error-handler';

export interface EmployerApplication extends Application {
  id: string;
  appliedDate: string;
  applicantInfo: {
    name: string;
    email: string;
  };
  jobInfo: {
    title: string;
    company: string;
  };
}

// Helper to transform API Application into UI EmployerApplication shape
function toEmployerApplication(app: Application): EmployerApplication {
  return {
    ...app,
    id: app.application_id,
    appliedDate: new Date(app.applied_at).toLocaleDateString(),
    applicantInfo: {
      name: app.applicant_name || 'Unknown Applicant',
      email: app.applicant_email || '',
    },
    jobInfo: {
      title: app.job_title || app.job?.title || '',
      company: app.company_name || app.job?.company || '',
    },
  };
}

function toEmployerApplications(apps: Application[]): EmployerApplication[] {
  return apps.map(toEmployerApplication);
}

const EMPLOYER_APPLICATIONS_QUERY_KEY = 'employer-applications';

export const useEmployerApplications = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { handleApiError } = useApiErrorHandler();

  // Fetch all applications for employer's jobs
  const {
    data: applications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Application[], Error>({
    queryKey: [EMPLOYER_APPLICATIONS_QUERY_KEY],
    queryFn: async () => {
      try {
        // Fetch all applications for employer's jobs
        const response = await applicationsService.getEmployerApplications();
        return response; // Return the applications directly
      } catch (error: any) {
        // Use mock data as fallback for network errors or 404s
        if (error.response?.status === 404 || error.response?.status === 500 || 
            error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
          console.warn('API failed, using mock data for employer applications');
          toast.info('Using demo data. Some features may be limited.');
          return await employerMockService.getEmployerApplications();
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle API errors with proper redirects for 401/403
  useEffect(() => {
    if (error) {
      handleApiError(error, 'Failed to load employer applications');
    }
  }, [error, handleApiError]);

  // Transform applications to employer format
  const employerApplications = useMemo(() => toEmployerApplications(applications), [applications]);

  // Filter applications based on status, job, and search
  const filteredApplications = useMemo(() => {
    return employerApplications.filter(app => {
      const matchesStatus = 
        statusFilter === 'all' || 
        app.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesJob = 
        jobFilter === 'all' || 
        app.job_id === jobFilter;

      const matchesSearch = 
        searchQuery === '' ||
        app.applicantInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobInfo.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesJob && matchesSearch;
    });
  }, [employerApplications, statusFilter, jobFilter, searchQuery]);

  // Review application mutation
  const reviewApplicationMutation = useMutation<
    Application, 
    Error, 
    { applicationId: string; status: 'Reviewed' | 'Accepted' | 'Rejected'; notes?: string }
  >({
    mutationFn: ({ applicationId, status, notes }) => 
      applicationsService.reviewApplication(applicationId, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_APPLICATIONS_QUERY_KEY] });
      toast.success(`Application ${variables.status.toLowerCase()} successfully`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update application status');
    },
  });

  // Get applications for a specific job
  const getApplicationsForJob = async (jobId: string) => {
    try {
      return await applicationsService.getJobApplications(jobId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch job applications');
      return [];
    }
  };

  // Get application statistics
  const stats = useMemo(() => {
    const total = employerApplications.length;
    const pending = employerApplications.filter(app => app.status === 'Pending').length;
    const reviewed = employerApplications.filter(app => app.status === 'Reviewed').length;
    const accepted = employerApplications.filter(app => app.status === 'Accepted').length;
    const rejected = employerApplications.filter(app => app.status === 'Rejected').length;

    return {
      total,
      pending,
      reviewed,
      accepted,
      rejected,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
    };
  }, [employerApplications]);

  // Get unique jobs for filtering
  const uniqueJobs = useMemo(() => {
    const jobMap = new Map<string, { id: string; title: string; company: string }>();
    
    employerApplications.forEach(app => {
      if (!jobMap.has(app.job_id)) {
        jobMap.set(app.job_id, {
          id: app.job_id,
          title: app.jobInfo.title,
          company: app.jobInfo.company,
        });
      }
    });

    return Array.from(jobMap.values());
  }, [employerApplications]);

  return {
    applications: employerApplications,
    filteredApplications,
    isLoading: isLoading || reviewApplicationMutation.isPending,
    error: error?.message || null,
    refetch,
    statusFilter,
    setStatusFilter,
    jobFilter,
    setJobFilter,
    searchQuery,
    setSearchQuery,
    reviewApplication: (applicationId: string, status: 'Reviewed' | 'Accepted' | 'Rejected', notes?: string) => 
      reviewApplicationMutation.mutate({ applicationId, status, notes }),
    getApplicationsForJob,
    stats,
    uniqueJobs,
  };
};
