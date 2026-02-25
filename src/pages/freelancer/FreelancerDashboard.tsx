import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Star,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  Settings,
  Plus,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { freelancerService } from '@/services/freelancer.service';
import { Freelancer } from '@/types/freelancer';
import { toast } from 'sonner';
import { PricingDialog } from '@/components/freelancer/PricingDialog';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InsightsEmbedded from '@/components/insights/InsightsEmbedded';

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [freelancerProfile, setFreelancerProfile] = useState<Freelancer | null>(null);
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
      const profile = await freelancerService.getFreelancerByUserId(user.user_id);
      if (profile) {
        setFreelancerProfile(profile);
        setHasProfile(true);
      }
    } catch (error: any) {
      console.error('Error loading freelancer profile:', error);
      // Check if error is 404 (freelancer not found)
      if (error.message === 'Freelancer not found') {
        setHasProfile(false);
      } else {
        // For other errors, still try to show the dashboard
        toast.error('Error loading freelancer profile. Some features may be limited.');
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    navigate('/freelancer/create-profile');
  };

  const handleEditProfile = () => {
    navigate('/freelancer/edit-profile');
  };

  const handleViewPublicProfile = () => {
    if (freelancerProfile) {
      navigate(`/freelancers/${freelancerProfile.freelancer_id}`);
    }
  };

  const handleSavePricing = async (pricingData: any) => {
    try {
      await freelancerService.updateFreelancerPricing(freelancerProfile?.freelancer_id || '', pricingData);
      toast.success('Pricing updated successfully!');
      setFreelancerProfile({ ...freelancerProfile, ...pricingData });
    } catch (error) {
      toast.error('Failed to update pricing');
      console.error('Error saving pricing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome, {profile?.name || user?.name}!</CardTitle>
            <CardDescription>
              Get started by creating your freelancer profile to showcase your skills and attract clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateProfile} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Freelancer Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {freelancerProfile?.name}!
            </p>
          </div>
          <div className="flex gap-2">
            <RoleSwitcher />
            <Button variant="outline" onClick={handleViewPublicProfile}>
              View Public Profile
            </Button>
            <Button onClick={handleEditProfile}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="ghost" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-1">
            <TabsTrigger value="overview" className="rounded-lg font-medium">Overview</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg font-medium">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="flex items-center justify-between">
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
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Availability</span>
                    <Badge variant={freelancerProfile.available_for_hire ? "success" : "secondary"}>
                      {freelancerProfile.available_for_hire ? "Available for Hire" : "Not Available"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hourly Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {freelancerProfile.hourly_rate ? `$${freelancerProfile.hourly_rate}/hr` : "Not set"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setPricingDialogOpen(true)}>
                        <DollarSign className="w-3 h-3 mr-1" />
                        Manage Pricing
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">
                      {freelancerProfile.experience_years} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">
                      {freelancerProfile.location || "Not specified"}
                    </span>
                  </div>
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
                    Start applying to projects or update your profile to attract clients
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
