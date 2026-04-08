import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NewJobPostDialog from "@/components/employer/NewJobPostDialog";

import { FilterDropdown } from "./FilterDropdown";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useJobPosts from "@/hooks/use-job-posts";

export function JobPostHeader() {
  const { updateFilters, filters } = useJobPosts();

  const handleSearchChange = (value: string) => {
    updateFilters({ searchQuery: value });
  };

  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Job Management</CardTitle>
          <CardDescription>
            Create, edit, and manage your job postings
          </CardDescription>
        </div>
        <NewJobPostDialog />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search job listings..."
              className="pl-8"
              value={filters.searchQuery || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <FilterDropdown onFilterChange={handleFilterChange} />
        </div>
      </CardContent>
    </Card>
  );
}
