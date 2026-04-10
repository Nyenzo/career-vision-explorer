
import { create } from "zustand";
import { toast } from "sonner";

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  status: "active" | "draft" | "expired";
  applications: number;
  description: string;
  requirements: string[];
  salary: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  experience: string;
  department: string;
}

interface AdminJobsStore {
  jobs: AdminJob[];
  filteredJobs: AdminJob[];
  searchQuery: string;
  statusFilter: string;
  addJob: (job: Omit<AdminJob, "id" | "postedDate" | "applications">) => void;
  updateJob: (id: string, job: Partial<AdminJob>) => void;
  deleteJob: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  getJobById: (id: string) => AdminJob | undefined;
}

const initialJobs: AdminJob[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    postedDate: "2023-05-12",
    status: "active",
    applications: 24,
    description: "We are looking for a Senior Frontend Developer with React experience to join our team. You'll be working on our flagship product and collaborating with designers and backend engineers.",
    requirements: ["5+ years React experience", "TypeScript proficiency", "Modern CSS frameworks", "Testing experience"],
    salary: "$120,000 - $150,000",
    type: "full-time",
    experience: "Senior",
    department: "Engineering"
  },
  {
    id: "2", 
    title: "Product Manager",
    company: "InnovateSoft",
    location: "New York, NY",
    postedDate: "2023-05-10",
    status: "active",
    applications: 18,
    description: "InnovateSoft is seeking a Product Manager to lead our product development initiatives. The ideal candidate has 5+ years of experience in SaaS products.",
    requirements: ["Product management experience", "Agile methodologies", "Stakeholder management", "Data analysis skills"],
    salary: "$100,000 - $130,000",
    type: "full-time",
    experience: "Mid-Senior",
    department: "Product"
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "DataViz Analytics", 
    location: "Remote",
    postedDate: "2023-05-08",
    status: "draft",
    applications: 0,
    description: "Join our data science team to work on cutting-edge machine learning models. We're looking for someone with a strong background in statistics and Python programming.",
    requirements: ["Python/R proficiency", "Machine learning experience", "Statistical analysis", "Data visualization"],
    salary: "$110,000 - $140,000",
    type: "full-time",
    experience: "Mid-Senior",
    department: "Data"
  },
  {
    id: "4",
    title: "UX Designer",
    company: "CreativeMinds",
    location: "Chicago, IL", 
    postedDate: "2023-04-15",
    status: "expired",
    applications: 32,
    description: "As a UX Designer at CreativeMinds, you'll be responsible for creating intuitive and engaging user experiences for our clients across various industries.",
    requirements: ["Design portfolio", "Figma/Sketch proficiency", "User research experience", "Prototyping skills"],
    salary: "$80,000 - $100,000",
    type: "full-time",
    experience: "Mid-Level",
    department: "Design"
  }
];

export const useAdminJobs = create<AdminJobsStore>((set, get) => ({
  jobs: initialJobs,
  filteredJobs: initialJobs,
  searchQuery: "",
  statusFilter: "all",

  addJob: (jobData) => {
    const newJob: AdminJob = {
      ...jobData,
      id: crypto.randomUUID(),
      postedDate: new Date().toISOString().split('T')[0],
      applications: 0,
    };

    set((state) => {
      const newJobs = [...state.jobs, newJob];
      return {
        jobs: newJobs,
        filteredJobs: filterJobs(newJobs, state.searchQuery, state.statusFilter),
      };
    });

    toast.success(`Job "${jobData.title}" has been created successfully`);
  },

  updateJob: (id, updates) => {
    set((state) => {
      const newJobs = state.jobs.map(job => 
        job.id === id ? { ...job, ...updates } : job
      );
      return {
        jobs: newJobs,
        filteredJobs: filterJobs(newJobs, state.searchQuery, state.statusFilter),
      };
    });

    const job = get().jobs.find(j => j.id === id);
    toast.success(`Job "${job?.title}" has been updated successfully`);
  },

  deleteJob: (id) => {
    const job = get().jobs.find(j => j.id === id);
    
    set((state) => {
      const newJobs = state.jobs.filter(j => j.id !== id);
      return {
        jobs: newJobs,
        filteredJobs: filterJobs(newJobs, state.searchQuery, state.statusFilter),
      };
    });

    toast.success(`Job "${job?.title}" has been deleted successfully`);
  },

  setSearchQuery: (query) => {
    set((state) => ({
      searchQuery: query,
      filteredJobs: filterJobs(state.jobs, query, state.statusFilter),
    }));
  },

  setStatusFilter: (status) => {
    set((state) => ({
      statusFilter: status,
      filteredJobs: filterJobs(state.jobs, state.searchQuery, status),
    }));
  },

  getJobById: (id) => {
    return get().jobs.find(job => job.id === id);
  },
}));

function filterJobs(jobs: AdminJob[], searchQuery: string, statusFilter: string): AdminJob[] {
  return jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}
