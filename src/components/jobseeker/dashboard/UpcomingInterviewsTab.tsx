import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, MapPin, Phone } from "lucide-react";

const mockInterviews = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    date: "2024-01-15",
    time: "10:00 AM",
    type: "Video Call",
    status: "scheduled",
    interviewer: "Sarah Johnson",
    location: "Google Meet"
  },
  {
    id: "2",
    jobTitle: "UI/UX Designer",
    company: "Design Studio",
    date: "2024-01-18",
    time: "2:30 PM",
    type: "In-person",
    status: "confirmed",
    interviewer: "Mike Chen",
    location: "Office - Building A, Floor 3"
  },
  {
    id: "3",
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    date: "2024-01-22",
    time: "11:00 AM",
    type: "Phone Call",
    status: "pending",
    interviewer: "Alex Rodriguez",
    location: "Phone Interview"
  }
];

export const UpcomingInterviewsTab = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video Call":
        return <Video className="h-4 w-4" />;
      case "Phone Call":
        return <Phone className="h-4 w-4" />;
      case "In-person":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upcoming Interviews</h2>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Calendar
        </Button>
      </div>

      <div className="grid gap-4">
        {mockInterviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{interview.jobTitle}</CardTitle>
                  <p className="text-muted-foreground">{interview.company}</p>
                </div>
                <Badge className={getStatusColor(interview.status)}>
                  {interview.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {new Date(interview.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {interview.time}
                </div>
                <div className="flex items-center text-sm">
                  {getTypeIcon(interview.type)}
                  <span className="ml-2">{interview.type}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground">Interviewer:</span>
                  <span className="ml-1">{interview.interviewer}</span>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Location: </span>
                {interview.location}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm">Join Interview</Button>
                <Button size="sm" variant="outline">Reschedule</Button>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockInterviews.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No upcoming interviews</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any scheduled interviews at the moment.
            </p>
            <Button>Browse Jobs</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};