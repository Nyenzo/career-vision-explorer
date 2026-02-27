import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Star,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { freelancerService } from "@/services/freelancer.service";
import { Freelancer } from "@/types/freelancer";
import { toast } from "sonner";
import { PricingDialog } from "@/components/freelancer/PricingDialog";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsEmbedded from "@/components/insights/InsightsEmbedded";

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [freelancerProfile, setFreelancerProfile] = useState<Freelancer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);

  useEffect(() => {
    checkFreelancerProfile();
  }, [user]);

  const checkFreelancerProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profile = await freelancerService.getFreelancerByUserId(
        user.user_id,
      );
      if (profile) {
        setFreelancerProfile(profile);
        setHasProfile(true);
      }
    } catch (error: any) {
      console.error("Error loading freelancer profile:", error);
      if (error.message === "Freelancer not found") {
        setHasProfile(false);
      } else {
        toast.error(
          "Error loading freelancer profile. Some features may be limited.",
        );
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => navigate("/freelancer/create-profile");
  const handleEditProfile = () => navigate("/freelancer/edit-profile");
  const handleViewPublicProfile = () => {
    if (freelancerProfile)
      navigate(`/freelancers/${freelancerProfile.freelancer_id}`);
  };
  const handleSavePricing = async (pricingData: any) => {
    try {
      await freelancerService.updateFreelancerPricing(
        freelancerProfile?.freelancer_id || "",
        pricingData,
      );
      toast.success("Pricing updated successfully!");
      setFreelancerProfile({ ...freelancerProfile, ...pricingData });
    } catch (error) {
      toast.error("Failed to update pricing");
      console.error("Error saving pricing:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome, {profile?.name || user?.name}!</CardTitle>
            <CardDescription>
              Get started by creating your freelancer profile to showcase your
              skills and attract clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateProfile}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Create Freelancer Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-2">
          {/* Title & Welcome */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Freelancer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Welcome back, {freelancerProfile?.name || profile?.name}!
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 md:mt-0">
            <RoleSwitcher />
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px] md:flex-none"
              onClick={handleViewPublicProfile}
            >
              View Public Profile
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-1 flex-1 min-w-[120px] md:flex-none"
              onClick={handleEditProfile}
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 min-w-[120px] md:flex-none"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="overflow-x-auto">
            <TabsList className="min-w-max grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-1 gap-2">
              <TabsTrigger
                value="overview"
                className="whitespace-nowrap rounded-lg font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="whitespace-nowrap rounded-lg font-medium"
              >
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Content */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium text-gray-600">
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">$0</span>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium text-gray-600">
                    Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {freelancerProfile.rating.toFixed(1)}
                      </span>
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>
                    <span className="text-sm text-gray-500">
                      ({freelancerProfile.total_reviews} reviews)
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium text-gray-600">
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">0</span>
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium text-gray-600">
                    Profile Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">0</span>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <span className="text-gray-600">Availability</span>
                  <Badge
                    variant={
                      freelancerProfile.available_for_hire
                        ? "success"
                        : "secondary"
                    }
                  >
                    {freelancerProfile.available_for_hire
                      ? "Available for Hire"
                      : "Not Available"}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-gray-600">Hourly Rate</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium">
                      {freelancerProfile.hourly_rate
                        ? `$${freelancerProfile.hourly_rate}/hr`
                        : "Not set"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPricingDialogOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="w-3 h-3" /> Manage Pricing
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">
                    {freelancerProfile.experience_years} years
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">
                    {freelancerProfile.location || "Not specified"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">
                    Start applying to projects or update your profile to attract
                    clients
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <InsightsEmbedded />
          </TabsContent>
        </Tabs>
      </div>

      {/* Pricing Dialog */}
      <PricingDialog
        open={pricingDialogOpen}
        onOpenChange={setPricingDialogOpen}
        currentHourlyRate={freelancerProfile?.hourly_rate}
        currentPricing={freelancerProfile?.pricing}
        onSave={handleSavePricing}
      />
    </div>
  );
}
