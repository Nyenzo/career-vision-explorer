import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useInsights } from "@/hooks/use-insights-provider";

const InsightsManagement = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"market" | "industry" | "regional">("market");

  const {
    marketData,
    industryInsights,
    regionalData,
    updateMarketData,
    addMarketData,
    deleteMarketData,
    updateIndustryInsight,
    addIndustryInsight,
    deleteIndustryInsight,
    updateRegionalData,
    addRegionalData,
    deleteRegionalData,
  } = useInsights();

  const validateMarketData = (data: any): string | null => {
    if (!data.label?.trim()) return "Label is required";
    if (!data.type) return "Type is required";
    if (data.value === undefined || data.value < 0) return "Value must be a positive number";
    if (!data.change?.trim()) return "Change percentage is required";
    return null;
  };

  const validateIndustryData = (data: any): string | null => {
    if (!data.industry?.trim()) return "Industry name is required";
    if (!data.averageSalary?.trim()) return "Average salary is required";
    if (!data.growthRate?.trim()) return "Growth rate is required";
    return null;
  };

  const validateRegionalData = (data: any): string | null => {
    if (!data.region?.trim()) return "Region name is required";
    if (!data.averageSalary?.trim()) return "Average salary is required";
    if (!data.jobGrowth?.trim()) return "Job growth is required";
    return null;
  };

  const handleAddData = (data: any) => {
    if (activeTab === "market") {
      const validation = validateMarketData(data);
      if (validation) {
        toast.error(validation);
        return;
      }
      addMarketData(data);
      toast.success(`Market data "${data.label}" added successfully`);
    } else if (activeTab === "industry") {
      const validation = validateIndustryData(data);
      if (validation) {
        toast.error(validation);
        return;
      }
      addIndustryInsight(data);
      toast.success(`Industry data "${data.industry}" added successfully`);
    } else if (activeTab === "regional") {
      const validation = validateRegionalData(data);
      if (validation) {
        toast.error(validation);
        return;
      }
      addRegionalData(data);
      toast.success(`Regional data "${data.region}" added successfully`);
    }
    setShowAddDialog(false);
  };

  const handleEditData = (id: string, data: any) => {
    if (activeTab === "market") {
      const validation = validateMarketData(data);
      if (validation) {
        toast.error(validation);
        return;
      }
      updateMarketData(id, data);
      toast.success("Market data updated successfully");
    } else if (activeTab === "industry") {
      const validation = validateIndustryData(data);
      if (validation) {
        toast.error(validation);
        return;
      }
      updateIndustryInsight(id, data);
      toast.success("Industry data updated successfully");
    } else if (activeTab === "regional") {
      const validation = validateRegionalData(data);
      if (validation) {
        toast.error(validation);
        return;
      }
      updateRegionalData(id, data);
      toast.success("Regional data updated successfully");
    }
    setEditingItem(null);
  };

  const handleDeleteData = (id: string) => {
    if (activeTab === "market") {
      const item = marketData.find(item => item.id === id);
      if (item) {
        deleteMarketData(id);
        toast.success(`"${item.label}" deleted successfully`);
      }
    } else if (activeTab === "industry") {
      const item = industryInsights.find(item => item.id === id);
      if (item) {
        deleteIndustryInsight(id);
        toast.success(`"${item.industry}" deleted successfully`);
      }
    } else if (activeTab === "regional") {
      const item = regionalData.find(item => item.id === id);
      if (item) {
        deleteRegionalData(id);
        toast.success(`"${item.region}" deleted successfully`);
      }
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case "average_salary":
        return `$${value.toLocaleString()}`;
      case "remote_jobs":
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-600';
    if (change.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "average_salary":
        return <DollarSign className="h-4 w-4" />;
      case "remote_jobs":
        return <Users className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "market":
        return marketData;
      case "industry":
        return industryInsights;
      case "regional":
        return regionalData;
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "market":
        return "Market Data";
      case "industry":
        return "Industry Data";
      case "regional":
        return "Regional Data";
      default:
        return "Data";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Insights Management</h2>
          <p className="text-muted-foreground">
            Manage market data, industry insights, and regional analysis displayed on the public insights page
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add {getTabTitle()}
        </Button>
      </div>

      <div className="flex space-x-4">
        <Button 
          variant={activeTab === "market" ? "default" : "outline"}
          onClick={() => setActiveTab("market")}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Market Data ({marketData.length})
        </Button>
        <Button 
          variant={activeTab === "industry" ? "default" : "outline"}
          onClick={() => setActiveTab("industry")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Industry Data ({industryInsights.length})
        </Button>
        <Button 
          variant={activeTab === "regional" ? "default" : "outline"}
          onClick={() => setActiveTab("regional")}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Regional Data ({regionalData.length})
        </Button>
      </div>

      {activeTab === "market" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketData.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {getIcon(item.type)}
                  {item.label}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteData(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(item.type, item.value)}
                </div>
                <p className={`text-xs ${getChangeColor(item.change)}`}>
                  {item.change} from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "industry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {industryInsights.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {item.industry}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteData(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Growth Rate:</span>
                    <Badge className={`${item.growthRate.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.growthRate}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Avg Salary:</span>
                    <span className="font-semibold">{item.averageSalary}</span>
                  </div>
                  <div>
                    <span className="font-medium">Top Roles:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.topRoles.slice(0, 3).map((role, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {item.topRoles.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.topRoles.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "regional" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regionalData.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {item.region}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteData(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Job Growth:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {item.jobGrowth}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Avg Salary:</span>
                    <span className="font-semibold">{item.averageSalary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cost of Living:</span>
                    <span className="text-sm">{item.costOfLiving}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddDataDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddData}
        type={activeTab}
      />

      <EditDataDialog
        open={!!editingItem}
        onOpenChange={() => setEditingItem(null)}
        item={editingItem}
        onSave={handleEditData}
        type={activeTab}
      />
    </div>
  );
};

interface AddDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: any) => void;
  type: "market" | "industry" | "regional";
}

const AddDataDialog = ({ open, onOpenChange, onAdd, type }: AddDataDialogProps) => {
  const [formData, setFormData] = useState<any>({});
  const [newRole, setNewRole] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({});
    setNewRole("");
    setNewSkill("");
    setNewIndustry("");
  };

  const addRole = () => {
    if (newRole.trim() && !formData.topRoles?.includes(newRole.trim())) {
      setFormData({
        ...formData,
        topRoles: [...(formData.topRoles || []), newRole.trim()]
      });
      setNewRole("");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.topSkills?.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        topSkills: [...(formData.topSkills || []), newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !formData.topIndustries?.includes(newIndustry.trim())) {
      setFormData({
        ...formData,
        topIndustries: [...(formData.topIndustries || []), newIndustry.trim()]
      });
      setNewIndustry("");
    }
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      topRoles: formData.topRoles?.filter((r: string) => r !== role) || []
    });
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      topSkills: formData.topSkills?.filter((s: string) => s !== skill) || []
    });
  };

  const removeIndustry = (industry: string) => {
    setFormData({
      ...formData,
      topIndustries: formData.topIndustries?.filter((i: string) => i !== industry) || []
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add {type === "market" ? "Market" : type === "industry" ? "Industry" : "Regional"} Data
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "market" ? (
            <>
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label || ""}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Active Job Openings"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_openings">Job Openings</SelectItem>
                    <SelectItem value="average_salary">Average Salary</SelectItem>
                    <SelectItem value="remote_jobs">Remote Jobs %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  placeholder="e.g., 128432"
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="change">Change % *</Label>
                <Input
                  id="change"
                  value={formData.change || ""}
                  onChange={(e) => setFormData({ ...formData, change: e.target.value })}
                  placeholder="e.g., +15%"
                  required
                />
              </div>
            </>
          ) : type === "industry" ? (
            <>
              <div>
                <Label htmlFor="industry">Industry Name *</Label>
                <Input
                  id="industry"
                  value={formData.industry || ""}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology & Software"
                  required
                />
              </div>
              <div>
                <Label htmlFor="averageSalary">Average Salary *</Label>
                <Input
                  id="averageSalary"
                  value={formData.averageSalary || ""}
                  onChange={(e) => setFormData({ ...formData, averageSalary: e.target.value })}
                  placeholder="e.g., $115,000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="growthRate">Growth Rate *</Label>
                <Input
                  id="growthRate"
                  value={formData.growthRate || ""}
                  onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
                  placeholder="e.g., +18%"
                  required
                />
              </div>
              <div>
                <Label>Top Roles</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Add a role"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                  />
                  <Button type="button" onClick={addRole} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topRoles?.map((role: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {role}
                      <button type="button" onClick={() => removeRole(role)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Top Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topSkills?.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="region">Region Name *</Label>
                <Input
                  id="region"
                  value={formData.region || ""}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., Austin, TX"
                  required
                />
              </div>
              <div>
                <Label htmlFor="averageSalary">Average Salary *</Label>
                <Input
                  id="averageSalary"
                  value={formData.averageSalary || ""}
                  onChange={(e) => setFormData({ ...formData, averageSalary: e.target.value })}
                  placeholder="e.g., $95,000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="jobGrowth">Job Growth *</Label>
                <Input
                  id="jobGrowth"
                  value={formData.jobGrowth || ""}
                  onChange={(e) => setFormData({ ...formData, jobGrowth: e.target.value })}
                  placeholder="e.g., +15%"
                  required
                />
              </div>
              <div>
                <Label htmlFor="costOfLiving">Cost of Living *</Label>
                <Select
                  value={formData.costOfLiving || ""}
                  onValueChange={(value) => setFormData({ ...formData, costOfLiving: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cost of living" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Very Low">Very Low</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Top Industries</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="Add an industry"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                  />
                  <Button type="button" onClick={addIndustry} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topIndustries?.map((industry: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {industry}
                      <button type="button" onClick={() => removeIndustry(industry)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Data</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface EditDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onSave: (id: string, data: any) => void;
  type: "market" | "industry" | "regional";
}

const EditDataDialog = ({ open, onOpenChange, item, onSave, type }: EditDataDialogProps) => {
  const [formData, setFormData] = useState<any>({});
  const [newRole, setNewRole] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, formData);
  };

  React.useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  if (!item) return null;

  const addRole = () => {
    if (newRole.trim() && !formData.topRoles?.includes(newRole.trim())) {
      setFormData({
        ...formData,
        topRoles: [...(formData.topRoles || []), newRole.trim()]
      });
      setNewRole("");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.topSkills?.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        topSkills: [...(formData.topSkills || []), newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !formData.topIndustries?.includes(newIndustry.trim())) {
      setFormData({
        ...formData,
        topIndustries: [...(formData.topIndustries || []), newIndustry.trim()]
      });
      setNewIndustry("");
    }
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      topRoles: formData.topRoles?.filter((r: string) => r !== role) || []
    });
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      topSkills: formData.topSkills?.filter((s: string) => s !== skill) || []
    });
  };

  const removeIndustry = (industry: string) => {
    setFormData({
      ...formData,
      topIndustries: formData.topIndustries?.filter((i: string) => i !== industry) || []
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "market" ? (
            <>
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label || ""}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="change">Change % *</Label>
                <Input
                  id="change"
                  value={formData.change || ""}
                  onChange={(e) => setFormData({ ...formData, change: e.target.value })}
                  required
                />
              </div>
            </>
          ) : type === "industry" ? (
            <>
              <div>
                <Label htmlFor="industry">Industry Name *</Label>
                <Input
                  id="industry"
                  value={formData.industry || ""}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="averageSalary">Average Salary *</Label>
                <Input
                  id="averageSalary"
                  value={formData.averageSalary || ""}
                  onChange={(e) => setFormData({ ...formData, averageSalary: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="growthRate">Growth Rate *</Label>
                <Input
                  id="growthRate"
                  value={formData.growthRate || ""}
                  onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Top Roles</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Add a role"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                  />
                  <Button type="button" onClick={addRole} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topRoles?.map((role: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {role}
                      <button type="button" onClick={() => removeRole(role)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Top Skills</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topSkills?.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="region">Region Name *</Label>
                <Input
                  id="region"
                  value={formData.region || ""}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="averageSalary">Average Salary *</Label>
                <Input
                  id="averageSalary"
                  value={formData.averageSalary || ""}
                  onChange={(e) => setFormData({ ...formData, averageSalary: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="jobGrowth">Job Growth *</Label>
                <Input
                  id="jobGrowth"
                  value={formData.jobGrowth || ""}
                  onChange={(e) => setFormData({ ...formData, jobGrowth: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="costOfLiving">Cost of Living *</Label>
                <Select
                  value={formData.costOfLiving || ""}
                  onValueChange={(value) => setFormData({ ...formData, costOfLiving: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cost of living" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Very Low">Very Low</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Top Industries</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="Add an industry"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                  />
                  <Button type="button" onClick={addIndustry} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topIndustries?.map((industry: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {industry}
                      <button type="button" onClick={() => removeIndustry(industry)}>×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InsightsManagement;
