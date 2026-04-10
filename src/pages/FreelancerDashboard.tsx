
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useFreelancers } from "@/hooks/use-freelancers";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, DollarSign, Star, Users, Briefcase } from "lucide-react";
import { QuickStatsCards } from "@/components/jobseeker/dashboard/QuickStatsCards";
import { DashboardTabs } from "@/components/jobseeker/dashboard/DashboardTabs";
import { DashboardBackground } from "@/components/jobseeker/dashboard/DashboardBackground";
import { DashboardHeader } from "@/components/jobseeker/dashboard/DashboardHeader";
import { ApplicationDetailsDialog } from "@/components/jobseeker/ApplicationDetailsDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { PortfolioItem, PricingTier } from "@/types/freelancer";

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const { freelancers, getFreelancerById, addPortfolioItem, addPricingTier } = useFreelancers();
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  
  // Portfolio form state
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    image: "",
    tags: ""
  });
  
  // Pricing form state
  const [pricingForm, setPricingForm] = useState({
    tier: "basic" as "basic" | "standard" | "premium",
    title: "",
    price: "",
    description: "",
    deliveryDays: "",
    revisions: "",
    features: ""
  });

  // Get current user's freelancer profile
  const freelancerProfile = freelancers.find(f => f.userId === user?.id);

  const stats = [
    {
      title: "Total Earnings",
      value: "$2,450",
      icon: DollarSign,
      change: "+12%"
    },
    {
      title: "Active Projects",
      value: "8",
      icon: Briefcase,
      change: "+2"
    },
    {
      title: "Client Rating",
      value: "4.9",
      icon: Star,
      change: "+0.1"
    },
    {
      title: "Total Clients",
      value: "32",
      icon: Users,
      change: "+5"
    }
  ];

  const handleAddPortfolio = async () => {
    if (!freelancerProfile || !portfolioForm.title || !portfolioForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const portfolioData: Omit<PortfolioItem, 'id' | 'createdAt'> = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      image: portfolioForm.image || "/placeholder.svg",
      tags: portfolioForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const success = await addPortfolioItem(freelancerProfile.id, portfolioData);
    if (success) {
      setPortfolioForm({ title: "", description: "", image: "", tags: "" });
      setIsPortfolioDialogOpen(false);
    }
  };

  const handleAddPricing = async () => {
    if (!freelancerProfile || !pricingForm.title || !pricingForm.price || !pricingForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const pricingData: Omit<PricingTier, 'id'> = {
      tier: pricingForm.tier,
      title: pricingForm.title,
      price: parseFloat(pricingForm.price),
      description: pricingForm.description,
      deliveryDays: parseInt(pricingForm.deliveryDays) || 7,
      revisions: parseInt(pricingForm.revisions) || 2,
      features: pricingForm.features.split(',').map(feature => feature.trim()).filter(feature => feature)
    };

    const success = await addPricingTier(freelancerProfile.id, pricingData);
    if (success) {
      setPricingForm({
        tier: "basic",
        title: "",
        price: "",
        description: "",
        deliveryDays: "",
        revisions: "",
        features: ""
      });
      setIsPricingDialogOpen(false);
    }
  };

  if (!freelancerProfile) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Freelancer Profile Not Found</h1>
            <p className="text-muted-foreground mb-4">
              You don't have a freelancer profile yet. Contact an administrator to create one.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <DashboardHeader />
        
        <QuickStatsCards />
        
        <DashboardTabs onViewApplication={setSelectedApplication} />
        
        {selectedApplication && (
          <ApplicationDetailsDialog
            application={selectedApplication}
            open={!!selectedApplication}
            onOpenChange={(open) => !open && setSelectedApplication(null)}
          />
        )}

        {/* Legacy Content - Portfolio and Pricing Management */}
        <div className="mt-12 space-y-6">
          <Tabs defaultValue="portfolio" className="space-y-6">
            <TabsList className="bg-card/60 backdrop-blur-sm rounded-xl border border-border p-1">
              <TabsTrigger value="portfolio" className="rounded-lg font-medium">Portfolio</TabsTrigger>
              <TabsTrigger value="pricing" className="rounded-lg font-medium">Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Portfolio Management</h2>
              <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Portfolio Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Portfolio Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={portfolioForm.title}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Project title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={portfolioForm.description}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your project"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={portfolioForm.image}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={portfolioForm.tags}
                        onChange={(e) => setPortfolioForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="React, Design, Mobile"
                      />
                    </div>
                    <Button onClick={handleAddPortfolio} className="w-full">
                      Add Portfolio Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {freelancerProfile.portfolio.map((item) => (
                <Card key={item.id}>
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pricing">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pricing Management</h2>
              <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pricing Tier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Pricing Tier</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tier">Tier</Label>
                      <Select value={pricingForm.tier} onValueChange={(value: "basic" | "standard" | "premium") => 
                        setPricingForm(prev => ({ ...prev, tier: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pricing-title">Title *</Label>
                      <Input
                        id="pricing-title"
                        value={pricingForm.title}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Service title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={pricingForm.price}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricing-description">Description *</Label>
                      <Textarea
                        id="pricing-description"
                        value={pricingForm.description}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what's included"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="delivery">Delivery Days</Label>
                        <Input
                          id="delivery"
                          type="number"
                          value={pricingForm.deliveryDays}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, deliveryDays: e.target.value }))}
                          placeholder="7"
                        />
                      </div>
                      <div>
                        <Label htmlFor="revisions">Revisions</Label>
                        <Input
                          id="revisions"
                          type="number"
                          value={pricingForm.revisions}
                          onChange={(e) => setPricingForm(prev => ({ ...prev, revisions: e.target.value }))}
                          placeholder="2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="features">Features (comma separated)</Label>
                      <Textarea
                        id="features"
                        value={pricingForm.features}
                        onChange={(e) => setPricingForm(prev => ({ ...prev, features: e.target.value }))}
                        placeholder="Feature 1, Feature 2, Feature 3"
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleAddPricing} className="w-full">
                      Add Pricing Tier
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {freelancerProfile.pricing.map((tier) => (
                <Card key={tier.id}>
                  <CardHeader className="text-center">
                    <Badge variant="outline" className="w-fit mx-auto capitalize">{tier.tier}</Badge>
                    <CardTitle>{tier.title}</CardTitle>
                    <div className="text-2xl font-bold">${tier.price}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <div>Delivery: {tier.deliveryDays} days</div>
                      <div>Revisions: {tier.revisions}</div>
                    </div>
                    <div className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-1 w-1 bg-green-500 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerDashboard;
