import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/admin/DashboardLayout";
import { StatisticsCards } from "@/components/employer/StatisticsCards";
import { RecentApplicantsTable } from "@/components/employer/RecentApplicantsTable";
import ProjectsPage from "../EmployerProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/sonner";
import { ApiErrorBoundary } from "@/components/error/ApiErrorBoundary";
import Layout from "@/components/layout/Layout";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Authentication Required", {
        description: "Please log in to access the employer dashboard",
      });
      navigate("/admin/login?returnUrl=/employer/dashboard");
    }

    if (!isLoading && isAuthenticated && !hasRole("employer")) {
      toast.error("Access Denied", {
        description: "You need employer permissions to access this page",
      });
      navigate("/");
    }
  }, [isAuthenticated, hasRole, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !hasRole("employer")) return null;

  return (
    <Layout>
      <ApiErrorBoundary>
        <DashboardLayout title="Employer Dashboard" role="employer">
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

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectsPage />
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ApiErrorBoundary>
    </Layout>
  );
};

export default EmployerDashboard;
