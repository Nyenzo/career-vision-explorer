import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, MapPin, Briefcase } from "lucide-react";

interface JobsSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtersVisible: boolean;
  setFiltersVisible: (visible: boolean) => void;
  activeFiltersCount: number;
  locationFilters: LocationFilters;
  setLocationFilters: (filters: LocationFilters) => void;
  jobTypeFilters: JobTypeFilters;
  setJobTypeFilters: (filters: JobTypeFilters) => void;
}

interface LocationFilters {
  remote: boolean;
  onsite: boolean;
  hybrid: boolean;
  nairobi: boolean;
  mombasa: boolean;
  kisumu: boolean;
}

interface JobTypeFilters {
  fullTime: boolean;
  partTime: boolean;
  contract: boolean;
  internship: boolean;
  freelance: boolean;
}

export const JobsSearchBar = ({
  searchTerm,
  setSearchTerm,
  filtersVisible,
  setFiltersVisible,
  activeFiltersCount,
  locationFilters,
  setLocationFilters,
  jobTypeFilters,
  setJobTypeFilters,
}: JobsSearchBarProps) => {
  const activeLocationFilters =
    Object.values(locationFilters).filter(Boolean).length;
  const activeJobTypeFilters =
    Object.values(jobTypeFilters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            className="pl-12 h-12 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full lg:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 h-12 px-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <MapPin className="h-4 w-4" />
                Location
                {activeLocationFilters > 0 && (
                  <Badge className="ml-1 bg-blue-500 hover:bg-blue-600 text-white border-0 px-2 py-1 text-xs font-bold">
                    {activeLocationFilters}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[90vw] sm:w-80 max-h-[70vh] overflow-y-auto"
              align="start"
            >
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Work Style</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={locationFilters.remote}
                      onCheckedChange={(checked) =>
                        setLocationFilters({
                          ...locationFilters,
                          remote: checked === true,
                        })
                      }
                    />
                    <label htmlFor="remote" className="text-sm">
                      Remote
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onsite"
                      checked={locationFilters.onsite}
                      onCheckedChange={(checked) =>
                        setLocationFilters({
                          ...locationFilters,
                          onsite: checked === true,
                        })
                      }
                    />
                    <label htmlFor="onsite" className="text-sm">
                      On-site
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hybrid"
                      checked={locationFilters.hybrid}
                      onCheckedChange={(checked) =>
                        setLocationFilters({
                          ...locationFilters,
                          hybrid: checked === true,
                        })
                      }
                    />
                    <label htmlFor="hybrid" className="text-sm">
                      Hybrid
                    </label>
                  </div>
                </div>

                <h4 className="font-medium text-sm mt-4">Cities</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nairobi"
                      checked={locationFilters.nairobi}
                      onCheckedChange={(checked) =>
                        setLocationFilters({
                          ...locationFilters,
                          nairobi: checked === true,
                        })
                      }
                    />
                    <label htmlFor="nairobi" className="text-sm">
                      Nairobi
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mombasa"
                      checked={locationFilters.mombasa}
                      onCheckedChange={(checked) =>
                        setLocationFilters({
                          ...locationFilters,
                          mombasa: checked === true,
                        })
                      }
                    />
                    <label htmlFor="mombasa" className="text-sm">
                      Mombasa
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kisumu"
                      checked={locationFilters.kisumu}
                      onCheckedChange={(checked) =>
                        setLocationFilters({
                          ...locationFilters,
                          kisumu: checked === true,
                        })
                      }
                    />
                    <label htmlFor="kisumu" className="text-sm">
                      Kisumu
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 h-12 px-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <Briefcase className="h-4 w-4" />
                Job Type
                {activeJobTypeFilters > 0 && (
                  <Badge className="ml-1 bg-blue-500 hover:bg-blue-600 text-white border-0 px-2 py-1 text-xs font-bold">
                    {activeJobTypeFilters}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[90vw] sm:w-80 max-h-[70vh] overflow-y-auto"
              align="start"
            >
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Employment Type</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fullTime"
                      checked={jobTypeFilters.fullTime}
                      onCheckedChange={(checked) =>
                        setJobTypeFilters({
                          ...jobTypeFilters,
                          fullTime: checked === true,
                        })
                      }
                    />
                    <label htmlFor="fullTime" className="text-sm">
                      Full-time
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="partTime"
                      checked={jobTypeFilters.partTime}
                      onCheckedChange={(checked) =>
                        setJobTypeFilters({
                          ...jobTypeFilters,
                          partTime: checked === true,
                        })
                      }
                    />
                    <label htmlFor="partTime" className="text-sm">
                      Part-time
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contract"
                      checked={jobTypeFilters.contract}
                      onCheckedChange={(checked) =>
                        setJobTypeFilters({
                          ...jobTypeFilters,
                          contract: checked === true,
                        })
                      }
                    />
                    <label htmlFor="contract" className="text-sm">
                      Contract
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="internship"
                      checked={jobTypeFilters.internship}
                      onCheckedChange={(checked) =>
                        setJobTypeFilters({
                          ...jobTypeFilters,
                          internship: checked === true,
                        })
                      }
                    />
                    <label htmlFor="internship" className="text-sm">
                      Internship
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="freelance"
                      checked={jobTypeFilters.freelance}
                      onCheckedChange={(checked) =>
                        setJobTypeFilters({
                          ...jobTypeFilters,
                          freelance: checked === true,
                        })
                      }
                    />
                    <label htmlFor="freelance" className="text-sm">
                      Freelance
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 h-12 px-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <Filter className="h-4 w-4" />
            All Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-blue-500 hover:bg-blue-600 text-white border-0 px-2 py-1 text-xs font-bold">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
