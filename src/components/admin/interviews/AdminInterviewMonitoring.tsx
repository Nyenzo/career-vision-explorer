import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Video, 
  Phone, 
  Users, 
  Eye, 
  Calendar, 
  Clock, 
  Search,
  Filter,
  BarChart3,
  Activity,
  UserCheck,
  VideoOff
} from "lucide-react";
import { useFreelancerInterviews } from "@/hooks/use-freelancer-interviews";
import { FreelancerInterview } from "@/types/freelancer";

export const AdminInterviewMonitoring = () => {
  const { getAllInterviews, updateInterviewStatus } = useFreelancerInterviews();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const interviews = getAllInterviews();

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    const matchesType = typeFilter === "all" || interview.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeColor = (status: FreelancerInterview['status']) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "In Progress":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />;
      case "Phone":
        return <Phone className="h-4 w-4" />;
      case "In-person":
        return <Users className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === "Scheduled").length,
    inProgress: interviews.filter(i => i.status === "In Progress").length,
    completed: interviews.filter(i => i.status === "Completed").length,
    videoInterviews: interviews.filter(i => i.type === "Video").length,
  };

  const InterviewDetailsDialog = ({ interview }: { interview: FreelancerInterview }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(interview.type)}
            Interview Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Freelancer</h4>
              <p className="text-muted-foreground">{interview.freelancerName}</p>
            </div>
            <div>
              <h4 className="font-medium">Client</h4>
              <p className="text-muted-foreground">{interview.clientName}</p>
            </div>
            <div>
              <h4 className="font-medium">Date & Time</h4>
              <p className="text-muted-foreground">
                {new Date(`${interview.scheduledDate} ${interview.scheduledTime}`).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Duration</h4>
              <p className="text-muted-foreground">{interview.duration}</p>
            </div>
            <div>
              <h4 className="font-medium">Type</h4>
              <div className="flex items-center gap-2">
                {getTypeIcon(interview.type)}
                <span className="text-muted-foreground">{interview.type}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium">Status</h4>
              <Badge className={getStatusBadgeColor(interview.status)}>
                {interview.status}
              </Badge>
            </div>
          </div>
          
          {interview.tier && (
            <div>
              <h4 className="font-medium">Package Tier</h4>
              <Badge variant="secondary" className="capitalize">{interview.tier}</Badge>
            </div>
          )}
          
          {interview.meetingLink && (
            <div>
              <h4 className="font-medium">Meeting Link</h4>
              <p className="text-muted-foreground break-all">{interview.meetingLink}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.open(interview.meetingLink, '_blank')}
              >
                <Video className="h-4 w-4 mr-2" />
                Monitor Call
              </Button>
            </div>
          )}
          
          {interview.notes && (
            <div>
              <h4 className="font-medium">Notes</h4>
              <p className="text-muted-foreground">{interview.notes}</p>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => updateInterviewStatus(interview.id, "In Progress")}
              disabled={interview.status === "In Progress"}
            >
              Start Monitoring
            </Button>
            <Button 
              variant="outline" 
              onClick={() => updateInterviewStatus(interview.id, "Completed")}
              disabled={interview.status === "Completed"}
            >
              Mark Complete
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => updateInterviewStatus(interview.id, "Cancelled")}
              disabled={interview.status === "Cancelled"}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-3xl font-bold">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
              <UserCheck className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Video Calls</p>
                <p className="text-3xl font-bold">{stats.videoInterviews}</p>
              </div>
              <Video className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Interview Monitoring Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by freelancer or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="In-person">In-person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interviews Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <VideoOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No interviews found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.freelancerName}</TableCell>
                      <TableCell>{interview.clientName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(`${interview.scheduledDate} ${interview.scheduledTime}`).toLocaleDateString()}
                          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                          {interview.scheduledTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(interview.type)}
                          {interview.type}
                        </div>
                      </TableCell>
                      <TableCell>{interview.duration}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <InterviewDetailsDialog interview={interview} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};