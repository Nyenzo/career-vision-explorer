import { StatisticsCards } from "@/components/employer/StatisticsCards";
import { RecentApplicantsTable } from "@/components/employer/RecentApplicantsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiErrorBoundary } from "@/components/error/ApiErrorBoundary";

const EmployerDashboard = () => {
  return (
    <ApiErrorBoundary>
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Overview & Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview & Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <StatisticsCards />
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentApplicantsTable />
          </CardContent>
        </Card>
      </div>
    </ApiErrorBoundary>
  );
};

export default EmployerDashboard;
