import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: "pending" | "reviewing" | "interview" | "rejected" | "accepted";
  salary?: string;
}

const mockApplications: Application[] = [
  {
    id: "1",
    jobTitle: "Senior React Developer",
    company: "TechFlow Solutions",
    appliedDate: "2024-07-15",
    status: "interview",
    salary: "$120k - $140k"
  },
  {
    id: "2",
    jobTitle: "Frontend Engineer",
    company: "StartupCorp",
    appliedDate: "2024-07-12",
    status: "reviewing",
    salary: "$100k - $120k"
  },
  {
    id: "3",
    jobTitle: "Full Stack Developer",
    company: "Digital Agency",
    appliedDate: "2024-07-10",
    status: "pending",
    salary: "$90k - $110k"
  }
];

export const ApplicationsCard = () => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "reviewing":
        return "secondary";
      case "interview":
        return "default";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "reviewing":
        return "text-blue-600";
      case "interview":
        return "text-green-600";
      case "accepted":
        return "text-green-700";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Briefcase className="h-5 w-5 text-green-600" />
          Recent Applications
        </CardTitle>
        <CardDescription>Track your job application progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockApplications.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/jobs">Start Applying</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {mockApplications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{application.jobTitle}</h4>
                      <Badge variant={getStatusBadgeVariant(application.status)} className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{application.company}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Applied {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                      {application.salary && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {application.salary}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              View All Applications ({mockApplications.length})
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};