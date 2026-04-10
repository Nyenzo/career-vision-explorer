
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Route } from "lucide-react";
import CareerPathCard from "./CareerPathCard";

interface PopularPath {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  steps: number;
  color: string;
  id: string;
  category: string;
  tags: string[];
}

interface CareerPathsGridProps {
  filteredPaths: PopularPath[];
  selectedFilter: string;
  onPathClick: (pathId: string) => void;
  onClearSearch: () => void;
}

const CareerPathsGrid = ({ 
  filteredPaths, 
  selectedFilter, 
  onPathClick, 
  onClearSearch 
}: CareerPathsGridProps) => {
  if (filteredPaths.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Route className="h-6 w-6 text-blue-600" />
          {selectedFilter === "trending" ? "Trending" : "Popular"} Career Paths
        </h2>
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No career paths found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find relevant career paths.
              </p>
              <Button onClick={onClearSearch}>
                Clear all filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Route className="h-6 w-6 text-blue-600" />
        {selectedFilter === "trending" ? "Trending" : "Popular"} Career Paths
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPaths.map((path, index) => (
          <CareerPathCard
            key={path.id || index}
            id={path.id}
            title={path.title}
            description={path.description}
            duration={path.duration}
            difficulty={path.difficulty}
            steps={path.steps}
            category={path.category}
            color={path.color}
            onClick={onPathClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CareerPathsGrid;
