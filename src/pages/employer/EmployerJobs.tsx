// src/pages/employer/EmployerJobs.tsx
import React, { useState } from "react";
import {
  Briefcase,
  Trash2,
  Plus,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Share2,
  Power,
  XCircle,
  Star,
} from "lucide-react";
import { useEmployerJobs, EmployerJob } from "@/hooks/use-employer-jobs";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { EditJobDialog } from "@/components/employer/EditJobDialog";
import { deleteJobDialog } from "@/lib/utils";
import NewJobPostDialog from "@/components/employer/NewJobPostDialog";
import Layout from "@/components/layout/Layout";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EmployerJobs = () => {
  const {
    filteredJobs,
    deleteJob,
    setSearchQuery,
    fetchJobs,
    updateJob,
    duplicateJob,
    activateJob,
    deactivateJob,
  } = useEmployerJobs();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingJob, setEditingJob] = useState<EmployerJob | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Tabs - using the actual status from the hook
  const tabs = [
    { id: "all", label: "All Jobs", count: filteredJobs.length },
    {
      id: "active",
      label: "Active",
      count: filteredJobs.filter((j) => j.status === "active").length,
    },
    {
      id: "draft",
      label: "Draft",
      count: filteredJobs.filter((j) => j.status === "draft").length,
    },
    {
      id: "expired",
      label: "Expired",
      count: filteredJobs.filter((j) => j.status === "expired").length,
    },
  ];

  const handleDelete = (jobId: string, jobTitle: string) => {
    deleteJobDialog({
      title: `Delete ${jobTitle}?`,
      description: "This will permanently delete the job.",
      onConfirm: () => deleteJob(jobId),
    });
  };

  const handleDuplicate = async (job: EmployerJob) => {
    try {
      duplicateJob(job);
    } catch (error) {
      console.error("Failed to duplicate job:", error);
    }
  };

  const handleActivate = async (job: EmployerJob) => {
    try {
      activateJob(job.job_id);
    } catch (error) {
      console.error("Failed to activate job:", error);
    }
  };

  const handleClose = async (job: EmployerJob) => {
    try {
      deactivateJob(job.job_id);
    } catch (error) {
      console.error("Failed to close job:", error);
    }
  };

  const handleShare = (jobId: string) => {
    const url = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(url);
    alert("Job link copied to clipboard!");
  };

  const handleEdit = (job: EmployerJob) => {
    setEditingJob(job);
    setIsEditDialogOpen(true);
  };

  // ✅ FIXED: Use the public job details route
  const handleView = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleJobUpdated = () => {
    fetchJobs(); // Refresh the jobs list
    setIsEditDialogOpen(false);
    setEditingJob(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
            Draft
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gray-50 text-gray-700 border border-gray-200 font-medium">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            Expired
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 font-medium">
            {status}
          </Badge>
        );
    }
  };

  const filteredJobsByTab = filteredJobs.filter(
    (j) => activeTab === "all" || j.status === activeTab
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header - Removed stats and made unique */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                      Recruitment Hub
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      Your Gateway to Exceptional Talent
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-lg lg:text-xl font-medium max-w-2xl">
                  Craft compelling opportunities and connect with top-tier
                  candidates through our intelligent hiring platform
                </p>
              </div>
              <div className="lg:shrink-0">
                <NewJobPostDialog onJobCreated={fetchJobs} />
              </div>
            </div>
          </div>

          {/* Navigation & Search */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/80 hover:shadow-md"
                    }`}
                  >
                    <span className="relative z-10">{tab.label}</span>
                    <Badge
                      className={`ml-2 ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {tab.count}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Search jobs, skills, locations..."
                  className="pl-12 pr-4 py-3 border-0 rounded-xl w-full bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="space-y-4">
            {filteredJobsByTab.length > 0 ? (
              filteredJobsByTab.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onActivate={handleActivate}
                  onClose={handleClose}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  onView={handleView} // ✅ Use the fixed handleView function
                  getStatusBadge={getStatusBadge}
                />
              ))
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No jobs found
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start by creating your first job posting"}
                </p>
                {!searchTerm && <NewJobPostDialog onJobCreated={fetchJobs} />}
              </div>
            )}
          </div>
        </div>

        {/* Edit Job Dialog */}
        {editingJob && (
          <EditJobDialog
            job={editingJob}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onJobUpdated={handleJobUpdated}
          />
        )}
      </div>
    </Layout>
  );
};

