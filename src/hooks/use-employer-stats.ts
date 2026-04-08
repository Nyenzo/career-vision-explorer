import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { useMemo, useEffect } from 'react';
import { useApiErrorHandler } from './use-api-error-handler';
import { employerMockService } from '@/services/employer-mock.service';
import { toast } from 'sonner';

export interface EmployerStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  companiesCount: number;
  locationsCount: number;
  avgApplicationsPerJob: number;
  // Calculated fields for UI
  inactiveJobs: number;
  applicationRate: number;
}

const EMPLOYER_STATS_QUERY_KEY = 'employer-stats';

export const useEmployerStats = () => {
  const { handleApiError } = useApiErrorHandler();
  
  const {
    data: rawStats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [EMPLOYER_STATS_QUERY_KEY],
    queryFn: async () => {
      try {
        return await jobsService.getMyJobStats();
      } catch (error: any) {
        // Use mock data as fallback for network errors or 404s
        if (error.response?.status === 404 || error.response?.status === 500 || 
            error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
          console.warn('API failed, using mock data for employer stats');
          toast.info('Using demo data. Some features may be limited.');
          return await employerMockService.getEmployerStats();
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep cache for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle API errors with proper redirects for 401/403
  useEffect(() => {
    if (error) {
      handleApiError(error, 'Failed to load employer statistics');
    }
  }, [error, handleApiError]);

  // Transform API response to UI-friendly format
  const stats: EmployerStats | null = useMemo(() => {
    if (!rawStats) return null;

    return {
      totalJobs: rawStats.total_jobs,
      activeJobs: rawStats.active_jobs,
      totalApplications: rawStats.total_applications,
      companiesCount: rawStats.companies_count,
      locationsCount: rawStats.locations_count,
      avgApplicationsPerJob: rawStats.avg_applications_per_job,
      // Calculate additional fields
      inactiveJobs: rawStats.total_jobs - rawStats.active_jobs,
      applicationRate: rawStats.total_jobs > 0 
        ? (rawStats.total_applications / rawStats.total_jobs) * 100 
        : 0,
    };
  }, [rawStats]);

  // Calculate percentage changes (mock data for now since API doesn't provide historical data)
  const percentageChanges = useMemo(() => {
    return {
      totalJobsChange: 12.5, // These would come from comparing with previous period
      activeJobsChange: 8.3,
      applicationsChange: 15.7,
      avgApplicationsChange: 5.2,
    };
  }, []);

  return {
    stats,
    isLoading,
    error: error?.message || null,
    refetch,
    percentageChanges,
  };
};
