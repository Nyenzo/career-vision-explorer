
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Award, AlertCircle, Clock, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useJobApplications } from "@/hooks/use-job-applications";
import { Application } from "@/types/api";
export const RecentActivityCard = () => {
  const { profile } = useAuth();
  const { applications, isLoading: loading, error } = useJobApplications();
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (applications && applications.length > 0) {
      const sorted = [...applications]
        .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
        .slice(0, 3);
      setRecentApplications(sorted);
    }
  }, [applications]);

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
    <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-transparent">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold font-headline text-on-surface">Recent Activity</h3>
        <Clock className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-0">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error: {error}</span>
          </div>
        )}
        
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 relative pb-8">
              <div className="w-px bg-gray-200 absolute left-[3.5px] top-3 bottom-0" />
              <div className="h-2 w-2 rounded-full bg-gray-300 relative top-1.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded bg-gray-200 animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-5/6'}`} />
                <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          <div className="relative">
            {activities.map((activity, index) => {
              const isLast = index === activities.length - 1;
              // Extract the company name to highlight it
              // Assuming text format: "Applied to [Role] at [Company]" or similar
              let highlightedText = <>{activity.text}</>;
              if (activity.text.includes(" at ")) {
                const parts = activity.text.split(" at ");
                highlightedText = (
                  <>
                    {parts[0]} at <span className="font-semibold text-[#1a56db]">{parts[1]}</span>
                  </>
                );
              } else if (activity.text.includes("with ")) {
                const parts = activity.text.split("with ");
                highlightedText = (
                  <>
                    {parts[0]}with <span className="font-semibold text-[#059669]">{parts[1]}</span>
                  </>
                );
              }

              // Set dot color based on some logic or activity colors
              // The design shows green dot for profile update, blue for job application
              const isApplication = activity.text.includes("Applied");
              const dotColor = isApplication ? "bg-[#1a56db]" : "bg-[#059669]";

              return (
                <div key={index} className="flex gap-4 relative pb-8">
                  {/* Timeline vertical line */}
                  {!isLast && (
                    <div className="w-px bg-gray-200 absolute left-[3.5px] top-3 bottom-0" />
                  )}
                  {/* Timeline dot */}
                  <div className={`h-2 w-2 ${dotColor} rounded-full relative top-1.5 flex-shrink-0 shadow-[0_0_0_4px_#f8f9fa]`} />
                  
                  {/* Content */}
                  <div className="flex-1 pt-0">
                    <p className="text-sm text-gray-700 leading-snug">{highlightedText}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
