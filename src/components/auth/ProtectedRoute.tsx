import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/sonner";
import { PageLoaderSkeleton } from "@/components/ui/skeleton-loaders";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "job_seeker" | "employer" | "freelancer";
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const normalizeRole = (role?: string) => {
    if (!role) return "";
    const normalized = role.trim().toLowerCase().replace(/[-\s]+/g, "_");
    if (normalized === "jobseeker") return "job_seeker";
    return normalized;
  };
  const getDashboardPath = (role?: string) => {
    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "admin") return "/admin/dashboard";
    if (normalizedRole === "employer") return "/employer/dashboard";
    if (normalizedRole === "freelancer") return "/freelancer/dashboard";
    if (normalizedRole === "job_seeker") return "/jobseeker/dashboard";
    return "/dashboard";
  };
  const effectiveRole = normalizeRole(profile?.active_role || user?.account_type);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (requiredRole && effectiveRole !== requiredRole) {
        navigate(getDashboardPath(effectiveRole), { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, navigate, effectiveRole]);

  if (isLoading) {
    return <PageLoaderSkeleton />;
  }

  if (
    !isAuthenticated ||
    (requiredRole && effectiveRole !== requiredRole)
  ) {
    return null;
  }

  return <>{children}</>;
};
