
import { useState, useMemo } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  matchScore: number;
  skills: string[];
  description: string;
  experienceLevel?: string;
}

interface FilterState {
  remote: boolean;
  hybrid: boolean;
  inPerson: boolean;
  fullTime: boolean;
  contract: boolean;
  highMatch: boolean;
  entryLevel: boolean;
  midLevel: boolean;
  senior: boolean;
  executive: boolean;
}

interface SelectedSkills {
  javascript: boolean;
  react: boolean;
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

export const useJobsFilter = (jobs: Job[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterState>({
    remote: false,
    hybrid: false,
    inPerson: false,
    fullTime: false,
    contract: false,
    highMatch: false,
    entryLevel: false,
    midLevel: false,
    senior: false,
    executive: false
  });
  const [salaryRange, setSalaryRange] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkills>({
    javascript: false,
    react: false,
  });
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    remote: false,
    onsite: false,
    hybrid: false,
    nairobi: false,
    mombasa: false,
    kisumu: false,
  });
  const [jobTypeFilters, setJobTypeFilters] = useState<JobTypeFilters>({
    fullTime: false,
    partTime: false,
    contract: false,
    internship: false,
    freelance: false,
  });
  const [filtersVisible, setFiltersVisible] = useState(false);

  const resetFilters = () => {
    setFilter({
      remote: false,
      hybrid: false,
      inPerson: false,
      fullTime: false,
      contract: false,
      highMatch: false,
      entryLevel: false,
      midLevel: false,
      senior: false,
      executive: false
    });
    setSalaryRange("all");
    setSelectedSkills({
      javascript: false,
      react: false,
    });
    setLocationFilters({
      remote: false,
      onsite: false,
      hybrid: false,
      nairobi: false,
      mombasa: false,
      kisumu: false,
    });
    setJobTypeFilters({
      fullTime: false,
      partTime: false,
      contract: false,
      internship: false,
      freelance: false,
    });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search filter
      if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Location filters from search bar
      if (locationFilters.remote && !job.location.toLowerCase().includes("remote")) {
        return false;
      }
      if (locationFilters.onsite && (job.location.toLowerCase().includes("remote") || job.location.toLowerCase().includes("hybrid"))) {
        return false;
      }
      if (locationFilters.hybrid && !job.location.toLowerCase().includes("hybrid")) {
        return false;
      }
      if (locationFilters.nairobi && !job.location.toLowerCase().includes("nairobi")) {
        return false;
      }
      if (locationFilters.mombasa && !job.location.toLowerCase().includes("mombasa")) {
        return false;
      }
      if (locationFilters.kisumu && !job.location.toLowerCase().includes("kisumu")) {
        return false;
      }

      // Job type filters from search bar
      if (jobTypeFilters.fullTime && !job.type.toLowerCase().includes("full-time")) {
        return false;
      }
      if (jobTypeFilters.partTime && !job.type.toLowerCase().includes("part-time")) {
        return false;
      }
      if (jobTypeFilters.contract && !job.type.toLowerCase().includes("contract")) {
        return false;
      }
      if (jobTypeFilters.internship && !job.type.toLowerCase().includes("internship")) {
        return false;
      }
      if (jobTypeFilters.freelance && !job.type.toLowerCase().includes("freelance")) {
        return false;
      }
      
      // Work Style filters (from advanced filters)
      if (filter.remote && !job.location.toLowerCase().includes("remote")) {
        return false;
      }
      
      if (filter.hybrid && !job.location.toLowerCase().includes("hybrid")) {
        return false;
      }
      
      if (filter.inPerson && (job.location.toLowerCase().includes("remote") || job.location.toLowerCase().includes("hybrid"))) {
        return false;
      }
      
      // Job Type filters (from advanced filters)
      if (filter.fullTime && !job.type.toLowerCase().includes("full-time")) {
        return false;
      }
      
      if (filter.contract && !job.type.toLowerCase().includes("contract")) {
        return false;
      }
      
      // Experience Level filters
      if (filter.entryLevel && job.experienceLevel !== "Entry Level") {
        return false;
      }
      
      if (filter.midLevel && job.experienceLevel !== "Mid Level") {
        return false;
      }
      
      if (filter.senior && job.experienceLevel !== "Senior") {
        return false;
      }
      
      if (filter.executive && job.experienceLevel !== "Executive") {
        return false;
      }
      
      // High match filter
      if (filter.highMatch && job.matchScore < 80) {
        return false;
      }
      
      // Salary range filter
      if (salaryRange !== "all") {
        const minSalary = parseInt(job.salary.match(/\d+/g)?.[0] || "0");
        const maxSalary = parseInt(job.salary.match(/\d+/g)?.[1] || "0");
        
        if (salaryRange === "0-50" && minSalary > 50) {
          return false;
        } else if (salaryRange === "50-100" && (minSalary > 100 || maxSalary < 50)) {
          return false;
        } else if (salaryRange === "100-150" && (minSalary > 150 || maxSalary < 100)) {
          return false;
        } else if (salaryRange === "150+" && maxSalary < 150) {
          return false;
        }
      }
      
      // Skills filters
      if (selectedSkills.javascript && !job.skills.some(skill => skill.toLowerCase() === "javascript")) {
        return false;
      }
      
      if (selectedSkills.react && !job.skills.some(skill => skill.toLowerCase() === "react")) {
        return false;
      }
      
      return true;
    });
  }, [jobs, searchTerm, filter, salaryRange, selectedSkills, locationFilters, jobTypeFilters]);

  const activeFiltersCount = Object.values(filter).filter(Boolean).length + 
    (salaryRange !== "all" ? 1 : 0) + 
    Object.values(selectedSkills).filter(Boolean).length +
    Object.values(locationFilters).filter(Boolean).length +
    Object.values(jobTypeFilters).filter(Boolean).length;

  return {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    salaryRange,
    setSalaryRange,
    selectedSkills,
    setSelectedSkills,
    locationFilters,
    setLocationFilters,
    jobTypeFilters,
    setJobTypeFilters,
    filtersVisible,
    setFiltersVisible,
    filteredJobs,
    activeFiltersCount,
    resetFilters
  };
};
