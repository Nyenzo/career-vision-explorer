
export interface Content {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  status: ContentStatus;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  location?: string; // For website sections like header, footer, etc.
}

export type ContentStatus = "draft" | "published" | "archived";
export type ContentType = 
  | "page" 
  | "article" 
  | "blog" 
  | "faq" 
  | "header" 
  | "footer" 
  | "navigation" 
  | "hero" 
  | "cta" 
  | "feature" 
  | "testimonial-section"
  | "notification"
  | "email"
  | "button"
  | "form"
  | "error"
  | "popup"
  | "tooltip"
  | "placeholder"
  | "about-hero"
  | "about-mission"
  | "about-feature"
  | "about-story"
  | "about-stats"
  | "about-achievement";
