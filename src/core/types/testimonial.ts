
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  category: "job-seeker" | "employer" | "career-coach" | "general";
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type TestimonialStatus = "pending" | "approved" | "rejected";
export type TestimonialCategory = "job-seeker" | "employer" | "career-coach" | "general";
