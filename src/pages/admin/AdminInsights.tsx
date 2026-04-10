
import AdminLayout from "@/components/admin/AdminLayout";
import InsightsManagement from "@/components/admin/insights/InsightsManagement";
import { InsightsProvider } from "@/hooks/use-insights-provider";

const AdminInsights = () => {
  return (
    <AdminLayout>
      <InsightsProvider>
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Insights Management</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage market data, industry insights, and regional analysis displayed on the insights page.
            </p>
          </div>
          
          <InsightsManagement />
        </div>
      </InsightsProvider>
    </AdminLayout>
  );
};

export default AdminInsights;
