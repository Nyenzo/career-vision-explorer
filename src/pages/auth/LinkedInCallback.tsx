import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/sonner";
import { CallbackSkeleton } from "@/components/ui/skeleton-loaders";

let oauthCallbackStatus: "idle" | "processing" | "done" = "idle";

const LinkedInCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    if (
      oauthCallbackStatus === "processing" ||
      oauthCallbackStatus === "done"
    ) {
      return;
    }

    const handleCallback = async () => {
      oauthCallbackStatus = "processing";

      try {
        console.log("Starting OAuth callback handling");

        await handleOAuthCallback();
        oauthCallbackStatus = "done";
      } catch (error: any) {
        oauthCallbackStatus = "done";
        console.error("Callback handling failed:", error);
        toast.error("Authentication failed", {
          description:
            error.message || "Failed to complete sign in. Please try again.",
        });
        navigate("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [navigate, handleOAuthCallback]);

  return <CallbackSkeleton />;
};

export default LinkedInCallback;
