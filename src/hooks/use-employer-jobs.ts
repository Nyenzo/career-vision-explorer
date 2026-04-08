// src/hooks/use-employer-jobs.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/services/jobs.service";
import { Job, JobCreate, JobUpdate } from "@/types/api";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";
import { useApiErrorHandler } from "./use-api-error-handler";
import { employerMockService } from "@/services/employer-mock.service";

// Define EmployerJob UI type that matches the backend JobResponse
export interface EmployerJob {
  id: string;
  job_id: string;
  title: string;
  company: string;
  description?: string;
  requirements: string | string[];
  location: string;
  salary_range?: string;
  salary?: string;
  job_type?: string;
  type?: string;
  experience_level?: string;
  experience?: string;
  is_active: boolean;
  status: "active" | "expired" | "draft";
  applications?: number;
  application_count?: number;
  created_at: string;
  postedDate: string;
  posted_by_name?: string;
  posted_by_company?: string;
  is_premium?: boolean;
}

// Helper to transform API Job into UI EmployerJob shape
function toEmployerJob(job: Job): EmployerJob {
  // Determine status based on is_active field
  let status: "active" | "expired" | "draft" = "active";
  if (!job.is_active) {
    status = "expired"; // You might want to add logic to detect drafts vs expired
  }

  return {
    ...job,
    id: job.job_id, // Use job_id as id for React keys
    job_id: job.job_id,
    postedDate: new Date(job.created_at).toISOString().split("T")[0],
    status: status,
    applications: job.application_count ?? 0,
    application_count: job.application_count ?? 0,
    description: job.description ?? "",
    requirements: job.requirements,
    salary: job.salary_range ?? "",
    salary_range: job.salary_range ?? "",
    type: job.job_type || "full-time",
    job_type: job.job_type,
    experience: job.experience_level ?? "",
    experience_level: job.experience_level,
    is_premium: false, // Default value
  };
}

function toEmployerJobs(jobs: Job[]): EmployerJob[] {
  return jobs.map(toEmployerJob);
}

const EMPLOYER_JOBS_QUERY_KEY = "employer-jobs";

export const useEmployerJobs = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { handleApiError } = useApiErrorHandler();

  // Fetch employer jobs
  const {
    data: jobs = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Job[], Error>({
    queryKey: [EMPLOYER_JOBS_QUERY_KEY],
    queryFn: async () => {
      try {
        return await jobsService.getMyJobs(true);
      } catch (error: any) {
        // Use mock data as fallback for network errors or 404s
        if (
          error.response?.status === 404 ||
          error.response?.status === 500 ||
          error.code === "ECONNABORTED" ||
          error.code === "ERR_NETWORK"
        ) {
          console.warn("API failed, using mock data for employer jobs");
          toast.info("Using demo data. Some features may be limited.");
          return await employerMockService.getEmployerJobs();
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle API errors with proper redirects for 401/403
  useEffect(() => {
    if (error) {
      handleApiError(error, "Failed to load employer jobs");
    }
  }, [error, handleApiError]);

  // Transform jobs to employer format
  const employerJobs = useMemo(() => toEmployerJobs(jobs), [jobs]);

  // Filter jobs based on search and status
  const filteredJobs = useMemo(() => {
    return employerJobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && job.status === "active") ||
        (statusFilter === "draft" && job.status === "draft") ||
        (statusFilter === "expired" && job.status === "expired");

      return matchesSearch && matchesStatus;
    });
  }, [employerJobs, searchQuery, statusFilter]);

  // Create job mutation
  const createJobMutation = useMutation<Job, Error, JobCreate>({
    mutationFn: (jobData) => jobsService.createJob(jobData),
    onSuccess: (newJob, variables) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_JOBS_QUERY_KEY] });
      toast.success(`Job "${variables.title}" has been created successfully`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create job");
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation<
    Job,
    Error,
    { id: string; updates: JobUpdate }
  >({
    mutationFn: async ({ id, updates }) => {
      console.log("🔄 Hook: Updating job", id, "with data:", updates);
      const result = await jobsService.updateJob(id, updates);
      console.log("✅ Hook: Update successful, response:", result);
      return result;
    },
    onSuccess: (updatedJob) => {
      console.log("🔄 Hook: Invalidating queries and refetching...");

      // Invalidate and refetch to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: [EMPLOYER_JOBS_QUERY_KEY],
        refetchType: "active", // Force refetch active queries
      });

      // Also try to update the cache directly for immediate UI update
      queryClient.setQueryData(
        [EMPLOYER_JOBS_QUERY_KEY],
        (oldData: Job[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((job) =>
            job.job_id === updatedJob.job_id ? { ...job, ...updatedJob } : job
          );
        }
      );

      console.log("✅ Hook: Cache updated successfully");
    },
    onError: (error) => {
      console.error("❌ Hook: Update failed:", error);
      toast.error(error.message || "Failed to update job");
    },
  });

  // Delete job mutation
  const deleteJobMutation = useMutation<{ message: string }, Error, string>({
    mutationFn: (id) => jobsService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_JOBS_QUERY_KEY] });
      toast.success("Job has been deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete job");
    },
  });

  // Duplicate job mutation
  const duplicateJobMutation = useMutation<Job, Error, { job: EmployerJob }>({
    mutationFn: async ({ job }) => {
      // Create a duplicate job with modified title
      const duplicateData: JobCreate = {
        title: `${job.title} (Copy)`,
        company: job.company,
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join("\n")
          : (job.requirements as string), // Cast to string
        location: job.location,
        salary_range: job.salary_range,
        job_type: job.job_type as any, // Use type assertion for enum types
        experience_level: job.experience_level as any, // Use type assertion for enum types
        description: job.description,
        // Set as inactive (draft) initially
        is_active: false,
      };

      return await jobsService.createJob(duplicateData);
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_JOBS_QUERY_KEY] });
      toast.success(`Job "${newJob.title}" duplicated successfully`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate job");
    },
  });

  // Activate job mutation
  const activateJobMutation = useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.activateJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_JOBS_QUERY_KEY] });
      toast.success("Job activated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate job");
    },
  });

  // Deactivate job mutation
  const deactivateJobMutation = useMutation<Job, Error, string>({
    mutationFn: (id) => jobsService.deactivateJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_JOBS_QUERY_KEY] });
      toast.success("Job deactivated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate job");
    },
  });

  // Get job by ID
  const getJobById = (id: string) => {
    return employerJobs.find((job) => job.job_id === id);
  };

  return {
    jobs: employerJobs,
    filteredJobs,
    searchQuery,
    statusFilter,
    loading:
      isLoading ||
      createJobMutation.isPending ||
      updateJobMutation.isPending ||
      deleteJobMutation.isPending,
    error: error?.message || null,
    fetchJobs: refetch,
    addJob: createJobMutation.mutate,
    updateJob: (id: string, updates: JobUpdate) =>
      updateJobMutation.mutate({ id, updates }),
    deleteJob: deleteJobMutation.mutate,
    duplicateJob: (job: EmployerJob) => duplicateJobMutation.mutate({ job }),
    activateJob: activateJobMutation.mutate,
    deactivateJob: deactivateJobMutation.mutate,
    setSearchQuery,
    setStatusFilter,
    getJobById,
  };
};
