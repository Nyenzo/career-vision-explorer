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
  Users,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { freelancerService } from "@/services/freelancer.service";
import { Freelancer, FreelancerInquiry } from "@/types/freelancer";
import { toast } from "sonner";
import { PricingDialog } from "@/components/freelancer/PricingDialog";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsEmbedded from "@/components/insights/InsightsEmbedded";
import Layout from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [freelancerProfile, setFreelancerProfile] = useState<Freelancer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [inquiries, setInquiries] = useState<FreelancerInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyForId, setSendingReplyForId] = useState<string | null>(null);

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
        await loadInquiries();
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

  const loadInquiries = async () => {
    try {
      setInquiriesLoading(true);
      const data = await freelancerService.getMyFreelancerInquiries(10, 0);
      setInquiries(data || []);
    } catch (error) {
      console.error("Error loading freelancer inquiries:", error);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString();
  };

  const getTierLabel = (tier?: string) => {
    if (!tier) return "General inquiry";
    return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} package`;
  };
  const handleViewPublicProfile = () => {
    if (freelancerProfile)
      navigate(`/freelancers/${freelancerProfile.freelancer_id}`);
  };

  const handleSendReply = async (inquiryId: string) => {
    const draft = (replyDrafts[inquiryId] || "").trim();
    if (!draft) {
      toast.error("Please enter a reply message.");
      return;
    }

    try {
      setSendingReplyForId(inquiryId);
      await freelancerService.replyToFreelancerInquiry(inquiryId, { message: draft });
      setReplyDrafts((prev) => ({ ...prev, [inquiryId]: "" }));
      toast.success("Reply sent to client.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reply.");
    } finally {
      setSendingReplyForId(null);
    }
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
      <Layout>
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
      </Layout>
    );
  }

  if (!hasProfile) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
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
                    {Array.from(
                      new Set(
                        (freelancerProfile.skills || [])
                          .map((skill) => (skill || "").trim())
                          .filter(Boolean)
                      )
                    ).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Client Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Client Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  {inquiriesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, idx) => (
                        <Skeleton key={idx} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No client messages yet</p>
                      <p className="text-sm mt-1">
                        Messages from employers will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div
                          key={inquiry.inquiry_id}
                          className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {inquiry.sender_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {inquiry.sender_email}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getTierLabel(inquiry.selected_tier)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-wrap">
                            {inquiry.message}
                          </p>
                          <div className="text-xs text-gray-500 mt-3 flex flex-wrap items-center gap-2">
                            <span>{formatMessageDate(inquiry.created_at)}</span>
                            {typeof inquiry.tier_price === "number" && (
                              <span>Quoted tier: ${inquiry.tier_price}</span>
                            )}
                          </div>

                          <div className="mt-4 space-y-2">
                            <Textarea
                              value={replyDrafts[inquiry.inquiry_id] || ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [inquiry.inquiry_id]: e.target.value,
                                }))
                              }
                              placeholder="Reply to this client..."
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleSendReply(inquiry.inquiry_id)}
                                disabled={sendingReplyForId === inquiry.inquiry_id || !(replyDrafts[inquiry.inquiry_id] || "").trim()}
                              >
                                {sendingReplyForId === inquiry.inquiry_id ? "Sending..." : "Send Reply"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
    </Layout>
  );
}
