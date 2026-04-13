import { apiClient } from "../lib/api-client";
import { Job, JobCreate, JobUpdate, PaginatedResponse } from "../types/api";
import { trackDbOperation } from "../utils/performance";
import { toast } from "sonner";

export interface JobSearchParams {
  title?: string;
  company?: string;
  location?: string;
  salary_range?: string;
  is_active?: boolean;
  skills?: string[];
  sort_by?: "created_at" | "updated_at" | "title" | "company";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Simple in-memory cache with expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

type BackendJobType = "full_time" | "part_time" | "remote" | "internship";
type BackendExperienceLevel =
  | "entry_level"
  | "mid_level"
  | "senior_level"
  | "executive_level";

function normalizeJobType(value?: string): BackendJobType {
  const normalized = (value || "").toLowerCase().replace(/[-\s]/g, "_");
  if (normalized === "full_time") return "full_time";
  if (normalized === "part_time") return "part_time";
  if (normalized === "remote") return "remote";
  if (normalized === "internship") return "internship";
  // Backward compatibility for old UI option not supported by backend enum
  if (normalized === "contract") return "full_time";
  return "full_time";
}

function normalizeExperienceLevel(value?: string): BackendExperienceLevel {
  const normalized = (value || "").toLowerCase().replace(/[-\s]/g, "_");
  if (normalized === "entry" || normalized === "entry_level")
    return "entry_level";
  if (normalized === "mid" || normalized === "mid_level") return "mid_level";
  if (normalized === "senior" || normalized === "senior_level")
    return "senior_level";
  if (normalized === "lead" || normalized === "executive" || normalized === "executive_level")
    return "executive_level";
  return "mid_level";
}

function normalizeRequirements(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function transformCreatePayload(jobData: any) {
  return {
    job_title: jobData.job_title ?? jobData.title,
    job_description: jobData.job_description ?? jobData.description,
    location: jobData.location,
    salary_range: jobData.salary_range ?? jobData.salary,
    requirements: normalizeRequirements(jobData.requirements),
    responsibilities: normalizeRequirements(jobData.responsibilities),
    benefits: normalizeRequirements(jobData.benefits),
    required_skills: Array.isArray(jobData.required_skills)
      ? jobData.required_skills
      : normalizeRequirements(jobData.required_skills),
    job_type: normalizeJobType(jobData.job_type ?? jobData.type),
    experience_level: normalizeExperienceLevel(
      jobData.experience_level ?? jobData.experience
    ),
    ...(jobData.status !== undefined ? { status: jobData.status } : {}),
    ...(jobData.application_deadline
      ? { application_deadline: jobData.application_deadline }
      : {}),
  };
}

function transformUpdatePayload(jobData: any) {
  const transformed: Record<string, unknown> = {
    ...(jobData.job_title !== undefined || jobData.title !== undefined
      ? { job_title: jobData.job_title ?? jobData.title }
      : {}),
    ...(jobData.job_description !== undefined || jobData.description !== undefined
      ? { job_description: jobData.job_description ?? jobData.description }
      : {}),
    ...(jobData.location !== undefined ? { location: jobData.location } : {}),
    ...(jobData.salary_range !== undefined || jobData.salary !== undefined
      ? { salary_range: jobData.salary_range ?? jobData.salary }
      : {}),
    ...(jobData.requirements !== undefined
      ? { requirements: normalizeRequirements(jobData.requirements) }
      : {}),
    ...(jobData.responsibilities !== undefined
      ? { responsibilities: normalizeRequirements(jobData.responsibilities) }
      : {}),
    ...(jobData.benefits !== undefined
      ? { benefits: normalizeRequirements(jobData.benefits) }
      : {}),
    ...(jobData.required_skills !== undefined
      ? {
        required_skills: Array.isArray(jobData.required_skills)
          ? jobData.required_skills
          : normalizeRequirements(jobData.required_skills),
      }
      : {}),
    ...(jobData.job_type !== undefined || jobData.type !== undefined
      ? { job_type: normalizeJobType(jobData.job_type ?? jobData.type) }
      : {}),
    ...(jobData.experience_level !== undefined || jobData.experience !== undefined
      ? {
        experience_level: normalizeExperienceLevel(
          jobData.experience_level ?? jobData.experience
        ),
      }
      : {}),
    ...(jobData.status !== undefined ? { status: jobData.status } : {}),
    ...(jobData.application_deadline !== undefined
      ? { application_deadline: jobData.application_deadline || null }
      : {}),
  };

  return transformed;
}

// ✅ Helper: runtime validation for required string fields
// In your jobs.service.ts - UPDATE THE VALIDATION FUNCTION
function validateJobPayload(jobData: any, isUpdate: boolean = false): void {
  if (isUpdate) {
    // For updates, only validate that we have at least one field to update
    const hasUpdates = Object.keys(jobData).some(
      (key) =>
        jobData[key] !== undefined &&
        jobData[key] !== null &&
        jobData[key] !== ""
    );

    if (!hasUpdates) {
      throw new Error("No fields to update");
    }

    // For updates, validate that provided fields have correct types
    const invalid: string[] = [];
    for (const [field, value] of Object.entries(jobData)) {
      if (value !== undefined && value !== null && value !== "") {
        // Only validate string fields that are actually provided
        const stringFields = [
          "title",
          "job_title",
          "description",
          "job_description",
          "location",
          "type",
          "job_type",
          "salary",
          "salary_range",
          "company",
          "experience_level",
        ];
        if (stringFields.includes(field) && typeof value !== "string") {
          invalid.push(field);
        }
      }
    }

    if (invalid.length) {
      throw new Error(`Invalid type (should be string): ${invalid.join(", ")}`);
    }
  } else {
    // For creation, validate all required fields
    const titleValue = jobData.job_title ?? jobData.title;
    const descriptionValue = jobData.job_description ?? jobData.description;
    const jobTypeValue = jobData.job_type ?? jobData.type;
    const experienceLevelValue = jobData.experience_level ?? jobData.experience;

    const missing: string[] = [];
    const invalid: string[] = [];

    if (titleValue === undefined || titleValue === null || titleValue === "") {
      missing.push("job_title");
    } else if (typeof titleValue !== "string") {
      invalid.push("job_title");
    }

    if (
      descriptionValue === undefined ||
      descriptionValue === null ||
      descriptionValue === ""
    ) {
      missing.push("job_description");
    } else if (typeof descriptionValue !== "string") {
      invalid.push("job_description");
    }

    if (jobTypeValue === undefined || jobTypeValue === null || jobTypeValue === "") {
      missing.push("job_type");
    } else if (typeof jobTypeValue !== "string") {
      invalid.push("job_type");
    }

    if (
      experienceLevelValue === undefined ||
      experienceLevelValue === null ||
      experienceLevelValue === ""
    ) {
      missing.push("experience_level");
    } else if (typeof experienceLevelValue !== "string") {
      invalid.push("experience_level");
    }

    if (missing.length || invalid.length) {
      const msg = [
        missing.length ? `Missing fields: ${missing.join(", ")}` : "",
        invalid.length
          ? `Invalid type (should be string): ${invalid.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("; ");

      throw new Error(msg);
    }
  }
}
class JobsService {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_TTL = 60000; // 60 seconds
  private readonly SHORT_CACHE_TTL = 30000; // 30 seconds
  private readonly AI_CACHE_TTL = 300000; // 5 minutes

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry)) {
      console.log(`Cache hit for: ${key}`);
      return entry.data;
    }
    if (entry && this.isExpired(entry)) {
      this.cache.delete(key);
      console.log(`Cache expired for: ${key}`);
    }
    return null;
  }

  private setCache<T>(
    key: string,
    data: T,
    ttl: number = this.CACHE_TTL
  ): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    this.cache.set(key, entry);
    console.log(`Cached: ${key} (expires in ${ttl}ms)`);
  }

  private async dedupedRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      console.log(`Deduplicating request for: ${key}`);
      return pendingRequest;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  async getJobs(
    params?: JobSearchParams,
    options?: { signal?: AbortSignal; skipCache?: boolean }
  ): Promise<PaginatedResponse<Job>> {
    return trackDbOperation("Load Jobs", async () => {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "title") {
              queryParams.append("search", value.toString());
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/jobs/?${queryString}` : "/jobs/";
      const cacheKey = this.getCacheKey(endpoint, params);

      if (!options?.skipCache) {
        const cached = this.getFromCache<PaginatedResponse<Job>>(cacheKey);
        if (cached) return cached;
      }

      return this.dedupedRequest(cacheKey, async () => {
        try {
          let result: PaginatedResponse<Job>;
          try {
            result = await apiClient.getFast<PaginatedResponse<Job>>(endpoint, {
              signal: options?.signal,
            });
          } catch (error: any) {
            if (
              error.message?.includes("timed out") &&
              !options?.signal?.aborted
            ) {
              console.log(
                "Fast request timed out, retrying with longer timeout..."
              );
              result = await apiClient.get<PaginatedResponse<Job>>(endpoint, {
                timeout: 30000,
                signal: options?.signal,
              });
            } else {
              throw error;
            }
          }
          this.setCache(cacheKey, result, this.SHORT_CACHE_TTL);
          return result;
        } catch (error: any) {
          console.error("Jobs API request failed:", error.message);
          toast.error(error.message || "Failed to load jobs");
          throw error;
        }
      });
    });
  }

  async getJobById(jobId: string): Promise<Job> {
    return await apiClient.get<Job>(`/jobs/${jobId}`);
  }

  async getMyJobById(jobId: string): Promise<Job> {
    return await apiClient.get<Job>(`/jobs/my-jobs/${jobId}`);
  }

  async createJob(jobData: JobCreate): Promise<Job> {
    try {
      validateJobPayload(jobData, false); // false = creation
      const backendPayload = transformCreatePayload(jobData);
      return await apiClient.post<Job>("/jobs/", backendPayload);
    } catch (error: any) {
      const msg =
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error.message);
      console.error("❌ Job creation failed:", msg);
      toast.error(msg || "Failed to create job");
      throw error;
    }
  }

  async updateJob(jobId: string, jobData: JobUpdate): Promise<Job> {
    try {
      validateJobPayload(jobData, true); // true = update
      const backendPayload = transformUpdatePayload(jobData);
      return await apiClient.put<Job>(`/jobs/${jobId}`, backendPayload);
    } catch (error: any) {
      const msg =
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error.message);
      console.error("Job update failed:", msg);
      toast.error(msg || "Failed to update job");
      throw error;
    }
  }
  async deleteJob(jobId: string): Promise<{ message: string }> {
    try {
      return await apiClient.delete<{ message: string }>(`/jobs/${jobId}`);
    } catch (error: any) {
      console.error("Job delete failed:", error.message);
      toast.error(error.message || "Failed to delete job");
      throw error;
    }
  }

