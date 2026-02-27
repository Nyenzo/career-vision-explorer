
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const contentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  type: z.enum([
    "page", 
    "article", 
    "blog", 
    "faq", 
    "header", 
    "footer", 
    "navigation", 
    "hero", 
    "cta", 
    "feature", 
    "testimonial-section",
    "notification",
    "email",
    "button",
    "form",
    "error",
    "popup",
    "tooltip",
    "placeholder",
    "about-hero",
    "about-mission",
    "about-feature",
    "about-story",
    "about-stats",
    "about-achievement"
  ]),
  status: z.enum(["draft", "published", "archived"]),
  content: z.string().min(1, "Content cannot be empty"),
  excerpt: z.string().min(5, "Description must be at least 5 characters"),
  location: z.string().optional(),
});

export type ContentFormData = z.infer<typeof contentSchema>;

export const useContentForm = () => {
  return useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: "page",
      status: "draft",
      content: "",
      excerpt: "",
      location: "",
    },
  });
};
