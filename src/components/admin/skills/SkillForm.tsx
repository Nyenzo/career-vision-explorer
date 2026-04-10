
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useAdminSkills, Skill } from "@/hooks/use-admin-skills";

interface SkillFormProps {
  skill?: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SkillForm = ({ skill, open, onOpenChange }: SkillFormProps) => {
  const { addSkill, updateSkill, categories } = useAdminSkills();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    isActive: true,
    isVerified: false,
    prerequisites: [] as string[],
    learningResources: [] as string[],
    assessmentCriteria: [] as string[],
    industryDemand: "Medium" as "Low" | "Medium" | "High",
    averageSalaryImpact: 0
  });

  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newResource, setNewResource] = useState("");
  const [newCriteria, setNewCriteria] = useState("");

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name,
        category: skill.category,
        description: skill.description,
        level: skill.level,
        isActive: skill.isActive,
        isVerified: skill.isVerified,
        prerequisites: skill.prerequisites,
        learningResources: skill.learningResources,
        assessmentCriteria: skill.assessmentCriteria,
        industryDemand: skill.industryDemand,
        averageSalaryImpact: skill.averageSalaryImpact
      });
    } else {
      setFormData({
        name: "",
        category: "",
        description: "",
        level: "Beginner",
        isActive: true,
        isVerified: false,
        prerequisites: [],
        learningResources: [],
        assessmentCriteria: [],
        industryDemand: "Medium",
        averageSalaryImpact: 0
      });
    }
  }, [skill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skill) {
      updateSkill(skill.id, formData);
    } else {
      addSkill(formData);
    }
    
    onOpenChange(false);
  };

  const addToArray = (array: string[], newItem: string, setter: (items: string[]) => void) => {
    if (newItem.trim() && !array.includes(newItem.trim())) {
      setter([...array, newItem.trim()]);
    }
  };

  const removeFromArray = (array: string[], item: string, setter: (items: string[]) => void) => {
    setter(array.filter(i => i !== item));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {skill ? 'Edit Skill' : 'Add New Skill'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value: "Beginner" | "Intermediate" | "Advanced") => setFormData(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demand">Industry Demand</Label>
              <Select 
                value={formData.industryDemand} 
                onValueChange={(value: "Low" | "Medium" | "High") => setFormData(prev => ({ ...prev, industryDemand: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryImpact">Average Salary Impact (%)</Label>
            <Input
              id="salaryImpact"
              type="number"
              value={formData.averageSalaryImpact}
              onChange={(e) => setFormData(prev => ({ ...prev, averageSalaryImpact: parseInt(e.target.value) || 0 }))}
              min="0"
              max="100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
              />
              <Label htmlFor="isVerified">Verified</Label>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-2">
            <Label>Prerequisites</Label>
            <div className="flex space-x-2">
              <Input
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                placeholder="Add prerequisite"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(formData.prerequisites, newPrerequisite, 
                      (items) => setFormData(prev => ({ ...prev, prerequisites: items })));
                    setNewPrerequisite("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  addToArray(formData.prerequisites, newPrerequisite, 
                    (items) => setFormData(prev => ({ ...prev, prerequisites: items })));
                  setNewPrerequisite("");
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {prereq}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray(formData.prerequisites, prereq,
                      (items) => setFormData(prev => ({ ...prev, prerequisites: items })))}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Learning Resources */}
          <div className="space-y-2">
            <Label>Learning Resources</Label>
            <div className="flex space-x-2">
              <Input
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="Add learning resource"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(formData.learningResources, newResource,
                      (items) => setFormData(prev => ({ ...prev, learningResources: items })));
                    setNewResource("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  addToArray(formData.learningResources, newResource,
                    (items) => setFormData(prev => ({ ...prev, learningResources: items })));
                  setNewResource("");
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.learningResources.map((resource, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {resource}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray(formData.learningResources, resource,
                      (items) => setFormData(prev => ({ ...prev, learningResources: items })))}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Assessment Criteria */}
          <div className="space-y-2">
            <Label>Assessment Criteria</Label>
            <div className="flex space-x-2">
              <Input
                value={newCriteria}
                onChange={(e) => setNewCriteria(e.target.value)}
                placeholder="Add assessment criteria"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(formData.assessmentCriteria, newCriteria,
                      (items) => setFormData(prev => ({ ...prev, assessmentCriteria: items })));
                    setNewCriteria("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  addToArray(formData.assessmentCriteria, newCriteria,
                    (items) => setFormData(prev => ({ ...prev, assessmentCriteria: items })));
                  setNewCriteria("");
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.assessmentCriteria.map((criteria, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {criteria}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray(formData.assessmentCriteria, criteria,
                      (items) => setFormData(prev => ({ ...prev, assessmentCriteria: items })))}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {skill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