  async getMyJobs(includeInactive = false): Promise<Job[]> {
    const endpoint = includeInactive
      ? `/jobs/my-jobs?include_non_open=true`
      : "/jobs/my-jobs";
    return await apiClient.get<Job[]>(endpoint);
  }

  async getAllJobs(includeInactive = false): Promise<Job[]> {
    const endpoint = includeInactive
      ? `/jobs/admin/jobs/?include_non_open=true`
      : "/jobs/admin/jobs/";
    return await apiClient.get<Job[]>(endpoint);
  }

  async activateJob(jobId: string): Promise<Job> {
    try {
      return await apiClient.post<Job>(`/jobs/${jobId}/activate`);
    } catch (error: any) {
      toast.error(error.message || "Failed to activate job");
      throw error;
    }
  }

  async deactivateJob(jobId: string): Promise<Job> {
    try {
      return await apiClient.post<Job>(`/jobs/${jobId}/deactivate`);
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate job");
      throw error;
    }
  }

  async searchJobsBySkills(): Promise<Job[]> {
    return await apiClient.get<Job[]>("/jobs/search/");
  }

  async getJobStats(): Promise<{
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    companies_count: number;
    locations_count: number;
    avg_applications_per_job: number;
  }> {
    return await apiClient.get("/jobs/stats/");
  }

