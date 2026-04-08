import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Loader2, Users, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEmployerApplications } from "@/hooks/use-employer-applications";
import { ApplicantProfileDialog } from "@/components/employer/ApplicantProfileDialog";

const AllApplicants = () => {
  const navigate = useNavigate();
  const {
    filteredApplications,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    reviewApplication,
    stats,
  } = useEmployerApplications();

  const handleScheduleInterview = (applicantId: string) => {
    reviewApplication(applicantId, "Reviewed");
    navigate("/employer/interviews/schedule");
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 40) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getStatusBadgeColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "reviewed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "accepted": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <DashboardLayout title="All Applicants" role="employer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => navigate("/employer/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold mt-4">All Applicants</h1>
            <p className="text-gray-500">Manage all candidate applications across all positions</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-gray-500">Total</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div><p className="text-sm text-gray-500">Pending</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div><p className="text-sm text-gray-500">Reviewed</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-green-600">{stats.accepted}</div><p className="text-sm text-gray-500">Accepted</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-600">{stats.rejected}</div><p className="text-sm text-gray-500">Rejected</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Applicants</CardTitle>
                <CardDescription>View and manage all candidate applications</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input type="search" placeholder="Search applicants..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-600" /><p className="text-gray-500 mt-2">Loading applications...</p></TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-red-500"><XCircle className="h-8 w-8 mx-auto mb-2" /><p>Failed to load applications</p></TableCell></TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500"><Users className="h-12 w-12 mx-auto text-gray-300 mb-2" /><p>No applicants found</p></TableCell></TableRow>
                ) : (
                  filteredApplications.map((applicant) => (
                    <ApplicantProfileDialog
                      key={applicant.id}
                      applicant={applicant}
                      onStatusChange={reviewApplication}
                      onScheduleInterview={handleScheduleInterview}
                    >
                      <TableRow className="cursor-pointer hover:bg-blue-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {applicant.applicantInfo.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{applicant.applicantInfo.name}</p>
                              <p className="text-xs text-gray-500">{applicant.applicantInfo.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-700 font-medium">{applicant.jobInfo.title}</p>
                            <p className="text-xs text-gray-500">{applicant.jobInfo.company}</p>
                          </div>
                        </TableCell>
                        <TableCell><span className="text-gray-600 text-sm">{applicant.appliedDate}</span></TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBadgeColor(applicant.match_score || 0)}`}>
                            {applicant.match_score || 0}% match
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(applicant.status)}`}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200">
                              <Eye className="h-3 w-3 text-blue-600" />
                            </Button>
                            {applicant.status === "Pending" && (
                              <>
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); reviewApplication(applicant.id, "Reviewed"); }} className="h-8 px-3 text-xs hover:bg-blue-50 border-blue-200 text-blue-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />Review
                                </Button>
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); reviewApplication(applicant.id, "Accepted"); }} className="h-8 px-3 text-xs hover:bg-green-50 border-green-200 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />Accept
                                </Button>
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); reviewApplication(applicant.id, "Rejected"); }} className="h-8 px-3 text-xs hover:bg-red-50 border-red-200 text-red-700">
                                  <XCircle className="h-3 w-3 mr-1" />Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </ApplicantProfileDialog>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AllApplicants;
