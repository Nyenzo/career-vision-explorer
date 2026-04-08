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
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useEmployerApplications } from "@/hooks/use-employer-applications";
import { ApplicantProfileDialog } from "./ApplicantProfileDialog";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RecentApplicationsTableSkeleton } from "@/components/ui/skeleton-loaders";

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
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Applications</h3>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Latest candidate applications
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewAllApplicants}
            className="whitespace-nowrap h-8 px-3"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View All
          </Button>
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-medium text-foreground text-sm">Candidate</TableHead>
              <TableHead className="font-medium text-foreground text-sm hidden sm:table-cell">Position</TableHead>
              <TableHead className="font-medium text-foreground text-sm hidden md:table-cell">Applied</TableHead>
              <TableHead className="font-medium text-foreground text-sm text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentApplicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <Users className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm">No recent applicants</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              recentApplications.map((applicant) => (
                <ApplicantProfileDialog
                  key={applicant.id}
                  applicant={applicant}
                  onStatusChange={reviewApplication}
                  onScheduleInterview={handleScheduleInterview}
                >
                  <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-medium text-xs sm:text-sm">
                          {applicant.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{applicant.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden truncate">{applicant.position}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-foreground text-sm">{applicant.position}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-muted-foreground text-xs">{applicant.appliedTime}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {applicant.status === "Reviewing" && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleInterview(applicant.id);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Calendar className="h-3 w-3" />
                          </Button>
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
