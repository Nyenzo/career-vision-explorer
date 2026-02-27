import React from "react";
import Layout from "@/components/layout/Layout";
import { MatchDiscovery } from "@/components/founder-matching/MatchDiscovery";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FounderMatches = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/founder/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Find Co-Founders</h1>
                <p className="text-muted-foreground mt-1">
                  Discover potential co-founders who match your vision and
                  skills
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/founder/dashboard")}
            >
              My Founder Profile
            </Button>
          </div>

          {/* Match Discovery Component */}
          <MatchDiscovery />
        </div>
      </div>
    </Layout>
  );
};

export default FounderMatches;
