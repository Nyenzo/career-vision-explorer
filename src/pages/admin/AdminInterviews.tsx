import AdminLayout from "@/components/admin/AdminLayout";
import { AdminInterviewMonitoring } from "@/components/admin/interviews/AdminInterviewMonitoring";

const AdminInterviews = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Interview Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage freelancer interviews and video calls
          </p>
        </div>
        
        <AdminInterviewMonitoring />
      </div>
    </AdminLayout>
  );
};

export default AdminInterviews;