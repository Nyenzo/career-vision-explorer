import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { JobsContainer } from "@/components/jobs/JobsContainer";
import { jobsService } from "../services/jobs.service";
import { Job as ApiJob } from "../types/api";
import { toast } from "sonner";
import { AIJobMatchRequest } from "@/services/ai-job-matching.service";
import { apiClient } from "@/lib/api-client";
import { SalaryExpectationsStep } from "@/components/onboarding/steps/SalaryExpectationsStep";
import { JobMatchService } from "@/api/job-matching-api";
import { getCurrentUser } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

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
  matchScore: number;
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

// Helper function to generate UUID-like strings for mock data compatibility
const generateMockUUID = (id: string): string => {
  // convert simple id to uuid format for backend compatibilty
  const padded = id.padStart(8, "0");
  return `${padded.slice(0, 8)}-0000-0000-0000-000000000000`;
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
    const nextPage = currentPage + 1;

    try {
      console.log(
        `Loading more jobs - page ${nextPage}, current jobs count: ${jobs.length}`,
      );

      if (isAuthenticated && user) {
        // Try unified recommendations for authenticated users
        try {
          const response = await JobMatchService.getVectorJobRecommendations(
            nextPage,
            6,
            user.user_id,
          );
          console.log(
            `Unified recommendations response for page ${nextPage}:`,
            response,
          );

          if (response.jobs && response.jobs.length > 0) {
            // Transform directly from unified response - no need for additional API calls
            const transformedJobs = response.jobs.map((job: any) => {
              return {
                id: job.job_id,
                job_id: job.job_id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.job_type || "Full-time",
                salary: job.salary_range || "Competitive",
                posted: job.created_at
                  ? new Date(job.created_at).toLocaleDateString()
                  : "Recently",
                // Use the match_score directly from unified service
                matchScore: job.match_score || 0,
                skills: job.skills_required || job.matched_skills || [],
                description: job.description || "No description available",
                experienceLevel: job.experience_level || "Mid Level",
                companyInfo: {
                  logoUrl: undefined,
                },
              } as Job;
            });

            if (mountedRef.current) {
              // Deduplicate jobs by job_id to prevent duplicates
              setJobs((prevJobs) => {
                const existingIds = new Set(prevJobs.map((job) => job.job_id));
                const newJobs = transformedJobs.filter(
                  (job) => !existingIds.has(job.job_id),
                );
                console.log(
                  `Adding ${newJobs.length} new jobs (${transformedJobs.length - newJobs.length} duplicates filtered)`,
                );
                return [...prevJobs, ...newJobs];
              });
              setCurrentPage(nextPage);
              setHasMore(response.jobs.length === 6);
              console.log(
                `Page ${nextPage} loaded. HasMore: ${response.jobs.length === 6}, Jobs returned: ${response.jobs.length}`,
              );
              toast.success(`Loaded ${transformedJobs.length} more jobs`);
            }
            return;
          } else {
            setHasMore(false);
            return;
          }
        } catch (vectorError) {
          console.warn(
            "Vector recommendations failed, falling back to regular jobs:",
            vectorError,
          );
        }
      }

      // Fallback to regular jobs for unauthenticated users or when vector fails
      const jobsResponse = await jobsService.getJobs({
        is_active: true,
        page: nextPage + 1, // +1 because backend is 1-indexed
        limit: 6,
        sort_by: "created_at",
        sort_order: "desc",
      });

      const apiJobs = jobsResponse.jobs || [];
      if (apiJobs.length > 0) {
        const transformedJobs = apiJobs.map(
          (apiJob: any) =>
            ({
              id: apiJob.job_id || apiJob.id,
              job_id: apiJob.job_id || apiJob.id,
              title: apiJob.title,
              company: apiJob.company,
              location: apiJob.location,
              type: apiJob.job_type || "Full-time",
              salary: apiJob.salary_range || "Competitive",
              posted: apiJob.created_at
                ? new Date(apiJob.created_at).toLocaleDateString()
                : "Recently",
              matchScore:
                isAuthenticated && user
                  ? Math.floor(Math.random() * 30) + 70
                  : 0, // Random score for auth users, 0 for unauthenticated
              skills: apiJob.skills_required || apiJob.skills || [],
              description:
                apiJob.description ||
                apiJob.requirements ||
                "No description available",
              experienceLevel: apiJob.experience_level || "Mid Level",
              companyInfo: {
                logoUrl: undefined,
              },
            }) as Job,
        );

        if (mountedRef.current) {
          // Deduplicate jobs by job_id to prevent duplicates
          setJobs((prevJobs) => {
            const existingIds = new Set(prevJobs.map((job) => job.job_id));
            const newJobs = transformedJobs.filter(
              (job) => !existingIds.has(job.job_id),
            );
            console.log(
              `Adding ${newJobs.length} new jobs (${transformedJobs.length - newJobs.length} duplicates filtered)`,
            );
            return [...prevJobs, ...newJobs];
          });
          setCurrentPage(nextPage);
          setHasMore(apiJobs.length === 6);
          toast.success(`Loaded ${transformedJobs.length} more jobs`);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more jobs:", error);
      toast.error("Failed to load more jobs");
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, isAuthenticated, user]);

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

  const loadJobs = async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log("Jobs already loading, skipping...");
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setCurrentPage(0);
    setHasMore(true);

    try {
      console.log("Loading AI job recommendations with pagination...");

      // Check authentication status
      console.log("Current user:", user);
      console.log("Is authenticated:", isAuthenticated);
      console.log("Access token:", localStorage.getItem("access_token"));

      // Try unified recommendations if user is authenticated, otherwise use regular jobs with pagination
      if (isAuthenticated && user) {
        try {
          // Use the unified match service for recommendations
          const response = await JobMatchService.getVectorJobRecommendations(
            0,
            6,
            user.user_id,
          );

          console.log("Unified jobs recommendations response:", response);

          if (!mountedRef.current) {
            console.log("Component unmounted, skipping state update");
            return;
          }

          if (response.jobs && response.jobs.length > 0) {
            // NO NEED to fetch individual job details - the optimized endpoint returns everything!
            // Skip the extra API calls and use the data directly from recommendations
            console.log("Using optimized data - no extra API calls needed!");

            // Transform directly from response.jobs which already has all the data
            const transformedJobs = response.jobs.map((job: any) => {
              return {
                id: job.job_id,
                job_id: job.job_id,
                title: job.title,
                company: job.company,
                location: job.location,
                type: job.job_type || "Full-time",
                salary: job.salary_range || "Competitive",
                posted: job.created_at
                  ? new Date(job.created_at).toLocaleDateString()
                  : "Recently",
                // Use match_score directly from unified service
                matchScore: job.match_score || 0,
                skills: job.skills_required || job.matched_skills || [],
                description: job.description || "No description available",
                experienceLevel: job.experience_level || "Mid Level",
                companyInfo: {
                  logoUrl: undefined,
                },
                // Include additional fields
                benefits: job.benefits,
                remoteFriendly: job.remote_friendly,
                requirements: job.requirements,
              } as Job;
            });

            console.log(
              "Transformed Vector-recommended jobs:",
              transformedJobs,
            );
            transformedJobs.forEach((job) =>
              console.log(
                `Job: ${job.title} - Match Score: ${job.matchScore}%`,
              ),
            );

            if (mountedRef.current) {
              setJobs(transformedJobs); // Initial load - replace existing jobs
              setHasMore(response.jobs.length === 6);
              console.log(
                `Initial load. HasMore: ${response.jobs.length === 6}, Jobs returned: ${response.jobs.length}`,
              );
              toast.success(
                `Loaded ${transformedJobs.length} unified-recommended jobs`,
              );
            }
            return;
          }
        } catch (aiError: any) {
          console.error("Unified jobs recommendations error:", aiError);
          console.error("Error details:", {
            message: aiError.message,
            status: aiError.status,
            response: aiError.response,
          });
          console.warn(
            "Falling back to jobs list due to unified recommendations error",
          );
        }
      }

      // Fallback for unauthenticated users or when vector recommendations fail
      console.log("Loading regular jobs with pagination...");

      try {
        // Load regular jobs with pagination (6 jobs per page)
        const jobsResponse = await jobsService.getJobs({
          is_active: true,
          page: currentPage + 1, // Start from page 1
          limit: 6, // Load 6 jobs per page
          sort_by: "created_at",
          sort_order: "desc",
        });

        console.log("Jobs response from API:", jobsResponse);
        if (!mountedRef.current) {
          console.log("Component unmounted, skipping state update");
          return;
        }

        const apiJobs = jobsResponse.jobs || [];
        if (apiJobs.length > 0) {
          const transformedJobs = apiJobs.map((apiJob: any) => {
            // Parse skills from requirements if skills_required is null or empty
            let skills = [];
            if (
              Array.isArray(apiJob.skills_required) &&
              apiJob.skills_required.length > 0
            ) {
              skills = apiJob.skills_required;
            } else if (
              apiJob.skills_required &&
              !Array.isArray(apiJob.skills_required)
            ) {
              skills = [apiJob.skills_required];
            } else if (apiJob.requirements) {
              // Parse skills from requirements field (comma-separated or space-separated)
              const requirementsText = apiJob.requirements.toString();
              skills = requirementsText
                .split(/[,\n\r]+/)
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 0 && skill.length < 50) // Filter out very long strings
                .slice(0, 10); // Limit to 10 skills max
            }

            return {
              id: apiJob.job_id || apiJob.id,
              job_id: apiJob.job_id || apiJob.id,
              title: apiJob.title,
              company: apiJob.company,
              location: apiJob.location,
              type: apiJob.job_type || "Full-time",
              salary: apiJob.salary_range || "Competitive",
              posted: apiJob.created_at
                ? new Date(apiJob.created_at).toLocaleDateString()
                : "Recently",
              matchScore: 0, // Set match score to 0 for unauthenticated users
              skills: skills,
              description:
                apiJob.description ||
                apiJob.requirements ||
                "No description available",
              experienceLevel: apiJob.experience_level || "Mid Level",
              companyInfo: {
                logoUrl: undefined,
              },
              // Add additional fields that might be missing
              benefits: Array.isArray(apiJob.benefits)
                ? apiJob.benefits
                : apiJob.benefits
                  ? [apiJob.benefits]
                  : [],
              remoteFriendly: apiJob.remote_friendly || false,
              applicationDeadline: apiJob.application_deadline,
              requirements: apiJob.requirements || "",
              postedBy: apiJob.posted_by_name || apiJob.posted_by,
              isActive:
                apiJob.is_active !== undefined ? apiJob.is_active : true,
            } as Job;
          });

          transformedJobs.forEach((job) =>
            console.log(`Job: ${job.title} - Match Score: ${job.matchScore}%`),
          );

          if (mountedRef.current) {
            setJobs(transformedJobs);
            // Set hasMore based on whether we got a full page of results
            setHasMore(apiJobs.length === 6);
            toast.success(`Loaded ${transformedJobs.length} jobs`);
          }
          return;
        }
      } catch (jobsError: any) {
        console.log(
          "Regular jobs endpoint also failed, falling back to mock data",
        );
      }

      // Final fallback: Load mock data with UUID-compstiblr IDS
      console.log("Loading mock data with UUID-compatible IDS... ");
      const { mockJobs } = await import("@/data/mockJobs");

      // Transform mock jobs to have UUID-compatible IDs
      const transformedMockJobs = mockJobs.map((mockJob: any) => ({
        ...mockJob,
        job_id: generateMockUUID(mockJob.id || mockJob.job_id),
        id: generateMockUUID(mockJob.id || mockJob.job_id),
        matchScore:
          Math.round((mockJob.similarity_score ?? 0) * 100) ||
          Math.floor(Math.random() * 30) + 70, // Use similarity_score if available
      }));

      if (mountedRef.current) {
        setJobs(transformedMockJobs);
        toast.info("Showing sample jobs from database");
      }
    } catch (error: any) {
      console.error("Error loading jobs from API:", error);

      if (mountedRef.current) {
        console.log("Falling back to mock data due to error");

        try {
          const { mockJobs } = await import("@/data/mockJobs");

          // Transform mock jobs to have UUID-compatible IDS
          const transformedMockJobs = mockJobs.map((mockJob: any) => ({
            ...mockJob,
            job_id: generateMockUUID(mockJob.id || mockJob.job_id),
            id: generateMockUUID(mockJob.id || mockJob.job_id),
            matchScore:
              Math.round((mockJob.similarity_score ?? 0) * 100) ||
              Math.floor(Math.random() * 30) + 70,
          }));
          setJobs(transformedMockJobs);
          setError("Failed to load jobs from database. Showing sample data.");
          toast.error(
            "Failed to load jobs from database. Showing sample data.",
          );
        } catch (mockError) {
          console.error("Failed to load mock data:", mockError);
          setError("Failed to load jobs. Please try again later.");
          toast.error("Failed to load jobs. Please try again later.");
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
          <div className="relative container py-6 sm:py-12 px-3 sm:px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {authLoading ? "Loading user profile..." : "Loading jobs..."}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

        <div className="relative container py-6 sm:py-12 px-3 sm:px-4">
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
              {/* Manual Load More Button */}
              <button
                onClick={loadMoreJobs}
                disabled={loadingMore}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Jobs</span>
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
                  </>
                )}
              </button>

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
