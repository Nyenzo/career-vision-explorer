import { create } from "zustand";
import { toast } from "sonner";
import { jobsService } from "../services/jobs.service";

export interface JobPost {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string;
  isBoosted: boolean;
  datePosted: string;
  applicants: number;
  views: number;
  company: string; // ✅ added
  requirements: string; // ✅ added
}

// This matches what you send to the API
export interface JobCreate {
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary_range: string;
  company: string;
  requirements: string;
}

export interface JobFilters {
  jobType?: string;
  dateRange?: number;
  boostedOnly?: boolean;
  searchQuery?: string;
  location?: string;
}

interface JobStore {
  jobs: JobPost[];
  filteredJobs: JobPost[];
  filters: JobFilters;
  fetchJobs: () => Promise<void>;
  createJob: (jobData: JobCreate) => Promise<void>; // ✅ fixed type
  removeJob: (id: string) => void;
  updateJob: (id: string, updatedJob: Partial<JobPost>) => void;
  getJob: (id: string) => JobPost | undefined;
  updateFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
}

export const useJobPosts = create<JobStore>((set, get) => ({
  jobs: [],
  filteredJobs: [],
  filters: {
    jobType: "all",
    dateRange: 30,
    boostedOnly: false,
    searchQuery: "",
    location: "all",
  },

  fetchJobs: async () => {
    try {
      const response = await jobsService.getJobs();
      const mappedJobs: JobPost[] = response.jobs.map((job: any) => ({
        id: job.job_id,
        title: job.title,
        description: job.description ?? "",
        location: job.location,
        type: job.job_type ?? "Full-time",
        salary: job.salary_range ?? "",
        company: job.company ?? "", // ✅ map
        requirements: job.requirements ?? "", // ✅ map
        isBoosted: false,
        datePosted: job.created_at,
        applicants: job.application_count ?? 0,
        views: 0,
      }));
      set({
        jobs: mappedJobs,
        filteredJobs: applyFilters(mappedJobs, get().filters),
      });
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    }
  },

  createJob: async (jobData) => {
    try {
      const newJob = await jobsService.createJob(jobData);
      const job: JobPost = {
        id: newJob.job_id,
        title: newJob.title,
        description: newJob.description ?? "",
        location: newJob.location,
        type: newJob.job_type ?? "Full-time",
        salary: newJob.salary_range ?? "",
        company: newJob.company ?? "",
        requirements: newJob.requirements ?? "",
        isBoosted: false,
        datePosted: newJob.created_at,
        applicants: 0,
        views: 0,
      };
      set((state) => {
        const updated = [...state.jobs, job];
        return {
          jobs: updated,
          filteredJobs: applyFilters(updated, state.filters),
        };
      });
      toast.success("Job posted successfully!");
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error("Failed to post job");
    }
  },

  removeJob: (id) => {
    set((state) => {
      const updated = state.jobs.filter((j) => j.id !== id);
      return {
        jobs: updated,
        filteredJobs: applyFilters(updated, state.filters),
      };
    });
    toast.success("Job deleted");
  },

  updateJob: (id, updatedJob) => {
    set((state) => {
      const updated = state.jobs.map((job) =>
        job.id === id ? { ...job, ...updatedJob } : job
      );
      return {
        jobs: updated,
        filteredJobs: applyFilters(updated, state.filters),
      };
    });
    toast.success("Job updated");
  },

  getJob: (id) => get().jobs.find((job) => job.id === id),

  updateFilters: (newFilters) => {
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      return {
        filters: updatedFilters,
        filteredJobs: applyFilters(state.jobs, updatedFilters),
      };
    });
  },

  resetFilters: () => {
    const defaultFilters = {
      jobType: "all",
      dateRange: 30,
      boostedOnly: false,
      searchQuery: "",
      location: "all",
    };
    set((state) => ({
      filters: defaultFilters,
      filteredJobs: applyFilters(state.jobs, defaultFilters),
    }));
  },
}));

function applyFilters(jobs: JobPost[], filters: JobFilters): JobPost[] {
  return jobs.filter((job) => {
    if (
      filters.jobType &&
      filters.jobType !== "all" &&
      job.type !== filters.jobType
    ) {
      return false;
    }
    if (
      filters.location &&
      filters.location !== "all" &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.dateRange) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filters.dateRange);
      if (new Date(job.datePosted) < cutoff) return false;
    }
    if (filters.boostedOnly && !job.isBoosted) return false;
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.type.toLowerCase().includes(q) ||
        job.salary.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export default useJobPosts;
