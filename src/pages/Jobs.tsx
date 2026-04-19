import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { JobsContainer } from "@/components/jobs/JobsContainer";
import { jobsService } from "../services/jobs.service";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  DashboardStatsGridSkeleton,
  JobCardSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/skeleton-loaders";

const PAGE_SIZE = 20;
const USE_RECOMMENDATIONS = true; // flip to false to debug with plain listing

// Frontend Job type for the UI components
interface Job {
  job_id: string;
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  matchScore: number | null;
  skills: string[];
  description: string;
  experienceLevel?: string;
  companyInfo?: {
    logoUrl?: string;
  };
  // Additional fields from backend
  benefits?: string[];
  remoteFriendly?: boolean;
  applicationDeadline?: string;
  requirements?: string;
  postedBy?: string;
  isActive?: boolean;
}

const normalizeApiJobToUiJob = (apiJob: any): Job => {
  let skills: string[] = [];
  if (
    Array.isArray(apiJob.skills_required) &&
    apiJob.skills_required.length > 0
  ) {
    skills = apiJob.skills_required;
  } else if (apiJob.skills_required && !Array.isArray(apiJob.skills_required)) {
    skills = [apiJob.skills_required];
  } else if (
    Array.isArray(apiJob.required_skills) &&
    apiJob.required_skills.length > 0
  ) {
    skills = apiJob.required_skills;
  } else if (apiJob.requirements) {
    skills = apiJob.requirements
      .toString()
      .split(/[,\n\r]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && s.length < 50)
      .slice(0, 10);
  }

  const title = String(apiJob.job_title ?? apiJob.title ?? "Untitled Role");
  const company = String(
    apiJob.company_name ??
      apiJob.company ??
      apiJob.employer_company_name ??
      apiJob.posted_by_company ??
      "Unknown Company",
  );

  return {
    id: String(apiJob.job_id || apiJob.id),
    job_id: String(apiJob.job_id || apiJob.id),
    title,
    company,
    location: String(apiJob.location ?? "Location not specified"),
    type: String(apiJob.job_type || "Full-time"),
    salary: String(apiJob.salary_range || "Competitive"),
    posted: apiJob.created_at
      ? new Date(apiJob.created_at).toLocaleDateString()
      : "Recently",
    matchScore: apiJob.match_score != null ? Number(apiJob.match_score) : null,
    skills,
    description: String(
      apiJob.job_description ||
        apiJob.description ||
        apiJob.requirements ||
        "No description available",
    ),
    experienceLevel: String(apiJob.experience_level || "Mid Level"),
    companyInfo: { logoUrl: apiJob.company_logo_url || undefined },
    benefits: Array.isArray(apiJob.benefits)
      ? apiJob.benefits
      : apiJob.benefits
        ? [apiJob.benefits]
        : [],
    remoteFriendly: Boolean(apiJob.remote_friendly || false),
    applicationDeadline: apiJob.application_deadline,
    requirements: String(apiJob.requirements || ""),
    postedBy: apiJob.posted_by_name || apiJob.posted_by,
    isActive: apiJob.is_active !== undefined ? apiJob.is_active : true,
  } as Job;
};

// Helper function to generate UUID-like strings for mock data compatibility
const generateMockUUID = (id: string): string => {
  // convert simple id to uuid format for backend compatibilty
  const padded = id.padStart(8, "0");
  return `${padded.slice(0, 8)}-0000-0000-0000-000000000000`;
};

const normalizeKeyPart = (value?: string) =>
  (value || "").toLowerCase().trim().replace(/\s+/g, " ");

const getCanonicalJobKey = (job: Job) => {
  const idPart = normalizeKeyPart(job.job_id || job.id);
  if (idPart) {
    return `id:${idPart}`;
  }

  return [
    normalizeKeyPart(job.title),
    normalizeKeyPart(job.company),
    normalizeKeyPart(job.location),
    normalizeKeyPart(job.type),
  ].join("|");
};

