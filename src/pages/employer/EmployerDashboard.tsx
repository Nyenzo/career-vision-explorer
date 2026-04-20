import { StatisticsCards } from "@/components/employer/StatisticsCards";
import { RecentApplicantsTable } from "@/components/employer/RecentApplicantsTable";
import { ApiErrorBoundary } from "@/components/error/ApiErrorBoundary";

const EmployerDashboard = () => {
  return (
    <ApiErrorBoundary>
      <div className="min-h-screen bg-[#f7f8fa] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <StatisticsCards />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <RecentApplicantsTable />
        </div>
      </div>
    </ApiErrorBoundary>
  );
};

export default EmployerDashboard;
