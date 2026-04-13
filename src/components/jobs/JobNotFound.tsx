
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const JobNotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackPath = location.pathname.startsWith("/employer/")
    ? "/employer/jobs"
    : "/jobseeker/jobs";

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto space-y-8">
          <div className="career-card p-8">
            <h1 className="text-3xl font-bold mb-4 text-destructive">
              Job Not Found
            </h1>
            <p className="text-muted-foreground mb-8">The job you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate(fallbackPath)}
              className="modern-btn-primary"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
