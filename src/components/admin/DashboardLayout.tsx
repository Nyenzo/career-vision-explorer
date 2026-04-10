// DashboardLayout.tsx - Remove Navbar import and usage
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
// Remove this import: import Navbar from "@/components/layout/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: "admin" | "employer" | "job_seeker" | "freelancer";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, hasRole } = useAuth();

  const isProfilePage = location.pathname === "/profile";
  const shouldCheckRole = role && !isProfilePage;

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (shouldCheckRole && !hasRole(role)) {
      toast({
        title: "Access Denied",
        description: `Please log in as a ${
          role === "job_seeker" ? "job seeker" : "employer"
        } to access this page`,
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [isAuthenticated, hasRole, navigate, toast, role, shouldCheckRole]);

  if (!isAuthenticated) {
    return null;
  }

  if (shouldCheckRole && !hasRole(role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Remove Navbar component */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
