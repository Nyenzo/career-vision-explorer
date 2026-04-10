
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useCareerPaths } from "@/hooks/use-career-paths";
import { useToast } from "@/hooks/use-toast";
import { LazyWrapper } from "@/components/ui/lazy-wrapper";
import { lazy } from "react";

// Lazy load heavy components
const CareerPathsHero = lazy(() => import("@/components/career/CareerPathsHero"));
const CareerPathsSearch = lazy(() => import("@/components/career/CareerPathsSearch"));
const CareerPathsGrid = lazy(() => import("@/components/career/CareerPathsGrid"));
const CareerPathsTabs = lazy(() => import("@/components/career/CareerPathsTabs"));

const CareerPaths = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { careerPaths } = useCareerPaths();
  const { toast } = useToast();
  
  // Create popular paths from the career paths data
  const popularPaths = careerPaths.map(path => ({
    title: path.title,
    description: path.description,
    duration: path.estimatedDuration,
    difficulty: path.difficulty,
    steps: path.steps.length,
    color: path.category === 'Development' ? 'bg-blue-500' : 
           path.category === 'Data Science' ? 'bg-purple-500' :
           path.category === 'Design' ? 'bg-green-500' : 'bg-orange-500',
    id: path.id,
    category: path.category,
    tags: path.tags
  }));

  // Filter paths based on search query and selected filter
  const filteredPaths = popularPaths.filter(path => {
    const matchesSearch = searchQuery === "" || 
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
      (selectedFilter === "trending" && ['Development', 'Data Science'].includes(path.category));
    
    return matchesSearch && matchesFilter;
  });

  const handlePathClick = (pathId: string) => {
    console.log(`Selected career path: ${pathId}`);
    toast({
      title: "Career Path Selected",
      description: "Explore the detailed progression in the visualizer below.",
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedFilter("all");
  };
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container py-12">
          <LazyWrapper>
            <CareerPathsHero />
          </LazyWrapper>
          
          <LazyWrapper>
            <CareerPathsSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              totalPaths={popularPaths.length}
              filteredCount={filteredPaths.length}
              onClearSearch={handleClearSearch}
            />
          </LazyWrapper>

          <LazyWrapper>
            <CareerPathsGrid
              filteredPaths={filteredPaths}
              selectedFilter={selectedFilter}
              onPathClick={handlePathClick}
              onClearSearch={handleClearSearch}
            />
          </LazyWrapper>
          
          <LazyWrapper>
            <CareerPathsTabs />
          </LazyWrapper>
        </div>
      </div>
    </Layout>
  );
};

export default CareerPaths;
