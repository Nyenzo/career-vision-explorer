
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

  const normalize = (value?: string) => (value || "").toLowerCase().trim();

  const isRemoteLocation = (location: string) => {
    const normalized = normalize(location);
    return normalized.includes("remote") || normalized.includes("work from home");
  };

  const isHybridLocation = (location: string) => {
    const normalized = normalize(location);
    return normalized.includes("hybrid");
  };

  const isOnsiteLocation = (location: string) => {
    const normalized = normalize(location);
    return !isRemoteLocation(normalized) && !isHybridLocation(normalized);
  };

  const normalizeJobType = (type: string) => normalize(type).replace(/\s+/g, "");

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
      const normalizedTitle = normalize(job.title);
      const normalizedCompany = normalize(job.company);
      const normalizedLocation = normalize(job.location);
      const normalizedType = normalizeJobType(job.type);
      const normalizedExperienceLevel = normalize(job.experienceLevel);

      // Search filter
      const normalizedSearch = normalize(searchTerm);
      if (
        normalizedSearch &&
        !normalizedTitle.includes(normalizedSearch) &&
        !normalizedCompany.includes(normalizedSearch) &&
        !job.skills.some(skill => normalize(skill).includes(normalizedSearch))
      ) {
        return false;
      }

      // Location filters from search bar (OR within this group)
      const selectedLocationFilters = Object.entries(locationFilters)
        .filter(([, selected]) => selected)
        .map(([key]) => key);
      if (selectedLocationFilters.length > 0) {
        const locationMatch = selectedLocationFilters.some((key) => {
          if (key === "remote") return isRemoteLocation(normalizedLocation);
          if (key === "onsite") return isOnsiteLocation(normalizedLocation);
          if (key === "hybrid") return isHybridLocation(normalizedLocation);
          return normalizedLocation.includes(key);
        });

        if (!locationMatch) {
          return false;
        }
      }

      // Job type filters from search bar (OR within this group)
      const selectedJobTypes = Object.entries(jobTypeFilters)
        .filter(([, selected]) => selected)
        .map(([key]) => key);
      if (selectedJobTypes.length > 0) {
        const jobTypeMatch = selectedJobTypes.some((typeKey) => {
          if (typeKey === "fullTime") return normalizedType.includes("fulltime");
          if (typeKey === "partTime") return normalizedType.includes("parttime");
          if (typeKey === "contract") return normalizedType.includes("contract");
          if (typeKey === "internship") return normalizedType.includes("internship");
          if (typeKey === "freelance") return normalizedType.includes("freelance");
          return false;
        });

        if (!jobTypeMatch) {
          return false;
        }
      }

      // Work style filters (from advanced filters) - OR within this group
      const selectedWorkStyles = [
        filter.remote ? "remote" : null,
        filter.hybrid ? "hybrid" : null,
        filter.inPerson ? "inPerson" : null,
      ].filter(Boolean) as string[];
      if (selectedWorkStyles.length > 0) {
        const workStyleMatch = selectedWorkStyles.some((style) => {
          if (style === "remote") return isRemoteLocation(normalizedLocation);
          if (style === "hybrid") return isHybridLocation(normalizedLocation);
          if (style === "inPerson") return isOnsiteLocation(normalizedLocation);
          return false;
        });

        if (!workStyleMatch) {
          return false;
        }
      }

      // Job Type filters (from advanced filters)
      if (filter.fullTime && !normalizedType.includes("fulltime")) {
        return false;
      }

      if (filter.contract && !normalizedType.includes("contract")) {
        return false;
      }

      // Experience level filters (OR within this group)
      const selectedExperienceLevels = [
        filter.entryLevel ? "entry" : null,
        filter.midLevel ? "mid" : null,
        filter.senior ? "senior" : null,
        filter.executive ? "executive" : null,
      ].filter(Boolean) as string[];
      if (selectedExperienceLevels.length > 0) {
        const experienceMatch = selectedExperienceLevels.some((level) =>
          normalizedExperienceLevel.includes(level),
        );

        if (!experienceMatch) {
          return false;
        }
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
