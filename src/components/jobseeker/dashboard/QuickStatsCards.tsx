import React from "react";
import { Calendar, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useJobApplications } from "@/hooks/use-job-applications";
import { useAuth } from "@/hooks/use-auth";

export const QuickStatsCards = () => {
  const { profile, isLoading: authLoading } = useAuth();

  const { applications, isLoading: applicationsLoading } = useJobApplications();

  // Get profile score value
  const getProfileScore = () => {
    if (authLoading) return "...";
    if (!profile) return "0%";
    return `${profile.profile_completion_percentage ?? 0}%`;
  };

  // Get interviews count
  const getInterviewsValue = () => {
    if (applicationsLoading) return "...";
    return "0";
  };

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Interviews Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg flex-1">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {getInterviewsValue()}
            </p>
            <p className="text-sm text-gray-600">Interviews</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Score Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg flex-1">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <Star className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {getProfileScore()}
            </p>
            <p className="text-sm text-gray-600">Profile Score</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
