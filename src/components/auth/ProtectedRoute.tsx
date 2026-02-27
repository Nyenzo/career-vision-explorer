import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "job_seeker" | "employer" | "freelancer";
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (requiredRole && user?.account_type !== requiredRole) {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (
    !isAuthenticated ||
    (requiredRole && user?.account_type !== requiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
};
