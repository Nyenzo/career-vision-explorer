import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { RecentActivityCard } from "./RecentActivityCard";

interface DashboardTabsProps {
  onViewApplication?: (application: any) => void;
}

export const DashboardTabs = ({ onViewApplication }: DashboardTabsProps) => {
  return (
    <div className="space-y-8">
      {/* Directly show Profile Completion and Recent Activity cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCompletionCard />
        <RecentActivityCard />
      </div>
    </div>
  );
};
