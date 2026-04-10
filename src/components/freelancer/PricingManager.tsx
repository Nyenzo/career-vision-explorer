import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DollarSign, Package, Plus, Save, Trash2, Star } from "lucide-react";
import { FreelancerPricingPackage } from "@/types/freelancer";

interface PricingManagerProps {
  currentHourlyRate?: number;
  currentPricing?: {
    basic_package?: FreelancerPricingPackage;
    standard_package?: FreelancerPricingPackage;
    premium_package?: FreelancerPricingPackage;
  };
  onSave: (data: any) => Promise<void>;
}

export const PricingManager = ({ currentHourlyRate, currentPricing, onSave }: PricingManagerProps) => {
  const [hourlyRate, setHourlyRate] = useState(currentHourlyRate || 0);
  const [enablePackages, setEnablePackages] = useState(!!currentPricing);
  const [packages, setPackages] = useState({
    basic: currentPricing?.basic_package || {
      name: "Basic",
      price: 50,
      description: "Perfect for small projects",
      features: ["1 concept", "2 revisions", "Source files"],
      delivery_days: 3,
      revisions: 2
    },
    standard: currentPricing?.standard_package || {
      name: "Standard",
      price: 150,
      description: "Great for most projects",
      features: ["3 concepts", "5 revisions", "Source files", "Basic support"],
      delivery_days: 7,
      revisions: 5
    },
    premium: currentPricing?.premium_package || {
      name: "Premium",
      price: 300,
      description: "Comprehensive solution",
      features: ["Unlimited concepts", "Unlimited revisions", "Source files", "Priority support", "Future updates"],
      delivery_days: 14,
      revisions: -1 // -1 for unlimited
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePackageUpdate = (packageType: 'basic' | 'standard' | 'premium', field: string, value: any) => {
    setPackages(prev => ({
      ...prev,
      [packageType]: {
        ...prev[packageType],
        [field]: value
      }
    }));
  };

  const handleFeatureUpdate = (packageType: 'basic' | 'standard' | 'premium', index: number, value: string) => {
    setPackages(prev => ({
      ...prev,
      [packageType]: {
        ...prev[packageType],
        features: prev[packageType].features.map((f, i) => i === index ? value : f)
      }
    }));
  };

  const addFeature = (packageType: 'basic' | 'standard' | 'premium') => {
    setPackages(prev => ({
      ...prev,
      [packageType]: {
        ...prev[packageType],
        features: [...prev[packageType].features, ""]
      }
    }));
  };

  const removeFeature = (packageType: 'basic' | 'standard' | 'premium', index: number) => {
    setPackages(prev => ({
      ...prev,
      [packageType]: {
        ...prev[packageType],
        features: prev[packageType].features.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const pricingData = {
        hourly_rate: hourlyRate,
        pricing: enablePackages ? {
          basic_package: packages.basic,
          standard_package: packages.standard,
          premium_package: packages.premium
        } : null
      };

      await onSave(pricingData);
      toast.success("Pricing updated successfully!");
    } catch (error) {
      toast.error("Failed to update pricing");
    } finally {
      setIsLoading(false);
    }
  };

  const PackageEditor = ({ type, label }: { type: 'basic' | 'standard' | 'premium', label: string }) => {
    const pkg = packages[type];
    const isPopular = type === 'standard';

    return (
      <Card className={isPopular ? "border-blue-500 relative" : ""}>
        {isPopular && (
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
            <Star className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        )}
        <CardHeader>
          <CardTitle className="text-lg">{label} Package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Package Name</Label>
            <Input
              value={pkg.name}
              onChange={(e) => handlePackageUpdate(type, 'name', e.target.value)}
              placeholder="e.g., Basic, Standard, Premium"
            />
          </div>

          <div>
            <Label>Price ($)</Label>
            <Input
              type="number"
              value={pkg.price}
              onChange={(e) => handlePackageUpdate(type, 'price', parseInt(e.target.value) || 0)}
              placeholder="50"
              min="1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={pkg.description}
              onChange={(e) => handlePackageUpdate(type, 'description', e.target.value)}
              placeholder="Describe what's included in this package"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Delivery Days</Label>
              <Input
                type="number"
                value={pkg.delivery_days}
                onChange={(e) => handlePackageUpdate(type, 'delivery_days', parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            <div>
              <Label>Revisions</Label>
              <Input
                type="number"
                value={pkg.revisions === -1 ? '' : pkg.revisions}
                onChange={(e) => handlePackageUpdate(type, 'revisions', e.target.value === '' ? -1 : parseInt(e.target.value) || 0)}
                placeholder="Unlimited"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label>Features</Label>
            <div className="space-y-2 mt-2">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureUpdate(type, index, e.target.value)}
                    placeholder="Feature description"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(type, index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addFeature(type)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Settings</CardTitle>
          <CardDescription>
            Set your hourly rate and create service packages to attract more clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hourly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hourly">
                <DollarSign className="w-4 h-4 mr-2" />
                Hourly Rate
              </TabsTrigger>
              <TabsTrigger value="packages">
                <Package className="w-4 h-4 mr-2" />
                Service Packages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hourly" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Hourly Rate (USD)</Label>
                  <div className="mt-2 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                      className="pl-10"
                      placeholder="50"
                      min="0"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This rate will be displayed on your profile for hourly projects
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Pricing Tips
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Research market rates for your skill level</li>
                    <li>• Consider your experience and expertise</li>
                    <li>• Factor in your location and target clients</li>
                    <li>• You can always adjust your rate later</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="packages" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Enable Service Packages</h3>
                  <p className="text-sm text-muted-foreground">
                    Offer fixed-price packages for common services
                  </p>
                </div>
                <Switch
                  checked={enablePackages}
                  onCheckedChange={setEnablePackages}
                />
              </div>

              {enablePackages && (
                <div className="grid gap-6 md:grid-cols-3">
                  <PackageEditor type="basic" label="Basic" />
                  <PackageEditor type="standard" label="Standard" />
                  <PackageEditor type="premium" label="Premium" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Pricing"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
