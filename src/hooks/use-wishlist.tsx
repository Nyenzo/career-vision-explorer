
import { create } from "zustand";
import { toast } from "sonner";

export interface WishlistJob {
  job_id: string;
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
  dateSaved: string;
}

interface WishlistStore {
  wishlistJobs: WishlistJob[];
  addToWishlist: (job: Omit<WishlistJob, 'dateSaved'>) => void;
  removeFromWishlist: (jobId: string) => void;
  isJobInWishlist: (jobId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  wishlistJobs: [],
  
  addToWishlist: (job) => {
    const { wishlistJobs } = get();
if (!wishlistJobs.find(w => w.job_id === job.job_id)) {
      const newWishlistJob: WishlistJob = {
        ...job,
        dateSaved: new Date().toISOString()
      };
      set({ wishlistJobs: [...wishlistJobs, newWishlistJob] });
      toast.success(`${job.title} added to wishlist`);
    }
  },
  
  removeFromWishlist: (jobId) => {
    const { wishlistJobs } = get();
const jobToRemove = wishlistJobs.find(job => job.job_id === jobId);
    if (jobToRemove) {
set({ wishlistJobs: wishlistJobs.filter(job => job.job_id !== jobId) });
      toast.success(`${jobToRemove.title} removed from wishlist`);
    }
  },
  
  isJobInWishlist: (jobId) => {
return get().wishlistJobs.some(job => job.job_id === jobId);
  },
  
  clearWishlist: () => {
    set({ wishlistJobs: [] });
    toast.success("Wishlist cleared");
  }
}));
