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
  responsibilities?: string[];
  benefits?: string[];
  required_skills?: string[];
  location: string;
  salary_range?: string;
  salary?: string;
  job_type?: string;
  type?: string;
  experience_level?: string;
  experience?: string;
  application_deadline?: string;
  is_active: boolean;
  status: "active" | "expired" | "draft";
  applications?: number;
  application_count?: number;
  created_at: string;
  updated_at: string;
  postedDate: string;
  posted_by_name?: string;
  posted_by_company?: string;
}

// Helper to transform API Job into UI EmployerJob shape
function toEmployerJob(job: Job): EmployerJob {
  const raw = job as Job & Record<string, unknown>;
  const backendStatus = raw.status as
    | "open"
    | "draft"
    | "closed"
    | undefined;
  let status: "active" | "expired" | "draft" = "active";
  if (backendStatus === "draft") {
    status = "draft";
  } else if (backendStatus === "closed") {
    status = "expired";
  } else if (job.is_active === false) {
    status = "expired";
  }

  const backendId = raw.id;
  const normalizedId = String(job.job_id ?? backendId ?? "");
  const normalizedTitle = raw.job_title ?? job.title ?? "Untitled Job";
  const normalizedCompany =
    raw.company_name ?? job.company ?? raw.posted_by_company ?? "";
  const normalizedDescription =
    raw.job_description ?? job.description ?? "";
  const normalizedRequirements =
    raw.requirements ?? [];
  const normalizedResponsibilities =
    raw.responsibilities ?? [];
  const normalizedBenefits = raw.benefits ?? [];
  const normalizedRequiredSkills =
    raw.required_skills ?? [];
  const normalizedJobType =
    raw.job_type ?? job.job_type ?? "full_time";
  const normalizedLocation = String(raw.location ?? job.location ?? "");
  const normalizedCreatedAt = String(raw.created_at ?? new Date().toISOString());
  const normalizedUpdatedAt = String(raw.updated_at ?? normalizedCreatedAt);

  return {
    ...job,
    id: normalizedId,
    job_id: normalizedId,
    title: normalizedTitle,
    company: normalizedCompany,
    location: normalizedLocation,
    created_at: normalizedCreatedAt,
    updated_at: normalizedUpdatedAt,
    postedDate: new Date(normalizedCreatedAt).toISOString().split("T")[0],
    status: status,
    applications: job.application_count ?? 0,
    application_count: job.application_count ?? 0,
    description: normalizedDescription,
    requirements: normalizedRequirements,
    responsibilities: normalizedResponsibilities,
    benefits: normalizedBenefits,
    required_skills: normalizedRequiredSkills,
    salary: job.salary_range ?? "",
    salary_range: job.salary_range ?? "",
    type: normalizedJobType,
    job_type: normalizedJobType,
    experience: job.experience_level ?? "",
    experience_level: job.experience_level,
    application_deadline: raw.application_deadline as string | undefined,
    is_active: backendStatus ? backendStatus === "open" : job.is_active,
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
      } catch (error: unknown) {
        const err = error as { response?: { status?: number }; code?: string };
        // Use mock data as fallback for network errors or 404s
        if (
          err.response?.status === 404 ||
          err.response?.status === 500 ||
          err.code === "ECONNABORTED" ||
          err.code === "ERR_NETWORK"
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
      toast.success(`Job "${newJob.job_title || newJob.title || "New Job"}" has been created successfully`);
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
            (job.job_id || job.id) === (updatedJob.job_id || updatedJob.id)
              ? { ...job, ...updatedJob }
              : job
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
        job_title: `${job.title} (Copy)`,
        job_description: job.description || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements
          : String(job.requirements || "")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
        responsibilities: job.responsibilities || [],
        benefits: job.benefits || [],
        required_skills: job.required_skills || [],
        location: job.location,
        salary_range: job.salary_range,
        job_type: job.job_type as JobCreate["job_type"],
        experience_level: job.experience_level as JobCreate["experience_level"],
        status: "draft",
      };

      return await jobsService.createJob(duplicateData);
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_JOBS_QUERY_KEY] });
      toast.success(`Job "${newJob.job_title || newJob.title || "Job"}" duplicated successfully`);
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
    addJob: createJobMutation.mutateAsync,
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
