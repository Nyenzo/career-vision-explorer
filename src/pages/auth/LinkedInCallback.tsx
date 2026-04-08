import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/sonner";
import { CallbackSkeleton } from "@/components/ui/skeleton-loaders";

let linkedInCallbackStatus: "idle" | "processing" | "done" = "idle";

const LinkedInCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    if (linkedInCallbackStatus === "processing" || linkedInCallbackStatus === "done") {
      return;
    }

    const handleCallback = async () => {
      linkedInCallbackStatus = "processing";

      try {
        console.log("🔍 LinkedInCallback: Starting callback handling");

        await handleOAuthCallback();
        linkedInCallbackStatus = "done";
      } catch (error: any) {
        linkedInCallbackStatus = "idle";
        console.error("Callback handling failed:", error);
        toast.error("Authentication failed", {
          description:
            error.message ||
            "Failed to complete LinkedIn login. Please try again.",
        });
        navigate("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [navigate, handleOAuthCallback]);

  return <CallbackSkeleton />;
};

export default LinkedInCallback;
