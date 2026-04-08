# Employer Components Using useJobPosts Hook - Job ID Mapping Documentation

## Overview
The `useJobPosts` hook provides a critical mapping from the API's `job_id` field to the UI's `id` field. This document tracks all employer components that rely on this mapping.

## Mapping Implementation
In `src/hooks/use-job-posts.tsx` (lines 58-69), the hook maps API response fields:
```typescript
const mappedJobs: JobPost[] = response.jobs.map(job => ({
  id: job.job_id,  // Maps API's job_id to UI's id
  title: job.title,
  description: job.description ?? '',
  location: job.location,
  type: job.job_type ?? 'Full-time',
  salary: job.salary_range ?? '',
  isBoosted: false,
  datePosted: job.created_at,
  applicants: job.application_count ?? 0,
  views: 0,
}));
```

## Components Using the Hook

### 1. **NewJobPostDialog** (`src/components/employer/NewJobPostDialog.tsx`)
- **Usage**: Imports and uses `addJob` from `useJobPosts`
- **Job ID Access**: Creates new jobs with `id: crypto.randomUUID()` (line 61)
- **Safe**: ✅ Generates IDs locally, doesn't rely on API mapping

### 2. **EditJobDialog** (`src/components/employer/EditJobDialog.tsx`)
- **Usage**: Imports and uses `updateJob` from `useJobPosts`
- **Job ID Access**: Uses `job.id` to update jobs (line 64)
- **Safe**: ✅ Receives job object from parent with mapped ID

### 3. **BoostJobDialog** (`src/components/employer/BoostJobDialog.tsx`)
- **Usage**: Imports and uses `updateJob` from `useJobPosts`
- **Job ID Access**: Uses `job.id` to update boost status (line 28)
- **Safe**: ✅ Receives job object from parent with mapped ID

### 4. **StatisticsCards** (`src/components/employer/StatisticsCards.tsx`)
- **Usage**: Imports and uses `jobs` from `useJobPosts`
- **Job ID Access**: No direct ID usage, only aggregates data
- **Safe**: ✅ Works with job properties, not IDs

### 5. **JobListingsTable** (`src/components/employer/JobListingsTable.tsx`)
- **Usage**: Imports and uses `filteredJobs`, `removeJob`, `updateFilters` from `useJobPosts`
- **Job ID Access**: 
  - Uses `job.id` as key in map (line 226)
  - Passes `job.id` to navigation (line 50)
  - Uses `job.id` for removeJob (line 57)
- **Safe**: ✅ All operations use mapped job objects

### 6. **JobPostHeader** (`src/components/employer/JobPostHeader.tsx`)
- **Usage**: Imports and uses `updateFilters`, `filters` from `useJobPosts`
- **Job ID Access**: No direct ID usage
- **Safe**: ✅ Only handles filtering, no ID operations

### 7. **InterviewSchedule** (`src/pages/employer/InterviewSchedule.tsx`)
- **Usage**: Imports and uses `jobs` from `useJobPosts`
- **Job ID Access**: Uses `job.id` for job selection (line 86)
- **Safe**: ✅ Works with mapped job objects

### 8. **JobApplicants** (`src/pages/employer/JobApplicants.tsx`)
- **Usage**: Imports and uses `getJob` from `useJobPosts`
- **Job ID Access**: Uses `jobId` from URL params with `getJob(jobId)` (line 22)
- **Safe**: ✅ The getJob function expects the mapped ID

## Direct API Call Analysis

### Findings:
- No direct API calls found in employer components
- All data access goes through the `useJobPosts` hook
- The hook provides proper abstraction and mapping

## Recommendations

1. **Continue using job.id**: All employer components should continue using `job.id` as they currently do
2. **No changes needed**: The current implementation is safe and consistent
3. **Future development**: Any new employer components should use the `useJobPosts` hook rather than direct API calls
4. **Documentation**: Keep this mapping documented for future developers

## Critical Note
The mapping from `job_id` to `id` happens in the `useJobPosts` hook. This is the single source of truth for this transformation, ensuring consistency across all employer components.
