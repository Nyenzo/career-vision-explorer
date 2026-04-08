
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditJobDialog } from "./EditJobDialog";
import { BoostJobDialog } from "./BoostJobDialog";
import { deleteJobDialog } from "@/lib/utils";
import { Eye, Edit, Trash, List, Search, Filter, MapPin, Briefcase, Plus, TrendingUp } from "lucide-react";
import { useEmployerJobs } from "@/hooks/use-employer-jobs";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export function JobListingsTable() {
  const { filteredJobs, loading, error, deleteJob, setSearchQuery, setStatusFilter } = useEmployerJobs();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    jobType: undefined as string | undefined,
    boostedOnly: false,
    dateRange: undefined as number | undefined,
  });
  
  const handleViewApplicants = (jobId: string) => {
    navigate(`/employer/jobs/${jobId}/applicants`);
  };
  
  const handleDelete = (jobId: string, jobTitle: string) => {
    deleteJobDialog({
      title: `Delete ${jobTitle}?`,
      description: "This will permanently delete this job listing and cannot be undone.",
      onConfirm: () => deleteJob(jobId),
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchQuery(value);
  };

  const handleJobTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, jobType: type === "all" ? undefined : type }));
  };

  const handleDateRangeFilter = (days: string) => {
    setFilters(prev => ({ ...prev, dateRange: days === "all" ? undefined : parseInt(days) }));
  };

  const handleBoostedFilter = (boostedOnly: boolean) => {
    setFilters(prev => ({ ...prev, boostedOnly }));
  };

  // Sort jobs to show boosted ones first
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.isBoosted && !b.isBoosted) return -1;
    if (!a.isBoosted && b.isBoosted) return 1;
    return 0;
  });

  const stats = {
    total: filteredJobs.length,
    boosted: filteredJobs.filter(job => job.isBoosted).length,
    active: filteredJobs.length, // Assuming all are active for employer view
    totalApplicants: filteredJobs.reduce((sum, job) => sum + job.applications, 0),
    totalViews: filteredJobs.reduce((sum, job) => sum + job.views, 0)
  };

  return (
    <div className="space-y-4">
      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-card p-3 sm:p-4 rounded-lg border border-border">
          <div className="text-lg sm:text-xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Jobs</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border border-border">
          <div className="text-lg sm:text-xl font-bold text-secondary-foreground">{stats.boosted}</div>
          <div className="text-xs text-muted-foreground">Boosted</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border border-border">
          <div className="text-lg sm:text-xl font-bold text-accent-foreground">{stats.totalApplicants}</div>
          <div className="text-xs text-muted-foreground">Applicants</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border border-border">
          <div className="text-lg sm:text-xl font-bold text-muted-foreground">{stats.totalViews}</div>
          <div className="text-xs text-muted-foreground">Views</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg border border-border col-span-2 md:col-span-1">
          <div className="text-lg sm:text-xl font-bold text-destructive">{stats.totalViews > 0 ? ((stats.totalApplicants / stats.totalViews) * 100).toFixed(1) : 0}%</div>
          <div className="text-xs text-muted-foreground">Conversion</div>
        </div>
      </div>

      {/* Compact Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Main Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Compact Filter Controls */}
            <div className="flex gap-2 flex-wrap">
              <Select onValueChange={handleJobTypeFilter} defaultValue="all">
                <SelectTrigger className="w-32 sm:w-36">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant={filters.boostedOnly ? "default" : "outline"}
                onClick={() => handleBoostedFilter(!filters.boostedOnly)}
                size="sm"
                className="px-3"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Boosted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Job Listings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Job Listings ({sortedJobs.length})</CardTitle>
            <CardDescription>
              Manage your job postings and view their performance
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Loading jobs...</h3>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filters.jobType || filters.boostedOnly 
                  ? "Try adjusting your filters to see more results"
                  : "Get started by posting your first job"
                }
              </p>
              {(!searchTerm && !filters.jobType && !filters.boostedOnly) && (
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post New Job
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Details</TableHead>
                  <TableHead>Location & Type</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {job.title}
                          {job.status === "active" && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                          )}
                          {job.status === "draft" && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Draft</Badge>
                          )}
                          {job.status === "expired" && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Closed</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{job.salary}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          {job.type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{job.applications} applicants</div>
                        <div className="text-sm text-muted-foreground">{job.views} views</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.isBoosted ? (
                        <Badge className="bg-green-100 text-green-800">Boosted</Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <BoostJobDialog job={job} />
                        <EditJobDialog job={job} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <List className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewApplicants(job.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Applicants
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(job.id, job.title)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