const dedupeJobs = (jobList: Job[]) => {
  const seen = new Set<string>();
  return jobList.filter((job) => {
    const key = getCanonicalJobKey(job);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const Jobs = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [clearingCache, setClearingCache] = useState(false);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const initialLoadRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreJobs();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;

    // Wait for auth loading to complete before loading jobs
    if (authLoading) {
      console.log("Waiting for auth to load...");
      return;
    }

    // Prevent double loading - only load once
    if (!initialLoadRef.current && !loadingRef.current) {
      console.log("Initiating jobs load on mount");
      initialLoadRef.current = true;
      loadJobs();
    } else {
      console.log("Skipping jobs load - already loaded or loading");
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      console.log("Jobs component unmounting");
    };
  }, [authLoading]); // Only depend on authLoading

  const loadMoreJobs = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadJobs(currentPage + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, isAuthenticated]);

  const clearCache = async () => {
    setClearingCache(true);
    try {
      // Clear unified service cache
      await JobMatchService.clearUnifiedCache();

      // Reset pagination state
      setCurrentPage(0);
      setHasMore(true);
      setJobs([]);

      // Reload jobs
      await loadJobs();

      toast.success("Cache cleared and jobs reloaded");
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear cache");
    } finally {
      setClearingCache(false);
    }
  };

  const loadJobs = async (page = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (page === 1) {
      setLoading(true);
      setError(null);
    }

    try {
      // Authenticated users → ranked recommendations endpoint
      // Unauthenticated users → plain listing sorted by date
      const response =
        isAuthenticated && USE_RECOMMENDATIONS
          ? await jobsService.getRecommendedJobs({ page, limit: PAGE_SIZE })
          : await jobsService.getJobs({
              is_active: true,
              page,
              limit: PAGE_SIZE,
              sort_by: "created_at",
              sort_order: "desc",
            });

      const apiJobs = response.jobs || response.recommendations || [];
      const transformed = apiJobs.map(normalizeApiJobToUiJob);

      if (mountedRef.current) {
        setJobs(
          page === 1
            ? dedupeJobs(transformed)
            : (prev) => dedupeJobs([...prev, ...transformed]),
        );
        setCurrentPage(page);
        setHasMore(apiJobs.length === PAGE_SIZE);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError("Failed to load jobs. Please try again.");
        toast.error("Failed to load jobs.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
      loadingRef.current = false;
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-surface">
          <div className="relative max-w-7xl mx-auto py-12 px-6">
            <PageHeaderSkeleton />
            {authLoading && <DashboardStatsGridSkeleton />}
            <div className="grid gap-6 lg:grid-cols-2 mt-8">
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-surface pt-4">
        {/* Background Pattern (Optional Architectural touch) */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

        <div className="relative pb-12 w-full">
          {/* Debug Panel and Cache Clear Button */}
          {/* <div className="flex justify-between items-center mb-4"> */}
          {/* Debug Info */}
          {/* <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              <div>
                Jobs: {jobs.length} | Page: {currentPage} | HasMore:{" "}
                {hasMore ? "Yes" : "No"}
              </div>
              <div>
                Loading: {loading ? "Yes" : "No"} | LoadingMore:{" "}
                {loadingMore ? "Yes" : "No"}
              </div>
            </div> */}

          {/* Cache Clear Button */}
          {/* <button
              onClick={clearCache}
              disabled={clearingCache}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors duration-200"
            > */}
          {/* {clearingCache ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Clear Cache</span>
                </>
              )}
            </button> */}
          {/* </div> */}

          <JobsContainer jobs={jobs} />

          {/* Load More Section */}
          {hasMore && (
            <div className="flex flex-col items-center py-8 space-y-4">
              {/* Manual Load More Button — no spinner, use skeleton cards below */}
              <button
                onClick={loadMoreJobs}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>
                  {loadingMore ? "Loading More Jobs" : "Load More Jobs"}
                </span>
                {!loadingMore && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {/* Skeleton cards render while new jobs are being fetched */}
              {loadingMore && (
                <div className="w-full space-y-4">
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </div>
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="text-gray-500 text-sm">
                Or scroll to load more jobs automatically
              </div>
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>You've reached the end of job listings</p>
              {!isAuthenticated && (
                <p className="text-blue-500 text-sm mt-2">
                  Log in to see personalized job recommendations with match
                  scores
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
