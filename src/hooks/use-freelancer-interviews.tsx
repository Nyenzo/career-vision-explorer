import { create } from "zustand";
import { FreelancerInterview } from "@/types/freelancer";
import { toast } from "@/components/ui/sonner";

interface FreelancerInterviewStore {
  interviews: FreelancerInterview[];
  addInterview: (interview: Omit<FreelancerInterview, 'id' | 'createdAt'>) => void;
  updateInterview: (id: string, updates: Partial<FreelancerInterview>) => void;
  updateInterviewStatus: (id: string, status: FreelancerInterview['status']) => void;
  removeInterview: (id: string) => void;
  getInterviewsByFreelancer: (freelancerId: string) => FreelancerInterview[];
  getInterviewsByClient: (clientId: string) => FreelancerInterview[];
  getAllInterviews: () => FreelancerInterview[];
  scheduleInterview: (interviewData: {
    freelancerId: string;
    freelancerName: string;
    clientId: string;
    clientName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: string;
    type: "Video" | "Phone" | "In-person";
    tier?: string;
    notes?: string;
  }) => void;
  generateMeetingLink: (interviewId: string) => string;
}

// Sample interview data
const initialInterviews: FreelancerInterview[] = [
  {
    id: "1",
    freelancerId: "1",
    freelancerName: "Sarah Designer",
    clientId: "2",
    clientName: "John Client",
    scheduledDate: "2024-07-20",
    scheduledTime: "14:00",
    duration: "60 minutes",
    status: "Scheduled",
    type: "Video",
    meetingLink: "https://meet.example.com/freelancer-interview-1",
    tier: "standard",
    createdAt: "2024-07-15T10:00:00Z",
    isMonitoredByAdmin: true,
  }
];

export const useFreelancerInterviews = create<FreelancerInterviewStore>((set, get) => ({
  interviews: initialInterviews,
  
  addInterview: (interview) => {
    const newInterview: FreelancerInterview = {
      ...interview,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      interviews: [...state.interviews, newInterview],
    }));
    
    toast.success("Video call interview has been scheduled successfully.");
  },
  
  updateInterview: (id, updates) => {
    set((state) => ({
      interviews: state.interviews.map(interview =>
        interview.id === id ? { ...interview, ...updates } : interview
      ),
    }));
  },
  
  updateInterviewStatus: (id, status) => {
    set((state) => ({
      interviews: state.interviews.map(interview =>
        interview.id === id ? { ...interview, status } : interview
      ),
    }));
    
    toast.success(`Interview status changed to ${status}`);
  },
  
  removeInterview: (id) => {
    set((state) => ({
      interviews: state.interviews.filter(interview => interview.id !== id),
    }));
    
    toast.success("The interview has been cancelled.");
  },
  
  getInterviewsByFreelancer: (freelancerId) => {
    return get().interviews.filter(interview => interview.freelancerId === freelancerId);
  },
  
  getInterviewsByClient: (clientId) => {
    return get().interviews.filter(interview => interview.clientId === clientId);
  },
  
  getAllInterviews: () => {
    return get().interviews;
  },
  
  scheduleInterview: (interviewData) => {
    const meetingLink = get().generateMeetingLink(Date.now().toString());
    
    const newInterview: FreelancerInterview = {
      id: Date.now().toString(),
      ...interviewData,
      meetingLink: interviewData.type === "Video" ? meetingLink : undefined,
      status: "Scheduled",
      createdAt: new Date().toISOString(),
      isMonitoredByAdmin: true,
    };
    
    set((state) => ({
      interviews: [...state.interviews, newInterview],
    }));
    
    toast.success("Video call interview has been scheduled successfully.");
  },
  
  generateMeetingLink: (interviewId) => {
    return `https://meet.lovable.app/freelancer-interview-${interviewId}`;
  },
}));