  async getMyJobStats(): Promise<{
    total_jobs: number;
    active_jobs: number;
    total_applications: number;
    companies_count: number;
    locations_count: number;
    avg_applications_per_job: number;
  }> {
    return await apiClient.get("/jobs/my-stats");
  }

  async aiMatchJobs(
    params: {
      skills: string[];
      location_preference?: string;
      salary_expectation?: string;
    },
    options?: { signal?: AbortSignal }
  ): Promise<
    Array<{
      job_id: string;
      title: string;
      company: string;
      location: string;
      salary_range?: string;
      match_score: number;
      matched_skills: string[];
      created_at: string;
    }>
  > {
    return trackDbOperation("AI Job Matching", async () => {
      const queryParams = new URLSearchParams();
      params.skills.forEach((skill) => queryParams.append("skills", skill));
      if (params.location_preference)
        queryParams.append("location_preference", params.location_preference);
      if (params.salary_expectation)
        queryParams.append("salary_expectation", params.salary_expectation);

      const queryString = queryParams.toString();
      const endpoint = `/jobs/ai-match/?${queryString}`;

      try {
        return await apiClient.post(endpoint, {}, { signal: options?.signal });
      } catch (error: any) {
        toast.error(error.message || "Failed to match jobs");
        throw error;
      }
    });
  }

  async getEmployerDashboard(): Promise<string> {
    return await apiClient.get("/jobs/employer/dashboard");
  }

  cacheAIResult<T>(key: string, data: T): void {
    this.setCache(key, data, this.AI_CACHE_TTL);
  }

  getCachedAIResult<T>(key: string): T | null {
    return this.getFromCache<T>(key);
  }

  clearCache(): void {
    this.cache.clear();
    console.log("Cache cleared");
  }
}

export const jobsService = new JobsService();
