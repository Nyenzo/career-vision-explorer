
import React from "react";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { RecentActivityCard } from "./RecentActivityCard";

export const OverviewTab = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ProfileCompletionCard />
      <RecentActivityCard />
    </div>
  );
};
