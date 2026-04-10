import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, Edit, Upload } from "lucide-react";
import { FreelancerProfile, PortfolioItem, PricingTier } from "@/types/freelancer";
import { useFreelancers } from "@/hooks/use-freelancers";
import { toast } from "@/components/ui/sonner";

interface FreelancerFormDialogProps {
  freelancer?: FreelancerProfile;
  mode: 'create' | 'edit';
  trigger?: React.ReactNode;
}

export const FreelancerFormDialog = ({ freelancer, mode, trigger }: FreelancerFormDialogProps) => {
  const { createFreelancer, updateFreelancer } = useFreelancers();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: freelancer?.name || "",
    email: freelancer?.email || "",
    title: freelancer?.title || "",
    description: freelancer?.description || "",
    profileImage: freelancer?.profileImage || "",
    location: freelancer?.location || "",
    hourlyRate: freelancer?.hourlyRate || 0,
    rating: freelancer?.rating || 5.0,
    completedProjects: freelancer?.completedProjects || 0,
    isActive: freelancer?.isActive ?? true,
  });

  const [skills, setSkills] = useState<string[]>(freelancer?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(freelancer?.portfolio || []);
  const [pricing, setPricing] = useState<PricingTier[]>(
    freelancer?.pricing || [
      { id: "1", tier: "basic", title: "Basic Package", description: "", price: 50, deliveryDays: 3, revisions: 1, features: [] },
      { id: "2", tier: "standard", title: "Standard Package", description: "", price: 100, deliveryDays: 5, revisions: 3, features: [] },
      { id: "3", tier: "premium", title: "Premium Package", description: "", price: 200, deliveryDays: 7, revisions: 5, features: [] }
    ]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const freelancerData = {
        ...formData,
        userId: freelancer?.userId || `user_${Date.now()}`,
        skills,
        portfolio,
        pricing,
        joinDate: freelancer?.joinDate || new Date().toISOString(),
      };

      let success = false;
      if (mode === 'create') {
        success = await createFreelancer(freelancerData);
      } else if (freelancer?.id) {
        success = await updateFreelancer(freelancer.id, freelancerData);
      }

      if (success) {
        setOpen(false);
        toast.success(`Freelancer ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      }
    } catch (error) {
      toast.error(`Failed to ${mode} freelancer`);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addPortfolioItem = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: "New Project",
      description: "Project description",
      image: "https://picsum.photos/400/300",
      tags: [],
      createdAt: new Date().toISOString()
    };
    setPortfolio([...portfolio, newItem]);
  };

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string) => {
    const updated = [...portfolio];
    if (field === 'tags') {
      updated[index] = { ...updated[index], [field]: value.split(',').map(t => t.trim()) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPortfolio(updated);
  };

  const removePortfolioItem = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const updatePricingTier = (index: number, field: keyof PricingTier, value: any) => {
    const updated = [...pricing];
    if (field === 'features') {
      updated[index] = { ...updated[index], [field]: value.split(',').map((f: string) => f.trim()) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPricing(updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {mode === 'create' ? <Plus className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {mode === 'create' ? 'Add Freelancer' : 'Edit Freelancer'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Freelancer' : 'Edit Freelancer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Professional Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., UI/UX Designer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Professional description and bio..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="completedProjects">Completed Projects</Label>
                  <Input
                    id="completedProjects"
                    type="number"
                    value={formData.completedProjects}
                    onChange={(e) => setFormData({ ...formData, completedProjects: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="profileImage"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.profileImage && (
                  <Avatar className="h-16 w-16 mt-2">
                    <AvatarImage src={formData.profileImage} />
                    <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Portfolio</CardTitle>
              <Button type="button" variant="outline" onClick={addPortfolioItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolio.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePortfolioItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={item.title}
                      onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                      placeholder="Project title"
                    />
                    <Input
                      value={item.image}
                      onChange={(e) => updatePortfolioItem(index, 'image', e.target.value)}
                      placeholder="Image URL"
                    />
                  </div>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                    placeholder="Project description"
                    rows={2}
                  />
                  <Input
                    value={item.tags.join(', ')}
                    onChange={(e) => updatePortfolioItem(index, 'tags', e.target.value)}
                    placeholder="Tags (comma separated)"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricing.map((tier, index) => (
                <div key={tier.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="capitalize">{tier.tier}</Badge>
                    <h4 className="font-medium">{tier.tier} Package</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={tier.title}
                      onChange={(e) => updatePricingTier(index, 'title', e.target.value)}
                      placeholder="Package title"
                    />
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updatePricingTier(index, 'price', Number(e.target.value))}
                      placeholder="Price"
                    />
                  </div>
                  <Textarea
                    value={tier.description}
                    onChange={(e) => updatePricingTier(index, 'description', e.target.value)}
                    placeholder="Package description"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      value={tier.deliveryDays}
                      onChange={(e) => updatePricingTier(index, 'deliveryDays', Number(e.target.value))}
                      placeholder="Delivery days"
                    />
                    <Input
                      type="number"
                      value={tier.revisions}
                      onChange={(e) => updatePricingTier(index, 'revisions', Number(e.target.value))}
                      placeholder="Revisions included"
                    />
                  </div>
                  <Input
                    value={tier.features.join(', ')}
                    onChange={(e) => updatePricingTier(index, 'features', e.target.value)}
                    placeholder="Features (comma separated)"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Freelancer' : 'Update Freelancer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};