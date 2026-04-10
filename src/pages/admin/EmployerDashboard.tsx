
import React from "react";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { JobPostHeader } from "@/components/employer/JobPostHeader";
import { StatisticsCards } from "@/components/employer/StatisticsCards";
import { RecentApplicantsTable } from "@/components/employer/RecentApplicantsTable";
import { JobListingsTable } from "@/components/employer/JobListingsTable";

const EmployerDashboard = () => {
  return (
    <DashboardLayout title="Employer Dashboard" role="employer">
      <JobPostHeader />
      <StatisticsCards />
      <div className="grid grid-cols-1 gap-6">
        <JobListingsTable />
        <RecentApplicantsTable />
      </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
