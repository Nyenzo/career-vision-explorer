
import React from "react";
import { Briefcase, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployerStats } from "@/hooks/use-employer-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeVariant?: "green" | "blue" | "red";
  onClick: () => void;
}

const StatCard = ({ title, value, icon, iconBg, badge, badgeVariant = "green", onClick }: StatCardProps) => {
  const badgeColors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      aria-label={`${title}: ${value}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBg} p-2.5 rounded-xl`}>{icon}</div>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-3 w-28 mb-2" />
    <Skeleton className="h-10 w-16" />
  </div>
);

export const StatisticsCards = () => {
  const navigate = useNavigate();
  const { stats, isLoading, error, percentageChanges } = useEmployerStats();

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[1, 2, 3].map((index) => (
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <StatCard
        title="Total Jobs Posted"
        value={stats.totalJobs}
        icon={<Briefcase className="h-5 w-5 text-blue-600" />}
        iconBg="bg-blue-50"
        badge={percentageChanges.totalJobsChange > 0 ? `+${percentageChanges.totalJobsChange}% vs last mo.` : undefined}
        badgeVariant="green"
        onClick={() => navigate("/employer/jobs")}
      />
      <StatCard
        title="Active Listings"
        value={stats.activeJobs}
        icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
        iconBg="bg-indigo-50"
        badge="Stable Pipeline"
        badgeVariant="blue"
        onClick={() => navigate("/employer/jobs?filter=active")}
      />
      <StatCard
        title="Total Applications"
        value={stats.totalApplications.toLocaleString()}
        icon={<Users className="h-5 w-5 text-purple-600" />}
        iconBg="bg-purple-50"
        badge="HOT"
        badgeVariant="red"
        onClick={() => navigate("/employer/applicants")}
      />
    </div>
  );
};
