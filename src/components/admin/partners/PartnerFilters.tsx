
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface PartnerFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
}

export const PartnerFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  setFilterCategory 
}: PartnerFiltersProps) => {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className="w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="employer">Employers</SelectItem>
          <SelectItem value="education">Educational Institutions</SelectItem>
          <SelectItem value="recruiting">Recruiting Agencies</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
