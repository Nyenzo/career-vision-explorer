
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const testimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  content: z.string().min(10, "Testimonial must be at least 10 characters"),
  rating: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 5, "Rating must be between 1 and 5"),
  status: z.enum(["pending", "approved", "rejected"]),
  category: z.enum(["job-seeker", "employer", "career-coach", "general"]),
  image: z.string().optional(),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;

export const useTestimonialForm = () => {
  return useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      company: "",
      content: "",
      rating: "5",
      status: "pending",
      category: "job-seeker",
      image: "",
    },
  });
};
