
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Calendar, Download, Mail, Phone } from "lucide-react";
import { useApplicants } from "@/hooks/use-applicants";
import { useJobPosts } from "@/hooks/use-job-posts";
import { ApplicantProfileDialog } from "@/components/employer/ApplicantProfileDialog";

const JobApplicants = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getApplicantsByJobId, updateApplicantStatus } = useApplicants();
  const { getJob } = useJobPosts();
  const [searchQuery, setSearchQuery] = useState("");

  const job = jobId ? getJob(jobId) : null;
  const allApplicants = jobId ? getApplicantsByJobId(jobId) : [];

  const filteredApplicants = allApplicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Review":
        return "bg-yellow-100 text-yellow-800";
      case "Interview":
        return "bg-blue-100 text-blue-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  if (!job) {
    return (
      <DashboardLayout title="Job Applicants" role="employer">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Job Not Found</h3>
              <p className="text-gray-500 mt-2">The job you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/employer/dashboard")} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Job Applicants" role="employer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => navigate("/employer/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold mt-4">{job.title}</h1>
            <p className="text-gray-500">{job.location} • {job.type}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{filteredApplicants.length}</p>
            <p className="text-gray-500">Total Applicants</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Applicants for {job.title}</CardTitle>
                <CardDescription>Manage and review candidate applications</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search applicants..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApplicants.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900">No applicants found</h3>
                <p className="text-gray-500 mt-2">
                  {searchQuery ? "Try adjusting your search criteria." : "No one has applied for this position yet."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          {applicant.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {applicant.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {applicant.email}
                          </div>
                          {applicant.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {applicant.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{applicant.appliedTime}</TableCell>
                      <TableCell>
                        <Badge className={getScoreBadgeColor(applicant.matchScore)}>
                          {applicant.matchScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(applicant.status)}>
                          {applicant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ApplicantProfileDialog
                            applicant={applicant}
                            onStatusChange={updateApplicantStatus}
                          >
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </ApplicantProfileDialog>
                          {applicant.resumeUrl && (
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Resume
                            </Button>
                          )}
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
    </DashboardLayout>
  );
};

export default JobApplicants;
