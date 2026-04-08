
import React, { useState } from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, User, MapPin, Video, Phone } from "lucide-react";
import { useInterviews } from "@/hooks/use-interviews";
import { format } from "date-fns";

const EmployerInterviews = () => {
  const { interviews, updateInterviewStatus } = useInterviews();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Rescheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />;
      case "Phone":
        return <Phone className="h-4 w-4" />;
      case "In-Person":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === "Scheduled").length,
    completed: interviews.filter(i => i.status === "Completed").length,
    cancelled: interviews.filter(i => i.status === "Cancelled").length,
    rescheduled: interviews.filter(i => i.status === "Rescheduled").length,
  };

  return (
    <DashboardLayout title="Interviews" role="employer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interview Schedule</h1>
            <p className="text-gray-500">Manage all your scheduled interviews</p>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <p className="text-sm text-gray-500">Total Interviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
              <p className="text-sm text-gray-500">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.rescheduled}</div>
              <p className="text-sm text-gray-500">Rescheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
              <p className="text-sm text-gray-500">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Interviews</CardTitle>
                <CardDescription>View and manage scheduled interviews</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search interviews..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900">No interviews found</h3>
                <p className="text-gray-500 mt-2">
                  {searchQuery || statusFilter !== "all" ? "Try adjusting your search criteria." : "No interviews scheduled yet."}
                </p>
                <div className="mt-4" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {interview.applicantName}
                        </div>
                      </TableCell>
                      <TableCell>{interview.jobTitle}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-sm">
                              {format(new Date(interview.scheduledDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center ml-4">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-sm">{interview.scheduledTime}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getInterviewTypeIcon(interview.interviewType)}
                          <span className="ml-2">{interview.interviewType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{interview.interviewer}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {interview.status === "Scheduled" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateInterviewStatus(interview.id, "Completed")}
                              >
                                Mark Complete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateInterviewStatus(interview.id, "Cancelled")}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {interview.notes && (
                            <Button variant="ghost" size="sm" title={interview.notes}>
                              View Notes
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

export default EmployerInterviews;
