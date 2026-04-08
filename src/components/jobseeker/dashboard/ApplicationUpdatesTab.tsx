
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { applicationsService } from "@/services/applications.service";
import { useAuth } from "@/hooks/use-auth";
import { Application } from "@/types/api";
import { RecentApplicationsTableSkeleton } from "@/components/ui/skeleton-loaders";

interface ApplicationUpdatesTabProps {
  onViewApplication: (application: any) => void;
}

export const ApplicationUpdatesTab = ({ onViewApplication }: ApplicationUpdatesTabProps) => {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userApplications = await applicationsService.getMyApplications();
        setApplications(userApplications);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Users className="h-5 w-5 text-blue-600" />
          Application Updates
        </CardTitle>
        <CardDescription>Track the status of your recent job applications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="h-4 w-4" />
            <span>Error: {error}</span>
          </div>
        )}
        
        {loading ? (
          <RecentApplicationsTableSkeleton />
        ) : applications.length > 0 ? (
          applications.map((application) => {
            // Transform the application to include compatibility fields
            const transformedApplication = {
              ...application,
              created_at: application.applied_at, // Use applied_at as created_at
              job: {
                title: application.job_title || 'Job Position',
                company: application.company_name || 'Company'
              }
            };
            
            return (
              <div
                key={application.application_id}
                className="p-6 bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {transformedApplication.job.title}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {transformedApplication.job.company}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`px-3 py-1 ${getStatusColor(application.status)}`}>
                      {application.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    Applied on {formatDate(transformedApplication.created_at)}
                  </div>
                  <Button 
                    variant="outline" 
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
                    onClick={() => onViewApplication(transformedApplication)}
                  >
                    View Application
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">
              {!isAuthenticated 
                ? 'Please log in to view your applications.'
                : 'Start applying to jobs to see your application status here.'}
            </p>
            <Button onClick={() => window.location.href = '/jobs'} variant="outline">
              Browse Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
