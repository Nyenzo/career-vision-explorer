
import { create } from "zustand";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  position: string;
  jobId: string;
  appliedTime: string;
  status: "Applied" | "Reviewing" | "Interview" | "Rejected" | "Hired";
  resume?: string;
  coverLetter?: string;
  matchScore: number;
  notes?: string;
  phone?: string;
  resumeUrl?: string;
}

interface ApplicantStore {
  applicants: Applicant[];
  addApplicant: (applicant: Applicant) => void;
  updateApplicant: (id: string, updates: Partial<Applicant>) => void;
  updateApplicantStatus: (id: string, status: string) => void;
  removeApplicant: (id: string) => void;
  getApplicantsByJob: (jobId: string) => Applicant[];
  getApplicantsByJobId: (jobId: string) => Applicant[];
  getAllApplicants: () => Applicant[];
}

// Sample applicant data
const initialApplicants: Applicant[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    position: "Senior Frontend Developer",
    jobId: "1",
    appliedTime: "2 days ago",
    status: "Reviewing",
    matchScore: 85,
    notes: "Strong React experience, good portfolio",
    phone: "+1-555-0123",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    position: "UX Designer",
    jobId: "2",
    appliedTime: "1 day ago",
    status: "Applied",
    matchScore: 92,
    notes: "Excellent design portfolio, Adobe Creative Suite expert",
    phone: "+1-555-0124",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@email.com",
    position: "Backend Engineer",
    jobId: "3",
    appliedTime: "3 days ago",
    status: "Interview",
    matchScore: 78,
    notes: "Good Node.js skills, needs improvement in system design",
    phone: "+1-555-0125",
  },
];

export const useApplicants = create<ApplicantStore>((set, get) => ({
  applicants: initialApplicants,
  
  addApplicant: (applicant) => {
    set((state) => ({
      applicants: [...state.applicants, applicant],
    }));
  },
  
  updateApplicant: (id, updates) => {
    set((state) => ({
      applicants: state.applicants.map(applicant =>
        applicant.id === id ? { ...applicant, ...updates } : applicant
      ),
    }));
  },
  
  updateApplicantStatus: (id, status) => {
    set((state) => ({
      applicants: state.applicants.map(applicant =>
        applicant.id === id ? { ...applicant, status: status as any } : applicant
      ),
    }));
  },
  
  removeApplicant: (id) => {
    set((state) => ({
      applicants: state.applicants.filter(applicant => applicant.id !== id),
    }));
  },
  
  getApplicantsByJob: (jobId) => {
    return get().applicants.filter(applicant => applicant.jobId === jobId);
  },
  
  getApplicantsByJobId: (jobId) => {
    return get().applicants.filter(applicant => applicant.jobId === jobId);
  },
  
  getAllApplicants: () => {
    return get().applicants;
  },
}));
