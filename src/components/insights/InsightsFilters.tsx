
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface InsightsFiltersProps {
  industry: string;
  region: string;
  setIndustry: (industry: string) => void;
  setRegion: (region: string) => void;
}

const InsightsFilters = ({ industry, region, setIndustry, setRegion }: InsightsFiltersProps) => {
  return (
    <Card className="mb-6 sm:mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Data</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="h-10 sm:h-12 border-2 focus:border-blue-500 text-sm sm:text-base">
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-industries">All Industries</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="design">Design</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="h-10 sm:h-12 border-2 focus:border-blue-500 text-sm sm:text-base">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-regions">All Regions</SelectItem>
              <SelectItem value="san-francisco">San Francisco Bay Area</SelectItem>
              <SelectItem value="new-york">New York City</SelectItem>
              <SelectItem value="austin">Austin, TX</SelectItem>
              <SelectItem value="seattle">Seattle, WA</SelectItem>
              <SelectItem value="boston">Boston, MA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsFilters;
