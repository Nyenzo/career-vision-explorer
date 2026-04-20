import { useEffect } from "react";
import { create } from "zustand";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export interface WishlistJob {
  job_id: string;
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
  logoUrl?: string;
  dateSaved: string;
}

interface WishlistStore {
  wishlistJobs: WishlistJob[];
  isLoaded: boolean;
  loadedUserId: string | null;
  loadWishlist: (userId: string) => Promise<void>;
  addToWishlist: (job: Omit<WishlistJob, "dateSaved">) => Promise<void>;
  removeFromWishlist: (jobId: string) => Promise<void>;
  isJobInWishlist: (jobId: string) => boolean;
  clearWishlist: () => Promise<void>;
}

type SavedJobApiItem = {
  id: string;
  job_id: string;
  created_at: string;
  job?: {
    id?: string;
    job_title?: string;
    company_name?: string;
    company_logo_url?: string;
    location?: string;
    job_type?: string;
    salary_range?: string;
    match_score?: number;
    required_skills?: string[];
    job_description?: string;
    experience_level?: string;
    created_at?: string;
  };
};

const humanizeJobType = (jobType?: string) => {
  if (!jobType) return "Not specified";
  return jobType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const mapSavedJobToWishlistJob = (saved: SavedJobApiItem): WishlistJob => {
  const job = saved.job || {};
  return {
    job_id: String(saved.job_id || job.id || ""),
    title: job.job_title || "Untitled Role",
    company: job.company_name || "Unknown Company",
    location: job.location || "Location not specified",
    type: humanizeJobType(job.job_type),
    salary: job.salary_range || "Not specified",
    posted: job.created_at || saved.created_at,
    matchScore:
      typeof job.match_score === "number" ? Math.round(job.match_score) : 0,
    skills: Array.isArray(job.required_skills) ? job.required_skills : [],
    description: job.job_description || "",
    experienceLevel: job.experience_level,
    logoUrl: job.company_logo_url || undefined,
    dateSaved: saved.created_at,
  };
};

const useWishlistStore = create<WishlistStore>((set, get) => ({
  wishlistJobs: [],
  isLoaded: false,
  loadedUserId: null,

  loadWishlist: async (userId) => {
    try {
      const savedJobs = await apiClient.get<SavedJobApiItem[]>("/jobs/saved");
      set({
        wishlistJobs: (savedJobs || []).map(mapSavedJobToWishlistJob),
        isLoaded: true,
        loadedUserId: userId,
      });
    } catch (error) {
      set({ isLoaded: true, loadedUserId: userId });
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("403") && !message.includes("Only job seekers")) {
        console.error("Failed to load saved jobs", error);
      }
    }
  },

  addToWishlist: async (job) => {
    const { wishlistJobs } = get();

    if (!wishlistJobs.find((w) => w.job_id === job.job_id)) {
      const newWishlistJob: WishlistJob = {
        ...job,
        dateSaved: new Date().toISOString(),
      };

      set({ wishlistJobs: [...wishlistJobs, newWishlistJob] });

      try {
        await apiClient.post(`/jobs/${job.job_id}/save`);
      } catch (error) {
        set({ wishlistJobs });
        const message =
          error instanceof Error ? error.message : "Failed to save job";
        toast.error(message);
        return;
      }

      toast.success(`${job.title} added to wishlist`);
    }
  },

  removeFromWishlist: async (jobId) => {
    const { wishlistJobs } = get();
    const jobToRemove = wishlistJobs.find((job) => job.job_id === jobId);

    if (jobToRemove) {
      const nextWishlist = wishlistJobs.filter((job) => job.job_id !== jobId);
      set({ wishlistJobs: nextWishlist });

      try {
        await apiClient.delete(`/jobs/${jobId}/save`);
      } catch (error) {
        set({ wishlistJobs });
        const message =
          error instanceof Error ? error.message : "Failed to remove saved job";
        toast.error(message);
        return;
      }

      toast.success(`${jobToRemove.title} removed from wishlist`);
    }
  },

  isJobInWishlist: (jobId) => {
    return get().wishlistJobs.some((job) => job.job_id === jobId);
  },

  clearWishlist: async () => {
    const { wishlistJobs } = get();

    set({ wishlistJobs: [] });

    await Promise.allSettled(
      wishlistJobs.map((job) => apiClient.delete(`/jobs/${job.job_id}/save`)),
    );

    toast.success("Wishlist cleared");
  },
}));

export const useWishlist = () => {
  const wishlistJobs = useWishlistStore((state) => state.wishlistJobs);
  const isLoaded = useWishlistStore((state) => state.isLoaded);
  const loadedUserId = useWishlistStore((state) => state.loadedUserId);
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );
  const isJobInWishlist = useWishlistStore((state) => state.isJobInWishlist);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  const { isAuthenticated, user } = useAuth();
  const activeUserId = user?.user_id || null;

  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.account_type !== "job_seeker" ||
      !activeUserId
    ) {
      if (wishlistJobs.length > 0 || isLoaded || loadedUserId) {
        useWishlistStore.setState({
          wishlistJobs: [],
          isLoaded: false,
          loadedUserId: null,
        });
      }
      return;
    }

    if (!isLoaded || loadedUserId !== activeUserId) {
      useWishlistStore.setState({
        wishlistJobs: [],
        isLoaded: false,
        loadedUserId: activeUserId,
      });
      void loadWishlist(activeUserId);
    }
  }, [
    activeUserId,
    isAuthenticated,
    isLoaded,
    loadedUserId,
    loadWishlist,
    wishlistJobs.length,
    user?.account_type,
  ]);

  return {
    wishlistJobs,
    isLoaded,
    loadedUserId,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isJobInWishlist,
    clearWishlist,
  };
};
