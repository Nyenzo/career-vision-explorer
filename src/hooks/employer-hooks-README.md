# Employer Dashboard API Hooks

This directory contains React Query-based hooks for the employer dashboard, providing real-time data fetching with proper error handling, loading states, and caching.

## Available Hooks

### 1. `useEmployerJobs`

Manages job listings for employers with full CRUD operations.

```typescript
const {
  jobs,              // All employer's jobs (transformed to UI format)
  filteredJobs,      // Jobs filtered by search and status
  searchQuery,       // Current search query
  statusFilter,      // Current status filter ('all', 'active', 'inactive')
  loading,           // Loading state for any operation
  error,             // Error message if any
  fetchJobs,         // Manual refetch function
  addJob,            // Create new job: (jobData: JobCreate) => void
  updateJob,         // Update job: (id: string, updates: JobUpdate) => void
  deleteJob,         // Delete job: (id: string) => void
  setSearchQuery,    // Update search query
  setStatusFilter,   // Update status filter
  getJobById,        // Get specific job by ID
} = useEmployerJobs();
```

**Features:**
- Automatic data transformation from API format to UI-friendly format
- Built-in search and filtering
- Optimistic updates with automatic cache invalidation
- Toast notifications for success/error states
- 5-minute cache freshness, 10-minute cache retention

### 2. `useEmployerStats`

Fetches employer dashboard statistics from `/api/v1/jobs/my-stats`.

```typescript
const {
  stats,             // Employer statistics object
  isLoading,         // Loading state
  error,             // Error message if any
  refetch,           // Manual refetch function
  percentageChanges, // Mock percentage changes for UI
} = useEmployerStats();
```

**Stats Object:**
```typescript
{
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  companiesCount: number;
  locationsCount: number;
  avgApplicationsPerJob: number;
  inactiveJobs: number;        // Calculated
  applicationRate: number;      // Calculated percentage
}
```

**Features:**
- 10-minute cache freshness, 30-minute cache retention
- Calculated fields for UI convenience
- Mock percentage changes (can be replaced with historical data comparison)

### 3. `useEmployerApplications`

Manages job applications for employer's posted jobs.

```typescript
const {
  applications,           // All applications (transformed)
  filteredApplications,   // Filtered applications
  isLoading,             // Loading state
  error,                 // Error message
  refetch,               // Manual refetch
  statusFilter,          // Current status filter
  setStatusFilter,       // Update status filter
  jobFilter,             // Current job filter
  setJobFilter,          // Update job filter
  searchQuery,           // Current search query
  setSearchQuery,        // Update search query
  reviewApplication,     // Update application status
  getApplicationsForJob, // Get applications for specific job
  stats,                 // Application statistics
  uniqueJobs,           // List of unique jobs for filtering
} = useEmployerApplications();
```

**Features:**
- Multi-criteria filtering (status, job, search)
- Application review with status updates
- Real-time statistics calculation
- Automatic job list extraction for filtering

## Error Handling

All hooks implement consistent error handling:

1. **Network Errors**: Displayed as error messages
2. **403 Forbidden**: Silently handled (no retries)
3. **Timeouts**: Handled by the underlying API client
4. **Validation Errors**: Shown via toast notifications

## Caching Strategy

- **Jobs**: 5-minute freshness, 10-minute retention
- **Stats**: 10-minute freshness, 30-minute retention
- **Applications**: 5-minute freshness, 10-minute retention

Cache is automatically invalidated on mutations (create, update, delete).

## Usage Example

```tsx
import { useEmployerJobs, useEmployerStats, useEmployerApplications } from '@/hooks';

function EmployerDashboard() {
  const { stats, isLoading: statsLoading } = useEmployerStats();
  const { filteredJobs, loading: jobsLoading } = useEmployerJobs();
  const { stats: appStats } = useEmployerApplications();

  if (statsLoading || jobsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <StatsCards stats={stats} />
      <JobsList jobs={filteredJobs} />
      <ApplicationsSummary stats={appStats} />
    </div>
  );
}
```

## Migration from Zustand

These hooks replace the previous Zustand-based implementation with React Query, providing:

1. **Better Performance**: Automatic deduplication and caching
2. **Improved DX**: Built-in loading and error states
3. **Real-time Updates**: Automatic cache invalidation
4. **Type Safety**: Full TypeScript support with proper types

## Notes

- All hooks require authentication (employer role)
- Data is automatically refetched when window regains focus
- Mutations show toast notifications for user feedback
- Cache persists across component unmounts
