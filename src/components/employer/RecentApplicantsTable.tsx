import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  ExternalLink,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useEmployerApplications } from "@/hooks/use-employer-applications";
import { ApplicantProfileDialog } from "./ApplicantProfileDialog";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export const RecentApplicantsTable = () => {
  const {
    filteredApplications,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    jobFilter,
    setJobFilter,
    searchQuery,
    setSearchQuery,
    reviewApplication,
    stats,
    uniqueJobs,
  } = useEmployerApplications();
  const navigate = useNavigate();

  const recentApplications = filteredApplications.slice(0, 5);

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90)
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleScheduleInterview = (applicantId: string) => {
    reviewApplication(applicantId, "Reviewed");
    navigate("/employer/interviews/schedule");
  };

  const handleViewAllApplicants = () => {
    navigate("/employer/applicants");
  };

  return (
    <div className="space-y-4">
      {/* Header: Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Applications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage the latest candidate applications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:w-64 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search applicants..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-yellow-600" />
                  Pending ({stats.pending})
                </div>
              </SelectItem>
              <SelectItem value="reviewed">
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1 text-blue-600" />
                  Reviewed ({stats.reviewed})
                </div>
              </SelectItem>
              <SelectItem value="accepted">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  Accepted ({stats.accepted})
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center">
                  <XCircle className="h-3 w-3 mr-1 text-gray-600" />
                  Rejected ({stats.rejected})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Job Filter */}
          {uniqueJobs.length > 0 && (
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {uniqueJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            onClick={handleViewAllApplicants}
            className="whitespace-nowrap hover:bg-blue-50 border-blue-200 text-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      {/* Table for Desktop */}
      <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr className="border-gray-200">
              <th className="px-4 py-2 text-left font-semibold text-gray-900">
                Candidate
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-900">
                Position
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-900">
                Applied
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-900">
                Match Score
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-900">
                Status
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-600" />
                  <p>Loading applications...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-red-500">
                  <XCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load applications</p>
                </td>
              </tr>
            ) : recentApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 text-gray-300 mb-2" />
                  <p>No recent applicants found</p>
                  <p className="text-sm">
                    Applications will appear here as they come in
                  </p>
                </td>
              </tr>
            ) : (
              recentApplications.map((applicant) => (
                <ApplicantProfileDialog
                  key={applicant.id}
                  applicant={applicant}
                  onStatusChange={reviewApplication}
                  onScheduleInterview={handleScheduleInterview}
                >
                  <tr className="cursor-pointer hover:bg-blue-50/50 transition-colors border-gray-100">
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {applicant.applicantInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {applicant.applicantInfo.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {applicant.applicantInfo.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">{applicant.jobInfo.title}</td>
                    <td className="px-4 py-2">{applicant.appliedDate}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBadgeColor(
                          applicant.match_score || 0,
                        )}`}
                      >
                        {applicant.match_score || 0}% match
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          applicant.status,
                        )}`}
                      >
                        {applicant.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200"
                        >
                          <Eye className="h-3 w-3 text-blue-600" />
                        </Button>
                        {applicant.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                reviewApplication(applicant.id, "Reviewed");
                              }}
                              className="h-8 px-3 text-xs hover:bg-blue-50 border-blue-200 text-blue-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                reviewApplication(applicant.id, "Accepted");
                              }}
                              className="h-8 px-3 text-xs hover:bg-green-50 border-green-200 text-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                reviewApplication(applicant.id, "Rejected");
                              }}
                              className="h-8 px-3 text-xs hover:bg-red-50 border-red-200 text-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                </ApplicantProfileDialog>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-600" />
            <p>Loading applications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load applications</p>
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 text-gray-300 mb-2" />
            <p>No recent applicants found</p>
            <p className="text-sm">
              Applications will appear here as they come in
            </p>
          </div>
        ) : (
          recentApplications.map((applicant) => (
            <ApplicantProfileDialog
              key={applicant.id}
              applicant={applicant}
              onStatusChange={reviewApplication}
              onScheduleInterview={handleScheduleInterview}
            >
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {applicant.applicantInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {applicant.applicantInfo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {applicant.applicantInfo.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                      applicant.status,
                    )}`}
                  >
                    {applicant.status}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Position:</span>{" "}
                    {applicant.jobInfo.title}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Applied:</span>{" "}
                    {applicant.appliedDate}
                  </p>
                  <p
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBadgeColor(
                      applicant.match_score || 0,
                    )}`}
                  >
                    {applicant.match_score || 0}% match
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200"
                  >
                    <Eye className="h-3 w-3 text-blue-600" />
                  </Button>
                  {applicant.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          reviewApplication(applicant.id, "Reviewed");
                        }}
                        className="h-8 px-3 text-xs hover:bg-blue-50 border-blue-200 text-blue-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          reviewApplication(applicant.id, "Accepted");
                        }}
                        className="h-8 px-3 text-xs hover:bg-green-50 border-green-200 text-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          reviewApplication(applicant.id, "Rejected");
                        }}
                        className="h-8 px-3 text-xs hover:bg-red-50 border-red-200 text-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </ApplicantProfileDialog>
          ))
        )}
      </div>
    </div>
  );
};
