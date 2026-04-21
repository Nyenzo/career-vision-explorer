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
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEmployerApplications } from "@/hooks/use-employer-applications";
import { ApplicantProfileDialog } from "./ApplicantProfileDialog";
import { useNavigate } from "react-router-dom";
import { RecentApplicationsTableSkeleton } from "@/components/ui/skeleton-loaders";

export const RecentApplicantsTable = () => {
  const {
    filteredApplications,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    reviewApplication,
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

  const handleViewAllApplicants = () => {
    navigate("/employer/applicants");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent Applications</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-48 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search applicants..."
              className="pl-9 h-8 text-sm bg-gray-50 border-gray-200 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-8 text-sm bg-gray-50 border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="link"
            onClick={handleViewAllApplicants}
            className="text-sm text-indigo-600 font-medium p-0 h-auto hover:no-underline"
          >
            View All Candidates
          </Button>
        </div>
      </div>

      {/* Table for Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Position</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Applied</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Match Score</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  <RecentApplicationsTableSkeleton />
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
                  <Users className="h-12 w-12 text-gray-300 mb-2 mx-auto" />
                  <p>No recent applicants found</p>
                  <p className="text-sm">Applications will appear here as they come in</p>
                </td>
              </tr>
            ) : (
              recentApplications.map((applicant) => (
                <ApplicantProfileDialog
                  key={applicant.id}
                  applicant={applicant}
                  onStatusChange={reviewApplication}
                >
                  <tr className="cursor-pointer hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {applicant.applicantInfo.avatar_url ? (
                          <img
                            src={applicant.applicantInfo.avatar_url}
                            alt={applicant.applicantInfo.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                            {applicant.applicantInfo.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{applicant.applicantInfo.name}</p>
                          <p className="text-xs text-gray-400">{applicant.applicantInfo.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {applicant.jobInfo.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{applicant.appliedDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getScoreBadgeColor(applicant.match_score || 0)}`}>
                        {applicant.match_score || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${applicant.status.toLowerCase() === 'accepted' ? 'bg-green-500' : applicant.status.toLowerCase() === 'rejected' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                        <span className="text-sm text-gray-700">{applicant.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Eye className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                        {applicant.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); reviewApplication(applicant.id, "Reviewed"); }}
                              className="h-7 px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); reviewApplication(applicant.id, "Accepted"); }}
                              className="h-7 px-2.5 text-xs text-green-700 border-green-200 hover:bg-green-50"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); reviewApplication(applicant.id, "Rejected"); }}
                              className="h-7 px-2.5 text-xs text-red-700 border-red-200 hover:bg-red-50"
                            >
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
            <RecentApplicationsTableSkeleton />
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
            >
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {applicant.applicantInfo.avatar_url ? (
                      <img
                        src={applicant.applicantInfo.avatar_url}
                        alt={applicant.applicantInfo.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {applicant.applicantInfo.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {applicant.applicantInfo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {applicant.applicantInfo.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${applicant.status.toLowerCase() === 'accepted' ? 'bg-green-500' : applicant.status.toLowerCase() === 'rejected' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                    <span className="text-xs font-medium text-gray-700">{applicant.status}</span>
                  </div>
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
