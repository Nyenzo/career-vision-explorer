import { useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services';
import { Application } from '@/types/api';
import { useMemo } from 'react';

const APPLICATIONS_QUERY_KEY = 'applications';

export const useJobApplications = () => {
  const { data: applications = [], isLoading, error, refetch } = useQuery<Application[], Error>({
    queryKey: [APPLICATIONS_QUERY_KEY],
    queryFn: () => applicationsService.getMyApplications(),
    retry: (failureCount, error) => {
      // Don't retry on 403 errors (forbidden)
      if (error.message?.includes('403') || error.message?.includes('Only job seekers')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error) => {
      // Silently handle 403 errors for non-job seekers
      if (error.message?.includes('403') || error.message?.includes('Only job seekers')) {
        console.log('User is not a job seeker, applications not available');
      }
    }
  });

  const getApplicationForJob = useMemo(() => {
    return (jobId: string) => applications.find(app => app.job_id === jobId);
  }, [applications]);

  return {
    applications,
    isLoading,
    error: error ? error.message : null,
    refetch,
    getApplicationForJob,
  };
};
