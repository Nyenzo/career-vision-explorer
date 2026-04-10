
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    console.log("AdminDashboard mounted", { user, isAuthenticated });
    
    if (!isAuthenticated) {
      toast.error("Access Denied", {
        description: "Please log in to access the admin dashboard",
      });
      navigate("/admin/login");
      return;
    }

    if (!hasRole("admin")) {
      toast.error("Access Denied", {
        description: "You don't have permission to access the admin dashboard",
      });
      navigate("/");
      return;
    }
  }, [isAuthenticated, hasRole, navigate, user]);

  if (!isAuthenticated || !hasRole("admin")) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Welcome to the Visiondrill administration panel. Monitor your platform's performance and manage all aspects of your career development ecosystem.
          </p>
        </div>
        <AdminMetrics />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
