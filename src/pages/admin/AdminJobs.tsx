
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash, Eye, Filter, MapPin, Briefcase, TrendingUp, BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminJobs, AdminJob } from "@/hooks/use-admin-jobs";
import { JobFormDialog } from "@/components/admin/JobFormDialog";

const AdminJobs = () => {
  const { toast } = useToast();
  const {
    filteredJobs,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    deleteJob
  } = useAdminJobs();

  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Apply additional filters
  const fullyFilteredJobs = filteredJobs.filter(job => {
    if (locationFilter !== "all" && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (typeFilter !== "all" && job.type !== typeFilter) {
      return false;
    }
    if (departmentFilter !== "all" && job.department !== departmentFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "company":
        return a.company.localeCompare(b.company);
      case "applications":
        return b.applications - a.applications;
      case "date":
      default:
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewJob = (job: AdminJob) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleEditJob = (job: AdminJob) => {
    setSelectedJob(job);
    setFormMode("edit");
    setIsJobFormOpen(true);
  };

  const handleDeleteJob = (job: AdminJob) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateJob = () => {
    setSelectedJob(null);
    setFormMode("create");
    setIsJobFormOpen(true);
  };

  const confirmDelete = () => {
    if (selectedJob) {
      deleteJob(selectedJob.job_id);
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
    }
  };

  // Calculate comprehensive stats
  const stats = {
    active: filteredJobs.filter(job => job.status === "active").length,
    draft: filteredJobs.filter(job => job.status === "draft").length,
    expired: filteredJobs.filter(job => job.status === "expired").length,
    totalApplications: filteredJobs.reduce((sum, job) => sum + job.applications, 0),
    averageApplications: filteredJobs.length > 0 ? filteredJobs.reduce((sum, job) => sum + job.applications, 0) / filteredJobs.length : 0,
    topPerformer: filteredJobs.reduce((max, job) => job.applications > max.applications ? job : max, filteredJobs[0] || { applications: 0, title: "N/A" })
  };

  // Get unique values for filters
  const uniqueLocations = Array.from(new Set(filteredJobs.map(job => job.location.split(',')[0].trim())));
  const uniqueTypes = Array.from(new Set(filteredJobs.map(job => job.type)));
  const uniqueDepartments = Array.from(new Set(filteredJobs.map(job => job.department)));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive job management across the platform ({fullyFilteredJobs.length} jobs)
            </p>
          </div>
          <Button onClick={handleCreateJob} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>

        {/* Comprehensive Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Draft Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{stats.averageApplications.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-bold text-orange-600 truncate">{stats.topPerformer.title}</div>
              <div className="text-sm text-gray-600">Top Performer</div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search jobs by title, company, location, or requirements..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <Briefcase className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Posted</SelectItem>
                    <SelectItem value="title">Job Title</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setLocationFilter("all");
                    setTypeFilter("all");
                    setDepartmentFilter("all");
                    setSortBy("date");
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Job Listings ({fullyFilteredJobs.length})</CardTitle>
            <CardDescription>
              Complete overview of all job postings with advanced management capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fullyFilteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "all" || locationFilter !== "all" || typeFilter !== "all" || departmentFilter !== "all"
                    ? "Try adjusting your filters to see more results"
                    : "No jobs have been posted yet"
                  }
                </p>
                <Button onClick={handleCreateJob} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Job
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md">
                <Table className="min-w-[750px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Job Details</TableHead>
                      <TableHead scope="col">Company &amp; Department</TableHead>
                      <TableHead scope="col">Location &amp; Type</TableHead>
                      <TableHead scope="col">Posted Date</TableHead>
                      <TableHead scope="col">Status</TableHead>
                      <TableHead scope="col">Performance</TableHead>
                      <TableHead scope="col" className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fullyFilteredJobs.map((job) => (
                      <TableRow key={job.job_id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.experience}</div>
                            <div className="text-sm text-gray-500">{job.salary}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{job.company}</div>
                            <div className="text-sm text-gray-500">{job.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Briefcase className="h-3 w-3" />
                              {job.type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{job.postedDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)} variant="outline">
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{job.applications} applications</div>
                            <div className="text-xs text-gray-500">
                              {job.applications > stats.averageApplications ? "Above avg" : "Below avg"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewJob(job)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditJob(job)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJob(job)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Form Dialog */}
      <JobFormDialog
        open={isJobFormOpen}
        onOpenChange={setIsJobFormOpen}
        job={selectedJob || undefined}
        mode={formMode}
      />

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.company} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Department</h3>
                  <p className="text-gray-600">{selectedJob.department}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Job Type</h3>
                  <p className="text-gray-600 capitalize">{selectedJob.type}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Experience</h3>
                  <p className="text-gray-600">{selectedJob.experience}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Salary</h3>
                  <p className="text-gray-600">{selectedJob.salary}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Posted Date</h3>
                  <p className="text-gray-600">{selectedJob.postedDate}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Applications</h3>
                  <p className="text-gray-600">{selectedJob.applications}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="text-gray-600">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">Status:</span>
                <Badge className={getStatusColor(selectedJob.status)} variant="outline">
                  {selectedJob.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              handleEditJob(selectedJob!);
            }}>
              Edit Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedJob?.title}" at {selectedJob?.company}?
              This action cannot be undone and will remove all associated applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminJobs;
