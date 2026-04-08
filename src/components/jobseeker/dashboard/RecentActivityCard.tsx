
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Briefcase, User, Award, AlertCircle } from "lucide-react";
import { applicationsService } from "@/services/applications.service";
import { useAuth } from "@/hooks/use-auth";
import { Application } from "@/types/api";

export const RecentActivityCard = () => {
  const { isAuthenticated, profile } = useAuth();
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const applications = await applicationsService.getMyApplications();
        // Get the most recent 3 applications
        const sortedApplications = applications
          .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
          .slice(0, 3);
        setRecentApplications(sortedApplications);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching recent activity:', err);
        setError(err.message || 'Failed to fetch recent activity');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [isAuthenticated]);

  const getActivityColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' };
      case 'reviewed':
        return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
      case 'accepted':
        return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
      case 'rejected':
        return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  // Generate activities from applications and profile
  const generateActivities = () => {
    const activities = [];

    // Add recent applications
    recentApplications.forEach(app => {
      const colors = getActivityColor(app.status);
      activities.push({
        icon: Briefcase,
        text: `Applied to ${app.job_title || 'Job Position'} at ${app.company_name || 'Company'}`,
        time: formatRelativeTime(app.applied_at),
        colors
      });
    });

    // Add profile completion activity if profile exists
    if (profile && profile.skills && profile.skills.length > 0) {
      activities.push({
        icon: User,
        text: `Profile updated with ${profile.skills.length} skills`,
        time: 'Recently',
        colors: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' }
      });
    }

    // Add a default activity if no real activities
    if (activities.length === 0) {
      activities.push({
        icon: Award,
        text: 'Welcome to your career dashboard!',
        time: 'Now',
        colors: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' }
      });
    }

    return activities.slice(0, 4); // Limit to 4 activities
  };

  const activities = generateActivities();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Clock className="h-5 w-5 text-green-600" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">{activity.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
