
import { create } from "zustand";

export interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobId: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
  type: "Phone" | "Video" | "In-person";
  notes?: string;
  applicantName: string;
  interviewer: string;
  interviewType: "Phone" | "Video" | "In-Person";
}

interface InterviewStore {
  interviews: Interview[];
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  updateInterviewStatus: (id: string, status: string) => void;
  removeInterview: (id: string) => void;
  getInterviewsByJob: (jobId: string) => Interview[];
  scheduleInterview: (interview: Partial<Interview> & { 
    applicantId: string; 
    applicantName: string; 
    jobId: string; 
    jobTitle: string; 
    scheduledDate: string; 
    scheduledTime: string; 
    status: string; 
    interviewType: "Phone" | "Video" | "In-Person"; 
    interviewer: string; 
    notes?: string;
  }) => void;
}

// Sample interview data
const initialInterviews: Interview[] = [
  {
    id: "1",
    candidateName: "John Doe",
    candidateEmail: "john.doe@email.com",
    jobTitle: "Senior Frontend Developer",
    jobId: "1",
    scheduledDate: "2023-06-15",
    scheduledTime: "10:00 AM",
    duration: "1 hour",
    status: "Scheduled",
    type: "Video",
    applicantName: "John Doe",
    interviewer: "Sarah Wilson",
    interviewType: "Video",
  },
  {
    id: "2",
    candidateName: "Mike Johnson",
    candidateEmail: "mike.j@email.com",
    jobTitle: "Backend Engineer",
    jobId: "3",
    scheduledDate: "2023-06-16",
    scheduledTime: "2:00 PM",
    duration: "45 minutes",
    status: "Scheduled",
    type: "Phone",
    applicantName: "Mike Johnson",
    interviewer: "David Chen",
    interviewType: "Phone",
  },
];

export const useInterviews = create<InterviewStore>((set, get) => ({
  interviews: initialInterviews,
  
  addInterview: (interview) => {
    set((state) => ({
      interviews: [...state.interviews, interview],
    }));
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
        interview.id === id ? { ...interview, status: status as any } : interview
      ),
    }));
  },
  
  removeInterview: (id) => {
    set((state) => ({
      interviews: state.interviews.filter(interview => interview.id !== id),
    }));
  },
  
  getInterviewsByJob: (jobId) => {
    return get().interviews.filter(interview => interview.jobId === jobId);
  },
  
  scheduleInterview: (interviewData) => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      candidateName: interviewData.applicantName,
      candidateEmail: "",
      jobTitle: interviewData.jobTitle,
      jobId: interviewData.jobId,
      scheduledDate: interviewData.scheduledDate,
      scheduledTime: interviewData.scheduledTime,
      duration: "1 hour",
      status: interviewData.status as any,
      type: interviewData.interviewType === "In-Person" ? "In-person" : interviewData.interviewType,
      notes: interviewData.notes,
      applicantName: interviewData.applicantName,
      interviewer: interviewData.interviewer,
      interviewType: interviewData.interviewType,
    };
    
    set((state) => ({
      interviews: [...state.interviews, newInterview],
    }));
  },
}));
