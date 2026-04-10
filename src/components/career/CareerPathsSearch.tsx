
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp } from "lucide-react";

interface CareerPathsSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  totalPaths: number;
  filteredCount: number;
  onClearSearch: () => void;
}

const CareerPathsSearch = ({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  totalPaths,
  filteredCount,
  onClearSearch
}: CareerPathsSearchProps) => {
  return (
    <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search career paths, skills, or industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-2 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedFilter === "all" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("all")}
              className="h-12"
            >
              All Paths ({totalPaths})
            </Button>
            <Button 
              variant={selectedFilter === "trending" ? "default" : "outline"} 
              onClick={() => setSelectedFilter("trending")}
              className="h-12"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>
            {(searchQuery || selectedFilter !== "all") && (
              <Button 
                variant="ghost" 
                onClick={onClearSearch}
                className="h-12"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        {filteredCount !== totalPaths && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCount} of {totalPaths} career paths
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CareerPathsSearch;
