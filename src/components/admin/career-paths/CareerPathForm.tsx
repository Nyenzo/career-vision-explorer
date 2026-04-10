import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, GripVertical } from "lucide-react";
import { CareerPath, CareerStep } from "@/hooks/use-career-paths";

interface CareerPathFormProps {
  careerPath?: CareerPath;
  onSubmit: (data: Omit<CareerPath, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const CareerPathForm = ({ careerPath, onSubmit, onCancel }: CareerPathFormProps) => {
  const [formData, setFormData] = useState({
    title: careerPath?.title || '',
    description: careerPath?.description || '',
    category: careerPath?.category || '',
    difficulty: careerPath?.difficulty || 'Beginner' as const,
    estimatedDuration: careerPath?.estimatedDuration || '',
    isActive: careerPath?.isActive ?? true,
    tags: careerPath?.tags || [],
    steps: careerPath?.steps || []
  });
  
  const [newTag, setNewTag] = useState('');
  const [newStep, setNewStep] = useState<Partial<CareerStep>>({
    title: '',
    description: '',
    requiredSkills: [],
    estimatedDuration: ''
  });
  const [newSkill, setNewSkill] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSkillToStep = () => {
    if (newSkill.trim() && !newStep.requiredSkills?.includes(newSkill.trim())) {
      setNewStep(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkillFromStep = (skillToRemove: string) => {
    setNewStep(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const handleAddStep = () => {
    if (newStep.title && newStep.description) {
      const step: CareerStep = {
        id: Date.now().toString(),
        title: newStep.title,
        description: newStep.description,
        requiredSkills: newStep.requiredSkills || [],
        estimatedDuration: newStep.estimatedDuration || '',
        order: formData.steps.length + 1
      };
      
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, step]
      }));
      
      setNewStep({
        title: '',
        description: '',
        requiredSkills: [],
        estimatedDuration: ''
      });
    }
  };

  const handleRemoveStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
            setFormData(prev => ({ ...prev, difficulty: value }))
          }>
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
          <Label htmlFor="estimatedDuration">Estimated Duration</Label>
          <Input
            id="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
            placeholder="e.g., 6 months"
            required
          />
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag}>Add</Button>
        </div>
      </div>

      {/* Steps Section */}
      <div className="space-y-4">
        <Label>Career Steps</Label>
        
        {/* Existing Steps */}
        {formData.steps.map((step, index) => (
          <Card key={step.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Step {index + 1}: {step.title}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStep(step.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {step.requiredSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Duration: {step.estimatedDuration}</p>
            </CardContent>
          </Card>
        ))}

        {/* Add New Step */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Step</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={newStep.title || ''}
                onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Step title"
              />
              <Input
                value={newStep.estimatedDuration || ''}
                onChange={(e) => setNewStep(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                placeholder="Duration (e.g., 4 weeks)"
              />
            </div>
            <Textarea
              value={newStep.description || ''}
              onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Step description"
            />
            
            {/* Required Skills */}
            <div className="space-y-2">
              <Label className="text-xs">Required Skills</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {newStep.requiredSkills?.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkillFromStep(skill)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add required skill"
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkillToStep())}
                />
                <Button type="button" size="sm" onClick={handleAddSkillToStep}>Add</Button>
              </div>
            </div>
            
            <Button type="button" onClick={handleAddStep} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {careerPath ? 'Update' : 'Create'} Career Path
        </Button>
      </div>
    </form>
  );
};
