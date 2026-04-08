
import { create } from "zustand";
import { toast } from "sonner";

export interface Interview {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  type: "Phone" | "Video" | "In-person";
  interviewerName: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

interface InterviewStore {
  interviews: Interview[];
  addInterview: (interview: Omit<Interview, 'id'>) => void;
  updateInterviewStatus: (id: string, status: Interview['status']) => void;
  getUpcomingInterviews: () => Interview[];
  getTodaysInterviews: () => Interview[];
}

const initialInterviews: Interview[] = [
  {
    id: "1",
    jobId: "3",
    jobTitle: "Backend Engineer",
    company: "DevCorp",
    date: "2024-06-15",
    time: "14:00",
    type: "Video",
    interviewerName: "Sarah Johnson",
    status: "Scheduled",
  },
  {
    id: "2",
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp",
    date: "2024-06-16",
    time: "10:30",
    type: "Phone",
    interviewerName: "Mike Chen",
    status: "Scheduled",
  },
];

export const useInterviewSchedule = create<InterviewStore>((set, get) => ({
  interviews: initialInterviews,
  
  addInterview: (interview) => {
    const newInterview: Interview = {
      ...interview,
      id: Date.now().toString(),
    };
    
    set((state) => ({
      interviews: [...state.interviews, newInterview],
    }));
    
    toast.success(`Interview scheduled for ${interview.jobTitle}`);
  },
  
  updateInterviewStatus: (id, status) => {
    set((state) => ({
      interviews: state.interviews.map((interview) =>
        interview.id === id ? { ...interview, status } : interview
      ),
    }));
    
    const interview = get().interviews.find(int => int.id === id);
    if (interview) {
      toast.success(`Interview status updated to ${status}`);
    }
  },
  
  getUpcomingInterviews: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().interviews.filter(
      interview => interview.date >= today && interview.status === "Scheduled"
    );
  },
  
  getTodaysInterviews: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().interviews.filter(
      interview => interview.date === today && interview.status === "Scheduled"
    );
  },
}));
