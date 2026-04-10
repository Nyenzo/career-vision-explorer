import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (hasRole("admin")) {
      navigate("/admin/dashboard");
    } else if (hasRole("employer")) {
      navigate("/employer/dashboard");
    } else if (hasRole("job_seeker")) {
      navigate("/jobseeker/dashboard");
    } else if (hasRole("freelancer")) {
      navigate("/freelancer/dashboard");
    } else {
      // Fallback for any other case
      navigate("/");
    }
  }, [user, hasRole, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div
        className="flex items-center gap-2"
        role="status"
        aria-live="polite"
        aria-label="Redirecting to your dashboard"
      >
        <Skeleton className="w-4 h-4 bg-primary rounded-full" aria-hidden="true" />
        <p className="text-lg text-gray-600">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
