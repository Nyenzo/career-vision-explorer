
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
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Jobs</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.boosted}</div>
          <div className="text-sm text-gray-600">Boosted Jobs</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.totalApplicants}</div>
          <div className="text-sm text-gray-600">Total Applicants</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.totalViews > 0 ? ((stats.totalApplicants / stats.totalViews) * 100).toFixed(1) : 0}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs by title, location, or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex gap-3">
              <Select onValueChange={handleJobTypeFilter} defaultValue="all">
                <SelectTrigger className="w-40">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={handleDateRangeFilter} defaultValue="all">
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant={filters.boostedOnly ? "default" : "outline"}
                onClick={() => handleBoostedFilter(!filters.boostedOnly)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Boosted Only
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
