
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatItem } from "@/types/about-content";
import { iconOptions, getIconComponent } from "@/utils/icon-utils";

interface StatsSectionProps {
  stats: StatItem[];
  setStats: (stats: StatItem[]) => void;
}

export const StatsSection = ({ stats, setStats }: StatsSectionProps) => {
  const { toast } = useToast();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingStats, setEditingStats] = useState<StatItem[]>(stats);

  const handleEdit = () => {
    setEditingStats([...stats]);
    setEditingSection("stats");
  };

  const handleCancel = () => {
    setEditingStats([...stats]);
    setEditingSection(null);
  };

  const handleSave = () => {
    setStats(editingStats);
    toast({
      title: "Success",
      description: "Statistics updated successfully",
    });
    setEditingSection(null);
  };

  const handleAddStat = () => {
    setEditingStats([...editingStats, { number: "", label: "", icon: "Users" }]);
  };

  const handleRemoveStat = (index: number) => {
    setEditingStats(editingStats.filter((_, i) => i !== index));
  };

  const handleStatChange = (index: number, field: keyof StatItem, value: string) => {
    setEditingStats(prev => prev.map((stat, i) => 
      i === index ? { ...stat, [field]: value } : stat
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Statistics Section</CardTitle>
          <p className="text-sm text-muted-foreground">Key company metrics and numbers</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editingSection === "stats" ? handleCancel() : handleEdit()}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {editingSection === "stats" ? "Cancel" : "Edit"}
        </Button>
      </CardHeader>
      <CardContent>
        {editingSection === "stats" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Edit Statistics</h4>
              <Button onClick={handleAddStat} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Stat
              </Button>
            </div>
            
            <div className="space-y-4">
              {editingStats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor={`stat-number-${index}`}>Number</Label>
                      <Input
                        id={`stat-number-${index}`}
                        value={stat.number}
                        onChange={(e) => handleStatChange(index, "number", e.target.value)}
                        placeholder="e.g., 10K+"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stat-label-${index}`}>Label</Label>
                      <Input
                        id={`stat-label-${index}`}
                        value={stat.label}
                        onChange={(e) => handleStatChange(index, "label", e.target.value)}
                        placeholder="e.g., Job Seekers"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stat-icon-${index}`}>Icon</Label>
                      <Select
                        value={stat.icon}
                        onValueChange={(value) => handleStatChange(index, "icon", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveStat(index)}
                        disabled={editingStats.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => {
              const IconComponent = getIconComponent(stat.icon);
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
