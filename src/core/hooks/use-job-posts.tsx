
import { create } from "zustand";
import { toast } from "sonner";

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
  addJob: (job: JobPost) => void;
  removeJob: (id: string) => void;
  updateJob: (id: string, updatedJob: Partial<JobPost>) => void;
  getJob: (id: string) => JobPost | undefined;
  updateFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
}

// Enhanced sample job data
const initialJobs: JobPost[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    description: "We're looking for an experienced Frontend Developer to join our team and build amazing user interfaces.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    isBoosted: true,
    datePosted: "2023-05-01T12:00:00Z",
    applicants: 12,
    views: 245,
  },
  {
    id: "2",
    title: "UX Designer",
    description: "Design beautiful user experiences for our products using modern design principles.",
    location: "Remote",
    type: "Full-time",
    salary: "$90,000 - $110,000",
    isBoosted: false,
    datePosted: "2023-05-05T09:30:00Z",
    applicants: 8,
    views: 187,
  },
  {
    id: "3",
    title: "Backend Engineer",
    description: "Build scalable APIs and backend systems using modern technologies.",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    isBoosted: true,
    datePosted: "2023-05-03T14:15:00Z",
    applicants: 15,
    views: 312,
  },
  {
    id: "4",
    title: "DevOps Engineer",
    description: "Manage our cloud infrastructure and CI/CD pipelines for optimal performance.",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$115,000 - $140,000",
    isBoosted: false,
    datePosted: "2023-05-07T10:45:00Z",
    applicants: 6,
    views: 153,
  },
  {
    id: "5",
    title: "Product Manager",
    description: "Lead product strategy and work with cross-functional teams to deliver great products.",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$140,000 - $170,000",
    isBoosted: true,
    datePosted: "2023-05-02T16:20:00Z",
    applicants: 20,
    views: 428,
  },
  {
    id: "6",
    title: "Data Scientist",
    description: "Analyze complex datasets to derive insights and build predictive models.",
    location: "Chicago, IL",
    type: "Contract",
    salary: "$100,000 - $130,000",
    isBoosted: false,
    datePosted: "2023-05-06T11:30:00Z",
    applicants: 9,
    views: 201,
  },
];

export const useJobPosts = create<JobStore>((set, get) => ({
  jobs: initialJobs,
  filteredJobs: initialJobs,
  filters: {
    jobType: 'all',
    dateRange: 30,
    boostedOnly: false,
    searchQuery: '',
    location: 'all',
  },
  
  addJob: (job) => {
    set((state) => {
      const newJobs = [...state.jobs, job];
      return {
        jobs: newJobs,
        filteredJobs: applyFilters(newJobs, state.filters),
      };
    });
    toast.success("Job posted successfully!");
  },
  
  removeJob: (id) => {
    const jobToRemove = get().jobs.find(job => job.id === id);
    if (jobToRemove) {
      set((state) => {
        const newJobs = state.jobs.filter(job => job.id !== id);
        return {
          jobs: newJobs,
          filteredJobs: applyFilters(newJobs, state.filters),
        };
      });
      toast.success(`Job "${jobToRemove.title}" has been deleted.`);
    }
  },
  
  updateJob: (id, updatedJob) => {
    const jobs = get().jobs;
    const jobIndex = jobs.findIndex(job => job.id === id);
    
    if (jobIndex !== -1) {
      const updatedJobs = [...jobs];
      updatedJobs[jobIndex] = { ...updatedJobs[jobIndex], ...updatedJob };
      
      set((state) => ({
        jobs: updatedJobs,
        filteredJobs: applyFilters(updatedJobs, state.filters),
      }));
      toast.success(`Job updated successfully.`);
    }
  },
  
  getJob: (id) => {
    return get().jobs.find(job => job.id === id);
  },
  
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
      jobType: 'all',
      dateRange: 30,
      boostedOnly: false,
      searchQuery: '',
      location: 'all',
    };
    set((state) => ({
      filters: defaultFilters,
      filteredJobs: applyFilters(state.jobs, defaultFilters),
    }));
  },
}));

// Enhanced filter function
function applyFilters(jobs: JobPost[], filters: JobFilters): JobPost[] {
  return jobs.filter(job => {
    // Filter by job type
    if (filters.jobType && filters.jobType !== 'all' && job.type !== filters.jobType) {
      return false;
    }
    
    // Filter by location
    if (filters.location && filters.location !== 'all' && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);
      if (new Date(job.datePosted) < cutoffDate) {
        return false;
      }
    }
    
    // Filter by boosted status
    if (filters.boostedOnly && !job.isBoosted) {
      return false;
    }
    
    // Filter by search query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.type.toLowerCase().includes(query) ||
        job.salary.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
}
