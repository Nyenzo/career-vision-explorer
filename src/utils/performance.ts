import { toast } from 'sonner';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private slowOperations: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    options: {
      warningThreshold?: number; // milliseconds
      errorThreshold?: number; // milliseconds
      showToast?: boolean;
    } = {}
  ): Promise<T> {
    const {
      warningThreshold = 5000, // 5 seconds
      errorThreshold = 15000, // 15 seconds
      showToast = true
    } = options;

    return new Promise(async (resolve, reject) => {
      const startTime = performance.now();

      // Show loading toast for operations that might be slow
      let warningToastId: string | number | undefined;
      let errorToastId: string | number | undefined;

      const warningTimer = setTimeout(() => {
        if (showToast) {
          warningToastId = toast.loading(
            `${operationName} is taking longer than expected...`,
            {
              description: 'The database might be slow. Please wait.',
              duration: Infinity
            }
          );
        }
        console.warn(`⚠️ Slow operation detected: ${operationName} (>${warningThreshold}ms)`);
      }, warningThreshold);

      const errorTimer = setTimeout(() => {
        if (showToast) {
          if (warningToastId) toast.dismiss(warningToastId);
          errorToastId = toast.error(
            `${operationName} is experiencing delays`,
            {
              description: 'Database connection issues detected. Consider refreshing the page.',
              duration: 10000
            }
          );
        }
        console.error(`🔥 Very slow operation: ${operationName} (>${errorThreshold}ms)`);
      }, errorThreshold);

      try {
        const result = await operation();
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Clear timers
        clearTimeout(warningTimer);
        clearTimeout(errorTimer);

        // Dismiss loading toasts
        if (warningToastId) toast.dismiss(warningToastId);
        if (errorToastId) toast.dismiss(errorToastId);

        // Track performance
        this.slowOperations.set(operationName, duration);

        // Log performance
        if (duration > errorThreshold) {
          console.error(`🔥 Very slow: ${operationName} completed in ${Math.round(duration)}ms`);
          if (showToast) {
            toast.warning(`${operationName} completed but was slow (${Math.round(duration / 1000)}s)`);
          }
        } else if (duration > warningThreshold) {
          console.warn(`⚠️ Slow: ${operationName} completed in ${Math.round(duration)}ms`);
        } else {
          console.log(`✅ Fast: ${operationName} completed in ${Math.round(duration)}ms`);
        }

        resolve(result);
      } catch (error: unknown) {
        // Clear timers
        clearTimeout(warningTimer);
        clearTimeout(errorTimer);

        // Dismiss loading toasts
        if (warningToastId) toast.dismiss(warningToastId);
        if (errorToastId) toast.dismiss(errorToastId);

        console.error(`❌ Failed: ${operationName}`, error);

        if (
          showToast &&
          error instanceof Error &&
          error.message.includes('timed out')
        ) {
          toast.error('Database Timeout', {
            description: 'The operation took too long. Please try again or check your connection.',
            duration: 5000
          });
        }

        reject(error);
      }
    });
  }

  getSlowOperations(): { [key: string]: number } {
    return Object.fromEntries(this.slowOperations);
  }

  clearStats(): void {
    this.slowOperations.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility function for easy use
export const trackDbOperation = <T>(
  operationName: string,
  operation: () => Promise<T>,
  showToast: boolean = true
): Promise<T> => {
  return performanceMonitor.trackOperation(operationName, operation, { showToast });
};
