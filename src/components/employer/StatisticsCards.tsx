
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
    className="cursor-pointer hover:shadow-md transition-all duration-200 border border-border bg-card"
  >
    <CardContent className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className={`${bgColor} p-2 rounded-lg`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-60" />
        </div>
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          {trend && (
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 text-success mr-1" />
              <span className="text-xs font-medium text-success">{trend}</span>
            </div>
          )}
        </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <StatCard
        title="Active Jobs"
        value={jobs.length}
        subtitle={`${boostedListings} boosted`}
        icon={<Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />}
        iconColor="text-primary"
        bgColor="bg-primary/10"
        trend="+12%"
        onClick={() => navigate("/employer/jobs")}
      />
      <StatCard
        title="Applicants"
        value={applicants.length}
        subtitle={`+${weeklyNewApplicants} this week`}
        icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
        iconColor="text-secondary-foreground"
        bgColor="bg-secondary/10"
        trend="+23%"
        onClick={() => navigate("/employer/applicants")}
      />
      <StatCard
        title="Interviews"
        value={interviews.filter(i => i.status === "Scheduled").length}
        subtitle={`${weeklyInterviews} this week`}
        icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
        iconColor="text-accent-foreground"
        bgColor="bg-accent/10"
        trend="+8%"
        onClick={() => navigate("/employer/interviews")}
      />
      <StatCard
        title="Views"
        value={totalViews.toLocaleString()}
        subtitle={`${viewsIncrease} monthly`}
        icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
        iconColor="text-muted-foreground"
        bgColor="bg-muted/50"
        trend="+18%"
        onClick={() => navigate("/employer/jobs")}
      />
    </div>
  );
};
