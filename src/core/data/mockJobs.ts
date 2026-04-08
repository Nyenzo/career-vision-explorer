
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  matchScore: number;
  skills: string[];
  description: string;
  experienceLevel?: string;
  companyInfo?: {
    logoUrl?: string;
  };
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Tech Solutions Ltd",
    location: "Nairobi, Kenya",
    type: "Full-time",
    salary: "50K-80K KES/month",
    posted: "2 days ago",
    matchScore: 92,
    experienceLevel: "Mid Level",
    skills: ["React", "JavaScript", "CSS", "UI/UX"],
    description: "We're looking for a Frontend Developer to join our team and help build responsive web applications using modern technologies like React, TypeScript, and Tailwind CSS.",
    companyInfo: {
      logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center"
    }
  },
  {
    id: "2",
    title: "Software Engineer",
    company: "Innovative Systems",
    location: "Nairobi, Kenya",
    type: "Full-time",
    salary: "70K-100K KES/month",
    posted: "1 week ago",
    matchScore: 85,
    experienceLevel: "Senior",
    skills: ["Python", "Django", "REST APIs", "PostgreSQL"],
    description: "Seeking a Software Engineer to develop and maintain backend services and APIs for our growing platform. Experience with Python and Django required.",
    companyInfo: {
      logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop&crop=center"
    }
  },
  {
    id: "3",
    title: "UX Designer",
    company: "Creative Digital Agency",
    location: "Remote",
    type: "Contract",
    salary: "60K-90K KES/month",
    posted: "3 days ago",
    matchScore: 78,
    experienceLevel: "Mid Level",
    skills: ["Figma", "User Research", "Prototyping", "UI Design"],
    description: "Looking for a UX Designer to create user-centered designs for web and mobile applications. Strong portfolio and Figma skills required.",
    companyInfo: {
      logoUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=400&fit=crop&crop=center"
    }
  },
  {
    id: "4",
    title: "Data Analyst",
    company: "Data Insights Co",
    location: "Mombasa, Kenya",
    type: "Full-time",
    salary: "45K-70K KES/month",
    posted: "Just now",
    matchScore: 65,
    experienceLevel: "Entry Level",
    skills: ["SQL", "Excel", "Data Visualization", "Statistics"],
    description: "Join our team as a Data Analyst to help extract insights from our growing datasets. Experience with SQL and data visualization tools preferred.",
    companyInfo: {
      logoUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop&crop=center"
    }
  },
  {
    id: "5",
    title: "Senior Product Manager",
    company: "TechCorp Inc.",
    location: "Hybrid - Nairobi",
    type: "Full-time",
    salary: "150K-200K KES/month",
    posted: "4 days ago",
    matchScore: 89,
    experienceLevel: "Executive",
    skills: ["Product Strategy", "Agile", "User Research", "Roadmapping"],
    description: "We're looking for an experienced Product Manager to lead our flagship product development and work with cross-functional teams.",
    companyInfo: {
      logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop&crop=center"
    }
  }
];
