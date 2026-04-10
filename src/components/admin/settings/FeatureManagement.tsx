
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeatures, FeatureFlags } from "@/hooks/use-features";
import { useToast } from "@/hooks/use-toast";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";

interface FeatureConfig {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  category: "Core Features" | "User Features" | "Content Features";
  impact: "High" | "Medium" | "Low";
}

const featureConfigs: FeatureConfig[] = [
  {
    key: "jobMatching",
    label: "AI Job Matching",
    description: "Enable AI-powered job matching and recommendations",
    category: "Core Features",
    impact: "High"
  },
  {
    key: "skillsAssessment",
    label: "Skills Assessment",
    description: "Allow users to take skills assessments and get readiness scores",
    category: "Core Features",
    impact: "High"
  },
  {
    key: "microlearning",
    label: "Microlearning Paths",
    description: "Provide personalized learning recommendations",
    category: "Core Features",
    impact: "Medium"
  },
  {
    key: "aiInterviewPractice",
    label: "AI Interview Practice",
    description: "Enable AI-powered interview coaching and feedback",
    category: "Core Features",
    impact: "Medium"
  },
  {
    key: "careerPaths",
    label: "Career Path Visualization",
    description: "Show career progression paths and roadmaps",
    category: "Core Features",
    impact: "Medium"
  },
  {
    key: "userRegistration",
    label: "User Registration",
    description: "Allow new users to register and create accounts",
    category: "User Features",
    impact: "High"
  },
  {
    key: "profileCreation",
    label: "Profile Creation",
    description: "Enable users to create and manage their profiles",
    category: "User Features",
    impact: "High"
  },
  {
    key: "applicationTracking",
    label: "Application Tracking",
    description: "Allow users to track their job applications",
    category: "User Features",
    impact: "Medium"
  },
  {
    key: "testimonials",
    label: "Testimonials Section",
    description: "Display user testimonials on the homepage",
    category: "Content Features",
    impact: "Low"
  },
  {
    key: "partnerShowcase",
    label: "Partner Showcase",
    description: "Show partner companies and logos",
    category: "Content Features",
    impact: "Low"
  },
  {
    key: "blogSection",
    label: "Blog Section",
    description: "Enable the blog and career insights content",
    category: "Content Features",
    impact: "Low"
  },
  {
    key: "ctaSection",
    label: "Call-to-Action Section",
    description: "Show the main CTA section on the homepage",
    category: "Content Features",
    impact: "Medium"
  }
];

export const FeatureManagement = () => {
  const { features, updateFeature, updateFeatures } = useFeatures();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [localFeatures, setLocalFeatures] = useState(features);

  const handleFeatureToggle = (featureKey: keyof FeatureFlags, enabled: boolean) => {
    setLocalFeatures(prev => ({ ...prev, [featureKey]: enabled }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateFeatures(localFeatures);
    setHasChanges(false);
    toast({
      title: "Features Updated",
      description: "Feature settings have been saved successfully",
    });
  };

  const handleReset = () => {
    setLocalFeatures(features);
    setHasChanges(false);
  };

  const enabledCount = Object.values(localFeatures).filter(Boolean).length;
  const totalCount = Object.keys(localFeatures).length;

  const groupedFeatures = featureConfigs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, FeatureConfig[]>);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Feature Management</h3>
          <p className="text-sm text-muted-foreground">
            Control which features are enabled across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {enabledCount}/{totalCount} enabled
          </Badge>
          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {Object.entries(groupedFeatures).map(([category, configs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
            <CardDescription>
              Manage {category.toLowerCase()} settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.key} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{config.label}</span>
                      <Badge className={getImpactColor(config.impact)} variant="secondary">
                        {config.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {localFeatures[config.key] ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                    <Switch
                      checked={localFeatures[config.key]}
                      onCheckedChange={(checked) => handleFeatureToggle(config.key, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
