import { ApiError, NetworkError, TimeoutError } from './api-client';

/**
 * Error handler utility for API calls in React components
 * Provides user-friendly error messages and prevents UI freezes
 */

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export class ApiErrorHandler {
  /**
   * Get a user-friendly error message from an error
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return `The request is taking longer than expected. Please try again or check your connection.`;
    }
    
    if (error instanceof NetworkError) {
      return error.message;
    }
    
    if (error instanceof ApiError) {
      // Use the error message which already has user-friendly text
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
  
  /**
   * Check if the error is retryable
   */
  static isRetryable(error: unknown): boolean {
    return error instanceof NetworkError || error instanceof TimeoutError;
  }
  
  /**
   * Check if the error is due to authentication
   */
  static isAuthError(error: unknown): boolean {
    return error instanceof ApiError && error.status === 401;
  }
  
  /**
   * Handle error with optional toast notification
   */
  static handle(error: unknown, options: ErrorHandlerOptions = {}): string {
    const { logError = true, fallbackMessage } = options;
    
    if (logError) {
      console.error('API Error:', error);
    }
    
    const message = fallbackMessage || this.getUserMessage(error);
    
    // You can integrate with your toast library here
    // if (showToast) {
    //   toast.error(message);
    // }
    
    return message;
  }
  
  /**
   * Create an error boundary error handler
   */
  static createErrorBoundaryHandler(fallback?: React.ComponentType<{ error: Error }>) {
    return class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean; error: Error | null }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
      }
      
      render() {
        if (this.state.hasError && this.state.error) {
          const FallbackComponent = fallback;
          if (FallbackComponent) {
            return <FallbackComponent error={this.state.error} />;
          }
          
          return (
            <div className="error-boundary-fallback p-4 text-center">
              <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
              <p className="mt-2 text-gray-600">{ApiErrorHandler.getUserMessage(this.state.error)}</p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try again
              </button>
            </div>
          );
        }
        
        return this.props.children;
      }
    };
  }
}

// React hook for handling API errors
export function useApiError() {
  const [error, setError] = React.useState<Error | null>(null);
  const [isRetryable, setIsRetryable] = React.useState(false);
  
  const handleError = React.useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
      setIsRetryable(ApiErrorHandler.isRetryable(error));
    } else {
      setError(new Error('An unexpected error occurred'));
      setIsRetryable(false);
    }
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
    setIsRetryable(false);
  }, []);
  
  const errorMessage = error ? ApiErrorHandler.getUserMessage(error) : null;
  
  return {
    error,
    errorMessage,
    isRetryable,
    handleError,
    clearError,
  };
}

// Higher-order function for wrapping async operations with error handling
export function withApiErrorHandling<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options?: ErrorHandlerOptions
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const message = ApiErrorHandler.handle(error, options);
      throw new Error(message);
    }
  }) as T;
}

// React is imported at the top for TypeScript types, but we need to ensure it's available
import * as React from 'react';
