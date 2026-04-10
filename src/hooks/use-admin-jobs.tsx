import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export interface AdminJob {
  job_id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  department: string;
  status: 'active' | 'draft' | 'expired';
  applications: number;
  postedDate: string;
  salary?: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  remote_allowed?: boolean;
  created_by?: string;
  updated_at?: string;
}

interface AdminJobsContextType {
  jobs: AdminJob[];
  filteredJobs: AdminJob[];
  searchQuery: string;
  statusFilter: string;
  loading: boolean;
  error: string | null;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  refreshJobs: () => Promise<void>;
  createJob: (jobData: Partial<AdminJob>) => Promise<AdminJob>;
  updateJob: (id: string, jobData: Partial<AdminJob>) => Promise<AdminJob>;
  deleteJob: (id: string) => Promise<void>;
  getJobStats: () => Promise<any>;
}

const AdminJobsContext = createContext<AdminJobsContextType | undefined>(undefined);

// Mock data for development until backend integration is complete
const mockJobs: AdminJob[] = [
  {
    job_id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'full-time',
    department: 'Engineering',
    status: 'active',
    applications: 45,
    postedDate: '2024-01-15',
    salary: '$120,000 - $160,000',
    description: 'We are looking for a senior frontend developer...',
    requirements: ['React', 'TypeScript', '5+ years experience'],
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
    remote_allowed: true
  },
  {
    job_id: '2',
    title: 'Backend Developer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'full-time',
    department: 'Engineering',
    status: 'active',
    applications: 32,
    postedDate: '2024-01-10',
    salary: '$100,000 - $140,000',
    description: 'Join our backend team to build scalable systems...',
    requirements: ['Python', 'FastAPI', '3+ years experience'],
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker']
  },
  {
    job_id: '3',
    title: 'Product Manager',
    company: 'InnovateLabs',
    location: 'Austin, TX',
    type: 'full-time',
    department: 'Product',
    status: 'draft',
    applications: 0,
    postedDate: '2024-01-12',
    salary: '$90,000 - $130,000',
    description: 'Lead product development initiatives...',
    requirements: ['Product Management', 'Agile', '2+ years experience'],
    skills: ['Product Management', 'Agile', 'Analytics', 'User Research']
  }
];

export function AdminJobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<AdminJob[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter jobs based on search query and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const refreshJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from backend first
      const response = await apiClient.get<AdminJob[]>('/jobs');
      setJobs(response);
    } catch (err) {
      console.warn('Backend not available, using mock data:', err);
      // Use mock data if backend is not available
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: Partial<AdminJob>): Promise<AdminJob> => {
    setLoading(true);
    try {
      // Try backend first
      const newJob = await apiClient.post<AdminJob>('/jobs', jobData);
      setJobs(prev => [...prev, newJob]);
      toast({
        title: "Success",
        description: "Job created successfully",
      });
      return newJob;
    } catch (err) {
      console.warn('Backend not available, creating mock job:', err);
      // Create mock job
      const newJob: AdminJob = {
        job_id: Date.now().toString(),
        title: jobData.title || 'New Job',
        company: jobData.company || 'Company',
        location: jobData.location || 'Location',
        type: jobData.type || 'full-time',
        department: jobData.department || 'General',
        status: jobData.status || 'draft',
        applications: 0,
        postedDate: new Date().toISOString().split('T')[0],
        ...jobData
      };
      setJobs(prev => [...prev, newJob]);
      toast({
        title: "Success",
        description: "Job created successfully (mock)",
      });
      return newJob;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (id: string, jobData: Partial<AdminJob>): Promise<AdminJob> => {
    setLoading(true);
    try {
      // Try backend first
      const updatedJob = await apiClient.put<AdminJob>(`/jobs/${id}`, jobData);
      setJobs(prev => prev.map(job => job.job_id === id ? updatedJob : job));
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      return updatedJob;
    } catch (err) {
      console.warn('Backend not available, updating mock job:', err);
      // Update mock job
      setJobs(prev => prev.map(job => 
        job.job_id === id ? { ...job, ...jobData } : job
      ));
      const updatedJob = jobs.find(job => job.job_id === id);
      if (updatedJob) {
        toast({
          title: "Success",
          description: "Job updated successfully (mock)",
        });
        return { ...updatedJob, ...jobData };
      }
      throw new Error('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Try backend first
      await apiClient.delete(`/jobs/${id}`);
      setJobs(prev => prev.filter(job => job.job_id !== id));
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (err) {
      console.warn('Backend not available, deleting mock job:', err);
      // Delete mock job
      setJobs(prev => prev.filter(job => job.job_id !== id));
      toast({
        title: "Success",
        description: "Job deleted successfully (mock)",
      });
    } finally {
      setLoading(false);
    }
  };

  const getJobStats = async () => {
    try {
      // Try backend first
      return await apiClient.get('/jobs/stats');
    } catch (err) {
      console.warn('Backend not available, using mock stats:', err);
      // Return mock stats
      return {
        total: jobs.length,
        active: jobs.filter(j => j.status === 'active').length,
        draft: jobs.filter(j => j.status === 'draft').length,
        expired: jobs.filter(j => j.status === 'expired').length,
        total_applications: jobs.reduce((sum, j) => sum + j.applications, 0)
      };
    }
  };

  useEffect(() => {
    refreshJobs();
  }, []);

  const value: AdminJobsContextType = {
    jobs,
    filteredJobs,
    searchQuery,
    statusFilter,
    loading,
    error,
    setSearchQuery,
    setStatusFilter,
    refreshJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobStats
  };

  return (
    <AdminJobsContext.Provider value={value}>
      {children}
    </AdminJobsContext.Provider>
  );
}

export function useAdminJobs() {
  const context = useContext(AdminJobsContext);
  if (context === undefined) {
    throw new Error('useAdminJobs must be used within an AdminJobsProvider');
  }
  return context;
}

export { AdminJob };
