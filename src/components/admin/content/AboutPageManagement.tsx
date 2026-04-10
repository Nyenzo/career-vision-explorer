import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "./about/HeroSection";
import { MissionSection } from "./about/MissionSection";
import { FeaturesSection } from "./about/FeaturesSection";
import { StorySection } from "./about/StorySection";
import { StatsSection } from "./about/StatsSection";
import { Feature, HeroContent, MissionContent, StoryContent, StatItem } from "@/types/about-content";

export const AboutPageManagement = () => {
  // ... keep existing code (state initialization for heroContent, missionContent, storyContent, features, achievements)

  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: "Navigate your career journey with confidence",
    subtitle: "We believe that everyone deserves to find meaningful work that aligns with their skills, values, and aspirations. Our AI-driven platform connects talent with opportunity.",
    badgeText: "✨ About Visiondrill"
  });

  const [missionContent, setMissionContent] = useState<MissionContent>({
    title: "Democratizing Career Success",
    content: "At Visiondrill Career Explorer, we're committed to breaking down barriers in career development. Our platform leverages cutting-edge AI technology to provide personalized career guidance that was once only available to a privileged few.",
    badgeText: "🎯 Our Mission"
  });

  const [storyContent, setStoryContent] = useState<StoryContent>({
    title: "Building the Future of Work",
    content: "Founded in 2024, Visiondrill Career Explorer was born from the vision to democratize career guidance and make quality career advice accessible to everyone. Our team of career experts, data scientists, and technologists work together to create innovative solutions for the modern job market.",
    badgeText: "📖 Our Story"
  });

  const [stats, setStats] = useState<StatItem[]>([
    { number: "10K+", label: "Job Seekers", icon: "Users" },
    { number: "500+", label: "Companies", icon: "Award" },
    { number: "95%", label: "Match Accuracy", icon: "BarChart3" },
    { number: "24/7", label: "Support", icon: "Target" }
  ]);

  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "1",
      title: "Smart Job Matching",
      description: "Our AI algorithms analyze your skills, experience, and preferences to find the perfect job matches.",
      icon: "Target"
    },
    {
      id: "2", 
      title: "Career Path Guidance",
      description: "Get personalized career roadmaps and skill development recommendations.",
      icon: "TrendingUp"
    },
    {
      id: "3",
      title: "Skills Assessment", 
      description: "Comprehensive skills evaluation to help you understand your strengths and growth areas.",
      icon: "Shield"
    },
    {
      id: "4",
      title: "Market Insights",
      description: "Stay informed about industry trends, salary benchmarks, and in-demand skills.",
      icon: "Star"
    }
  ]);

  const [achievements] = useState<string[]>([
    "5,000+ successful job placements",
    "500+ partner companies", 
    "95% user satisfaction rate",
    "AI-powered matching technology"
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">About Page Management</h2>
        <p className="text-muted-foreground">Manage the content and sections of the About page</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroSection 
            heroContent={heroContent} 
            setHeroContent={setHeroContent} 
          />
        </TabsContent>

        <TabsContent value="mission">
          <MissionSection 
            missionContent={missionContent} 
            setMissionContent={setMissionContent} 
          />
        </TabsContent>

        <TabsContent value="features">
          <FeaturesSection 
            features={features} 
            setFeatures={setFeatures} 
          />
        </TabsContent>

        <TabsContent value="story">
          <StorySection 
            storyContent={storyContent} 
            setStoryContent={setStoryContent}
            achievements={achievements}
          />
        </TabsContent>

        <TabsContent value="stats">
          <StatsSection 
            stats={stats} 
            setStats={setStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
