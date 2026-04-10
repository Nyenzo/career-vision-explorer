
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeatureFlags } from "@/hooks/use-features";
import { User } from "@/hooks/use-users";

interface FeatureConfig {
  key: keyof FeatureFlags;
  label: string;
  description: string;
  category: "Core Features" | "User Features" | "Content Features";
}

const featureConfigs: FeatureConfig[] = [
  {
    key: "jobMatching",
    label: "AI Job Matching",
    description: "Access to job matching and recommendations",
    category: "Core Features"
  },
  {
    key: "skillsAssessment",
    label: "Skills Assessment",
    description: "Manage skills assessments and readiness scores",
    category: "Core Features"
  },
  {
    key: "microlearning",
    label: "Microlearning Paths",
    description: "Manage learning recommendations",
    category: "Core Features"
  },
  {
    key: "aiInterviewPractice",
    label: "AI Interview Practice",
    description: "Manage interview coaching features",
    category: "Core Features"
  },
  {
    key: "careerPaths",
    label: "Career Path Management",
    description: "Manage career progression paths",
    category: "Core Features"
  },
  {
    key: "userRegistration",
    label: "User Registration",
    description: "Manage user registration settings",
    category: "User Features"
  },
  {
    key: "profileCreation",
    label: "Profile Management",
    description: "Manage user profiles and settings",
    category: "User Features"
  },
  {
    key: "applicationTracking",
    label: "Application Tracking",
    description: "Manage job application tracking",
    category: "User Features"
  },
  {
    key: "testimonials",
    label: "Testimonials Management",
    description: "Manage testimonials content",
    category: "Content Features"
  },
  {
    key: "partnerShowcase",
    label: "Partner Management",
    description: "Manage partner companies and logos",
    category: "Content Features"
  },
  {
    key: "blogSection",
    label: "Blog Management",
    description: "Manage blog and career insights content",
    category: "Content Features"
  },
  {
    key: "ctaSection",
    label: "CTA Management",
    description: "Manage call-to-action sections",
    category: "Content Features"
  }
];

interface SubAdminPermissionsProps {
  user: User;
  onPermissionsChange: (permissions: Partial<FeatureFlags>) => void;
}

export const SubAdminPermissions = ({ user, onPermissionsChange }: SubAdminPermissionsProps) => {
  const [localPermissions, setLocalPermissions] = useState<Partial<FeatureFlags>>(
    user.permissions || {}
  );

  // Sync local permissions when user changes
  useEffect(() => {
    setLocalPermissions(user.permissions || {});
  }, [user]);

  const handlePermissionToggle = (featureKey: keyof FeatureFlags, enabled: boolean) => {
    const newPermissions = { ...localPermissions, [featureKey]: enabled };
    setLocalPermissions(newPermissions);
    onPermissionsChange(newPermissions);
  };

  const enabledCount = Object.values(localPermissions).filter(Boolean).length;
  const totalCount = featureConfigs.length;

  const groupedFeatures = featureConfigs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, FeatureConfig[]>);

  const handleSelectAll = () => {
    const allEnabled = featureConfigs.reduce((acc, config) => {
      acc[config.key] = true;
      return acc;
    }, {} as Partial<FeatureFlags>);
    setLocalPermissions(allEnabled);
    onPermissionsChange(allEnabled);
  };

  const handleSelectNone = () => {
    const allDisabled = featureConfigs.reduce((acc, config) => {
      acc[config.key] = false;
      return acc;
    }, {} as Partial<FeatureFlags>);
    setLocalPermissions(allDisabled);
    onPermissionsChange(allDisabled);
  };

  if (user.role !== "subadmin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SubAdmin Permissions</h3>
          <p className="text-sm text-muted-foreground">
            Configure which features this subadmin can access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {enabledCount}/{totalCount} enabled
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSelectNone}>
            Select None
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
        </div>
      </div>

      {Object.entries(groupedFeatures).map(([category, configs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
            <CardDescription>
              Manage access to {category.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configs.map((config) => (
                <div key={config.key} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                  <Switch
                    checked={localPermissions[config.key] || false}
                    onCheckedChange={(checked) => handlePermissionToggle(config.key, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
