import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';
import { toast } from '@/components/ui/sonner';

interface ApiError extends Error {
  status?: number;
  response?: any;
}

export const useApiErrorHandler = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleApiError = useCallback((error: unknown, customMessage?: string) => {
    console.error('API Error:', error);

    if (error instanceof Error) {
      const apiError = error as ApiError;

      // Handle 401 Unauthorized - Authentication required
      if (apiError.status === 401) {
        toast.error("Session Expired", {
          description: "Your session has expired. Please log in again.",
        });
        
        // Clear auth state and redirect to login
        logout();
        
        // Redirect to appropriate login page with return URL
        const currentPath = window.location.pathname;
        const loginUrl = currentPath.startsWith('/employer') ? '/admin/login' : '/login';
        navigate(`${loginUrl}?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      // Handle 403 Forbidden - Insufficient permissions
      if (apiError.status === 403) {
        toast.error("Access Denied", {
          description: customMessage || "You don't have permission to perform this action.",
        });
        
        // Redirect to appropriate dashboard based on user role
        if (user) {
          switch (user.account_type) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'employer':
              navigate('/employer/dashboard');
              break;
            case 'job_seeker':
              navigate('/jobseeker/dashboard');
              break;
            case 'freelancer':
              navigate('/freelancer/dashboard');
              break;
            default:
              navigate('/');
          }
        } else {
          navigate('/');
        }
        return;
      }

      // Handle other errors
      const errorMessage = apiError.response?.detail || apiError.message || customMessage || 'An unexpected error occurred';
      toast.error("Error", {
        description: errorMessage,
      });
    } else {
      // Handle non-Error objects
      toast.error("Error", {
        description: customMessage || 'An unexpected error occurred',
      });
    }
  }, [navigate, logout, user]);

  return { handleApiError };
};

// Wrapper function to handle API calls with error handling
export const withApiErrorHandler = async <T>(
  apiCall: () => Promise<T>,
  errorHandler: (error: unknown) => void,
  customErrorMessage?: string
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    errorHandler(error);
    return null;
  }
};
