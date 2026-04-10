import { apiClient } from './api-client';
import { toast } from '@/components/ui/sonner';

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

class ApiClientEnhanced {
  private abortControllers = new Map<string, AbortController>();

  /**
   * Make an API request with retry logic
   */
  async requestWithRetry<T>(
    requestFn: (signal?: AbortSignal) => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const { maxRetries, retryDelay, retryableStatuses, onRetry } = {
      ...DEFAULT_RETRY_CONFIG,
      ...config,
    };

    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries!; attempt++) {
      try {
        const controller = new AbortController();
        const requestId = Date.now().toString();
        this.abortControllers.set(requestId, controller);
        
        const result = await requestFn(controller.signal);
        
        this.abortControllers.delete(requestId);
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if request was cancelled
        if (error.name === 'AbortError' || error.message === 'Request cancelled') {
          throw error;
        }
        
        // Check if error is retryable
        const isRetryable = 
          error.status && retryableStatuses!.includes(error.status) ||
          error.message?.includes('Network') ||
          error.message?.includes('timed out');
        
        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        // Wait before retrying with exponential backoff
        const delay = retryDelay! * Math.pow(2, attempt);
        console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests() {
    this.abortControllers.forEach(controller => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * GET request with retry
   */
  async get<T>(endpoint: string, config?: RetryConfig): Promise<T> {
    return this.requestWithRetry(
      (signal) => apiClient.get<T>(endpoint, { signal }),
      config
    );
  }

  /**
   * POST request with retry
   */
  async post<T>(endpoint: string, data?: any, config?: RetryConfig): Promise<T> {
    return this.requestWithRetry(
      (signal) => apiClient.post<T>(endpoint, data, { signal }),
      config
    );
  }

  /**
   * PUT request with retry
   */
  async put<T>(endpoint: string, data?: any, config?: RetryConfig): Promise<T> {
    return this.requestWithRetry(
      () => apiClient.put<T>(endpoint, data),
      config
    );
  }

  /**
   * DELETE request with retry
   */
  async delete<T>(endpoint: string, config?: RetryConfig): Promise<T> {
    return this.requestWithRetry(
      () => apiClient.delete<T>(endpoint),
      config
    );
  }

  /**
   * PATCH request with retry
   */
  async patch<T>(endpoint: string, data?: any, config?: RetryConfig): Promise<T> {
    return this.requestWithRetry(
      () => apiClient.patch<T>(endpoint, data),
      config
    );
  }
}

export const apiClientEnhanced = new ApiClientEnhanced();

/**
 * React hook for handling API requests with loading, error, and retry states
 */
export function useApiRequest<T>() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<T | null>(null);
  
  const execute = React.useCallback(async (
    requestFn: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      showErrorToast?: boolean;
      retryConfig?: RetryConfig;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiClientEnhanced.requestWithRetry(
        () => requestFn(),
        options?.retryConfig
      );
      
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err.message || 'An error occurred');
      setError(error);
      
      if (options?.showErrorToast !== false) {
        toast.error('Request Failed', {
          description: error.message,
        });
      }
      
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const retry = React.useCallback(() => {
    if (error) {
      setError(null);
      // Re-execute the last request
      // Implementation depends on storing the last request function
    }
  }, [error]);
  
  return {
    loading,
    error,
    data,
    execute,
    retry,
  };
}

// React import for hooks
import * as React from 'react';
