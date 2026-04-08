
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Calendar, Clock, TrendingUp, ArrowUpRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployerStats } from "@/hooks/use-employer-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  trend?: string;
  onClick: () => void;
}

const StatCard = ({ title, value, subtitle, icon, iconColor, bgColor, trend, onClick }: StatCardProps) => (
  <Card
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    aria-label={`${title}: ${value}. ${subtitle}`}
    className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  >
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-xl`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <div className="flex items-center justify-end mt-4 opacity-60">
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </div>
    </CardContent>
  </Card>
);

// Skeleton component for loading state
const StatCardSkeleton = () => (
  <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <div className="flex items-center justify-end mt-4">
        <Skeleton className="h-4 w-4" />
      </div>
    </CardContent>
  </Card>
);

export const StatisticsCards = () => {
  const navigate = useNavigate();
  const { stats, isLoading, error, percentageChanges } = useEmployerStats();

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading statistics</AlertTitle>
        <AlertDescription>
          {error || "Failed to load employer statistics. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state if no stats
  if (!stats) {
    return (
      <Alert className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No statistics available</AlertTitle>
        <AlertDescription>
          Start posting jobs to see your employer statistics.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Jobs Posted"
        value={stats.totalJobs}
        subtitle={stats.inactiveJobs > 0 ? `${stats.inactiveJobs} inactive` : "All active"}
        icon={<Briefcase className="h-6 w-6" />}
        iconColor="text-blue-600"
        bgColor="bg-blue-50"
        trend={percentageChanges.totalJobsChange > 0 ? `+${percentageChanges.totalJobsChange}% this month` : undefined}
        onClick={() => navigate("/employer/jobs")}
      />
      <StatCard
        title="Active Listings"
        value={stats.activeJobs}
        subtitle={`${Math.round(stats.applicationRate)}% application rate`}
        icon={<TrendingUp className="h-6 w-6" />}
        iconColor="text-green-600"
        bgColor="bg-green-50"
        trend={percentageChanges.activeJobsChange > 0 ? `+${percentageChanges.activeJobsChange}% this month` : undefined}
        onClick={() => navigate("/employer/jobs?filter=active")}
      />
      <StatCard
        title="Total Applications"
        value={stats.totalApplications}
        subtitle={`~${Math.round(stats.avgApplicationsPerJob)} per job`}
        icon={<Users className="h-6 w-6" />}
        iconColor="text-purple-600"
        bgColor="bg-purple-50"
        trend={percentageChanges.applicationsChange > 0 ? `+${percentageChanges.applicationsChange}% this month` : undefined}
        onClick={() => navigate("/employer/applicants")}
      />
      <StatCard
        title="Interview Scheduled"
        value="0"
        subtitle="Coming soon"
        icon={<Calendar className="h-6 w-6" />}
        iconColor="text-amber-600"
        bgColor="bg-amber-50"
        trend={undefined}
        onClick={() => navigate("/employer/interviews")}
      />
    </div>
  );
};
