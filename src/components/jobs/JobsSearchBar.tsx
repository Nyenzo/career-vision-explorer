import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

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
  const activeLocationFilters = Object.values(locationFilters).filter(Boolean).length;
  const activeJobTypeFilters = Object.values(jobTypeFilters).filter(Boolean).length;

  return (
    <section className="max-w-7xl mx-auto px-6 mb-12 relative z-20">
      <div className="bg-surface-container-lowest p-3 rounded-full shadow-[0_8px_30px_rgba(25,28,30,0.08)] flex flex-col md:flex-row items-center gap-3">
        {/* Main Search */}
        <div className="flex-1 flex items-center px-6 gap-3 min-w-[200px] w-full">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            placeholder="Job title or keywords"
            className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="h-8 w-[1px] bg-outline-variant hidden md:block opacity-50"></div>

        <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Location Quick Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center px-4 gap-2 cursor-pointer hover:bg-surface-container-low rounded-full py-2 transition-colors duration-200">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                  <span className="text-on-surface-variant whitespace-nowrap font-medium">Location</span>
                  {activeLocationFilters > 0 && (
                    <span className="ml-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {activeLocationFilters}
                    </span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[90vw] sm:w-80 max-h-[70vh] overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl" align="start">
                <div className="space-y-4">
                  <h4 className="font-headline font-semibold text-sm text-on-surface tracking-tight">Work Style</h4>
                  <div className="space-y-3">
                    {['remote', 'onsite', 'hybrid'].map((key) => (
                      <div key={key} className="flex items-center space-x-3">
                        <Checkbox
                          id={key}
                          checked={locationFilters[key as keyof LocationFilters]}
                          onCheckedChange={(checked) => setLocationFilters({ ...locationFilters, [key]: checked === true })}
                        />
                        <label htmlFor={key} className="text-sm text-on-surface capitalize font-body cursor-pointer">{key}</label>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-headline font-semibold text-sm text-on-surface tracking-tight mt-6">Cities</h4>
                  <div className="space-y-3">
                    {['nairobi', 'mombasa', 'kisumu'].map((key) => (
                      <div key={key} className="flex items-center space-x-3">
                        <Checkbox
                          id={key}
                          checked={locationFilters[key as keyof LocationFilters]}
                          onCheckedChange={(checked) => setLocationFilters({ ...locationFilters, [key]: checked === true })}
                        />
                        <label htmlFor={key} className="text-sm text-on-surface capitalize font-body cursor-pointer">{key}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Job Type Quick Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center px-4 gap-2 cursor-pointer hover:bg-surface-container-low rounded-full py-2 transition-colors duration-200">
                  <span className="material-symbols-outlined text-outline">work</span>
                  <span className="text-on-surface-variant whitespace-nowrap font-medium">Job Type</span>
                  {activeJobTypeFilters > 0 && (
                    <span className="ml-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {activeJobTypeFilters}
                    </span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[90vw] sm:w-80 max-h-[70vh] overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl" align="start">
                <div className="space-y-4">
                  <h4 className="font-headline font-semibold text-sm text-on-surface tracking-tight">Employment Type</h4>
                  <div className="space-y-3">
                    {['fullTime', 'partTime', 'contract', 'internship', 'freelance'].map((key) => (
                      <div key={key} className="flex items-center space-x-3">
                        <Checkbox
                          id={key}
                          checked={jobTypeFilters[key as keyof JobTypeFilters]}
                          onCheckedChange={(checked) => setJobTypeFilters({ ...jobTypeFilters, [key]: checked === true })}
                        />
                        <label htmlFor={key} className="text-sm text-on-surface font-body cursor-pointer">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <button 
              onClick={(e) => { e.preventDefault(); setFiltersVisible(!filtersVisible); }}
              className="flex items-center gap-2 px-6 py-3 bg-surface-container-highest text-on-surface font-medium rounded-full hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">tune</span>
              All Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button className="px-8 py-3 w-full md:w-auto gradient-btn text-on-primary font-bold rounded-full hover:scale-[1.02] transition-transform active:scale-95 shadow-md shadow-primary/20">
                Search
            </button>
        </div>
      </div>
    </section>
  );
};
