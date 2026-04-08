import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeatureSection from "@/components/home/FeatureSection";
import { useAuth } from "@/hooks/use-auth";
import { useFeatures } from "@/hooks/use-features";
import { Button } from "@/components/ui/button";
import { Shield, Briefcase, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy sections
const CareerJourneySection = lazy(
  () => import("@/components/home/CareerJourneySection")
);
const ToolsSection = lazy(() => import("@/components/home/ToolsSection"));
const JobListingSection = lazy(
  () => import("@/components/home/JobListingSection")
);
const CareerPathSection = lazy(
  () => import("@/components/home/CareerPathSection")
);
const PartnerShowcaseSection = lazy(
  () => import("@/components/home/PartnerShowcaseSection")
);
const TestimonialSection = lazy(
  () => import("@/components/home/TestimonialSection")
);
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Lightweight loading component for sections
const SectionLoader = () => (
  <div className="py-16">
    <div className="max-w-7xl mx-auto px-4">
      <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, user } = useAuth();
  const { features } = useFeatures();
  const navigate = useNavigate();

  const featuredJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120,000 - $150,000",
      tags: ["React", "TypeScript", "UI/UX"],
    },
    {
      id: 2,
      title: "Product Manager",
      company: "InnovateSoft",
      location: "New York, NY",
      salary: "$110,000 - $135,000",
      tags: ["Product Strategy", "Agile", "UX Research"],
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "DataViz Analytics",
      location: "Remote",
      salary: "$125,000 - $160,000",
      tags: ["Python", "Machine Learning", "Statistics"],
    },
  ];

  const careerPaths = [
    {
      id: 1,
      title: "Software Development",
      description:
        "From junior developer to CTO, explore the software development career path",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 2,
      title: "Data Science",
      description:
        "Navigate the world of data, from analyst to chief data officer",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 3,
      title: "Product Management",
      description: "Build the roadmap from product associate to VP of Product",
      image:
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200",
    },
  ];

  const testimonials = [
    {
      id: 1,
      quote:
        "Visiondrill helped me understand my career options and find a job that perfectly matches my skills and aspirations.",
      author: "Maria Rodriguez",
      role: "UX Designer at DesignHub",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&face=1",
      rating: 5,
    },
    {
      id: 2,
      quote:
        "The career path visualization feature is incredible. It gave me a clear roadmap of skills I need to develop to reach my goals.",
      author: "James Wilson",
      role: "Software Engineer at TechGiant",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&face=1",
      rating: 5,
    },
    {
      id: 3,
      quote:
        "Using Visiondrill's skills assessment helped me identify gaps in my knowledge and focus my learning efforts effectively.",
      author: "Sarah Johnson",
      role: "Product Manager at InnovateNow",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&face=1",
      rating: 4,
    },
  ];

  return (
    <Layout>
      <HeroSection />
      <FeatureSection />
      {features.partnerShowcase && (
        <Suspense fallback={<SectionLoader />}>
          <PartnerShowcaseSection />
        </Suspense>
      )}
      <Suspense fallback={<SectionLoader />}>
        <CareerJourneySection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <JobListingSection featuredJobs={featuredJobs} />
      </Suspense>
      {features.careerPaths && (
        <Suspense fallback={<SectionLoader />}>
          <CareerPathSection careerPaths={careerPaths} />
        </Suspense>
      )}
      <Suspense fallback={<SectionLoader />}>
        <ToolsSection />
      </Suspense>
      {features.testimonials && (
        <Suspense fallback={<SectionLoader />}>
          <TestimonialSection testimonials={testimonials} />
        </Suspense>
      )}
      {features.ctaSection && (
        <Suspense fallback={<SectionLoader />}>
          <CTASection />
        </Suspense>
      )}
    </Layout>
  );
};

export default Index;
