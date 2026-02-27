// src/components/founder-matching/VerificationFlow.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Shield,
} from "lucide-react";
import { CofounderProfile } from "@/services/founder-matching.service"; // Use CofounderProfile
import { cofounderMatchingService } from "@/services/founder-matching.service"; // Use cofounderMatchingService
import { toast } from "sonner";

interface VerificationFlowProps {
  profile: CofounderProfile | null;
  onUpdate: () => void;
}

// Add this interface for verification submission if needed
interface VerificationSubmission {
  additional_notes?: string;
  // Add other verification fields as needed
}

export const VerificationFlow: React.FC<VerificationFlowProps> = ({
  profile,
  onUpdate,
}) => {
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const verificationStatus = profile?.verification_status || "unverified";

  const getStatusInfo = () => {
    const statusMap = {
      verified: {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: "Verified Founder",
        description: "Your profile has been verified by our team",
        color: "bg-green-100 text-green-800",
        action: null,
      },
      pending: {
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        title: "Verification Pending",
        description: "Your verification request is under review",
        color: "bg-yellow-100 text-yellow-800",
        action: null,
      },
      rejected: {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        title: "Verification Rejected",
        description: "Please review the feedback and resubmit",
        color: "bg-red-100 text-red-800",
        action: "Resubmit",
      },
      unverified: {
        icon: <Shield className="h-5 w-5 text-gray-500" />,
        title: "Unverified Profile",
        description: "Submit your profile for verification",
        color: "bg-gray-100 text-gray-800",
        action: "Submit for Verification",
      },
    };

    return statusMap[verificationStatus as keyof typeof statusMap];
  };

  const handleSubmitVerification = async () => {
    try {
      setUploading(true);
      // Since the service doesn't have a submitVerification method, we'll update the profile
      await cofounderMatchingService.updateProfile({
        verification_status: "pending",
      });
      toast.success("Verification submitted successfully!");
      onUpdate();
    } catch (error) {
      toast.error("Failed to submit verification");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {statusInfo.icon}
              {statusInfo.title}
            </CardTitle>
            <Badge className={statusInfo.color}>
              {verificationStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{statusInfo.description}</p>

          {verificationStatus === "unverified" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Required Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm font-medium">LinkedIn Profile</div>
                    <div className="text-xs text-muted-foreground">
                      Ensure profile is public
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm font-medium">Portfolio</div>
                    <div className="text-xs text-muted-foreground">
                      GitHub, website, or projects
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm font-medium">Previous Work</div>
                    <div className="text-xs text-muted-foreground">
                      Case studies or references
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Additional Notes</h3>
                <Textarea
                  placeholder="Add any additional information that might help with verification..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmitVerification} disabled={uploading}>
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {verificationStatus === "rejected" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">
                  Feedback from Review
                </h4>
                <p className="text-sm text-red-700">
                  Please provide more detailed documentation about your
                  experience and skills.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmitVerification}>
                  <Upload className="h-4 w-4 mr-2" />
                  Resubmit for Verification
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
