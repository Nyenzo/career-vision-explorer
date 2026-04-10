import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface FreelancerFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  skillsFilter: string[];
  onSkillsFilterChange: (skills: string[]) => void;
  ratingFilter: string;
  onRatingFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
}

const availableSkills = [
  "React", "JavaScript", "TypeScript", "Node.js", "Python", "UI/UX Design",
  "Graphic Design", "Content Writing", "Digital Marketing", "SEO", "PHP",
  "WordPress", "Laravel", "Vue.js", "Angular", "Mobile Development"
];

export const FreelancerFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  skillsFilter,
  onSkillsFilterChange,
  ratingFilter,
  onRatingFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters
}: FreelancerFiltersProps) => {

  const addSkillFilter = (skill: string) => {
    if (!skillsFilter.includes(skill)) {
      onSkillsFilterChange([...skillsFilter, skill]);
    }
  };

  const removeSkillFilter = (skill: string) => {
    onSkillsFilterChange(skillsFilter.filter(s => s !== skill));
  };

  const hasActiveFilters = statusFilter !== "all" || skillsFilter.length > 0 || ratingFilter !== "all" || searchQuery.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search freelancers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
            <SelectItem value="4.0">4.0+ Stars</SelectItem>
            <SelectItem value="3.5">3.5+ Stars</SelectItem>
            <SelectItem value="3.0">3.0+ Stars</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
            <SelectItem value="projects">Most Projects</SelectItem>
            <SelectItem value="joinDate">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skills Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <Badge
              key={skill}
              variant={skillsFilter.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => skillsFilter.includes(skill) ? removeSkillFilter(skill) : addSkillFilter(skill)}
            >
              {skill}
              {skillsFilter.includes(skill) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {skillsFilter.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeSkillFilter(skill)}
                />
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};