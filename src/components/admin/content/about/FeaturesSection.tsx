
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/about-content";
import { iconOptions, getIconComponent } from "@/utils/icon-utils";

interface FeaturesSectionProps {
  features: Feature[];
  setFeatures: (features: Feature[]) => void;
}

export const FeaturesSection = ({ features, setFeatures }: FeaturesSectionProps) => {
  const { toast } = useToast();
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [editingFeatureData, setEditingFeatureData] = useState<Feature | null>(null);

  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: `new-${Date.now()}`,
      title: "",
      description: "",
      icon: "Target"
    };
    setFeatures([...features, newFeature]);
    setEditingFeature(newFeature.id);
    setEditingFeatureData(newFeature);
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature.id);
    setEditingFeatureData({ ...feature });
  };

  const handleSaveFeature = () => {
    if (!editingFeatureData || !editingFeatureData.title.trim() || !editingFeatureData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setFeatures(features.map(f => 
      f.id === editingFeatureData.id ? editingFeatureData : f
    ));
    
    setEditingFeature(null);
    setEditingFeatureData(null);
    
    toast({
      title: "Success",
      description: "Feature saved successfully",
    });
  };

  const handleCancelEditFeature = () => {
    if (editingFeatureData?.id.startsWith('new-')) {
      setFeatures(features.filter(f => f.id !== editingFeatureData.id));
    }
    setEditingFeature(null);
    setEditingFeatureData(null);
  };

  const handleDeleteFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
    if (editingFeature === id) {
      setEditingFeature(null);
      setEditingFeatureData(null);
    }
    toast({
      title: "Feature deleted",
      description: "Feature has been removed successfully",
    });
  };

  const updateEditingFeatureData = (field: keyof Feature, value: string) => {
    if (editingFeatureData) {
      setEditingFeatureData({
        ...editingFeatureData,
        [field]: value
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Features Section</CardTitle>
          <p className="text-sm text-muted-foreground">Platform features and capabilities</p>
        </div>
        <Button onClick={handleAddFeature} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {features.map((feature) => {
            const IconComponent = getIconComponent(feature.icon);
            const isEditing = editingFeature === feature.id;
            
            return (
              <Card key={feature.id} className="p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Edit Feature</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEditFeature}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor={`feature-title-${feature.id}`}>Title</Label>
                        <Input
                          id={`feature-title-${feature.id}`}
                          value={editingFeatureData?.title || ""}
                          onChange={(e) => updateEditingFeatureData("title", e.target.value)}
                          placeholder="Feature title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`feature-description-${feature.id}`}>Description</Label>
                        <Textarea
                          id={`feature-description-${feature.id}`}
                          value={editingFeatureData?.description || ""}
                          onChange={(e) => updateEditingFeatureData("description", e.target.value)}
                          placeholder="Feature description"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`feature-icon-${feature.id}`}>Icon</Label>
                        <Select
                          value={editingFeatureData?.icon || "Target"}
                          onValueChange={(value) => updateEditingFeatureData("icon", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => {
                              const OptionIcon = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <OptionIcon className="h-4 w-4" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSaveFeature} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Feature
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEditFeature}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{feature.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFeature(feature)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFeature(feature.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