// Separate JobCard component
interface JobCardProps {
  job: EmployerJob;
  onEdit: (job: EmployerJob) => void;
  onDuplicate: (job: EmployerJob) => void;
  onActivate: (job: EmployerJob) => void;
  onClose: (job: EmployerJob) => void;
  onDelete: (jobId: string, jobTitle: string) => void;
  onShare: (jobId: string) => void;
  onView: (jobId: string) => void; // This should now use the public route
  getStatusBadge: (status: string) => JSX.Element;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  onDuplicate,
  onActivate,
  onClose,
  onDelete,
  onShare,
  onView, // ✅ This now uses the fixed handleView function
  getStatusBadge,
}) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/90">
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Job Info */}
          <div className="space-y-4 flex-1">
            {/* Title & Status Row */}
            <div className="flex flex-wrap items-start gap-3">
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                {job.title}
              </h3>
              {getStatusBadge(job.status)}
              {job.is_premium && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-medium">
                  <Star className="h-3 w-3 mr-1" fill="currentColor" />
                  Premium Boost
                </Badge>
              )}
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Type</p>
                  <p className="font-semibold capitalize">
                    {job.job_type || job.type}
                  </p>
                </div>
              </div>

              {job.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Location
                    </p>
                    <p className="font-semibold">{job.location}</p>
                  </div>
                </div>
              )}

              {job.salary_range && (
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Salary</p>
                    <p className="font-semibold">{job.salary_range}</p>
                  </div>
                </div>
              )}

              {job.experience_level && (
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Experience
                    </p>
                    <p className="font-semibold capitalize">
                      {job.experience_level}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-blue-700">
                  {job.application_count ?? 0} applicants
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>
                  Posted {formatDistanceToNow(new Date(job.created_at))} ago
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 lg:flex-col lg:items-end">
            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onView(job.job_id)} // ✅ This now uses the fixed handleView
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                title="View Job"
              >
                <Eye className="h-5 w-5" />
              </button>

              <button
                onClick={() => onShare(job.job_id)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                title="Share Job"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                onClick={() => onDuplicate(job)}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg"
                title="Duplicate Job"
              >
                <Copy className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  /* Boost functionality */
                }}
                className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg ${
                  job.is_premium
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                }`}
                title={job.is_premium ? "Premium Boost Active" : "Boost Job"}
              >
                <Star
                  className={`h-5 w-5 ${job.is_premium ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                <DropdownMenuItem
                  onClick={() => onView(job.job_id)} // ✅ This now uses the fixed handleView
                  className="gap-3 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(job)}
                  className="gap-3 p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  <span className="font-medium">Edit Job</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate(job)}
                  className="gap-3 p-3 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  <span className="font-medium">Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer">
                  <Star
                    className={`h-4 w-4 ${
                      job.is_premium ? "fill-current" : ""
                    }`}
                  />
                  <span className="font-medium">
                    {job.is_premium ? "Manage Boost" : "Boost Job"}
                  </span>
                </DropdownMenuItem>
                {job.status === "active" ? (
                  <DropdownMenuItem
                    onClick={() => onClose(job)}
                    className="gap-3 p-3 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Close Job</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onActivate(job)}
                    className="gap-3 p-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <Power className="h-4 w-4" />
                    <span className="font-medium">Activate Job</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(job.job_id, job.title)}
                  className="gap-3 p-3 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="font-medium">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobs;
