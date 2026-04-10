import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MessageSquare,
  Star,
  MapPin,
  Mail,
  Check,
  ImageIcon,
  DollarSign,
} from "lucide-react";
import { freelancerService } from "@/services/freelancer.service";
import { Freelancer } from "@/types/freelancer";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { ContactDialog } from "@/components/freelancer/ContactDialog";
import { PricingDialog } from "@/components/freelancer/PricingDialog";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FreelancerProfile() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [portfolioActionLoading, setPortfolioActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "portfolio" | "pricing" | "reviews"
  >("portfolio");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedPackageForContact, setSelectedPackageForContact] = useState<
    string | undefined
  >();
  const [reviews, setReviews] = useState<Array<{
    review_id?: string;
    reviewer_name?: string;
    rating?: number;
    comment?: string;
    created_at?: string;
    project_title?: string;
  }>>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewProjectTitle, setReviewProjectTitle] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (freelancerId) {
      loadFreelancer();
    } else {
      toast.error("No freelancer ID was provided.");
      navigate("/freelancers");
    }
  }, [freelancerId, navigate]);

  const loadFreelancer = async () => {
    if (!freelancerId) return;
    try {
      setLoading(true);
      try {
        const enrichedData = await freelancerService.getFreelancerEnriched(
          freelancerId
        );
        setFreelancer(enrichedData);
        const loadedReviews = await freelancerService.getFreelancerReviews(
          freelancerId,
          50
        );
        setReviews(loadedReviews || []);
      } catch (enrichedError) {
        console.log(
          "Enriched endpoint failed, falling back to regular endpoint"
        );
        const data = await freelancerService.getFreelancer(freelancerId);
        setFreelancer(data);
        const loadedReviews = await freelancerService.getFreelancerReviews(
          freelancerId,
          50
        );
        setReviews(loadedReviews || data.recent_reviews || []);
      }
    } catch (error) {
      console.error("Error loading freelancer:", error);
      toast.error("Failed to load freelancer profile.");
      navigate("/freelancers");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInYears = now.getFullYear() - date.getFullYear();
      if (diffInYears === 0) {
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
      return date.getFullYear().toString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleSendMessage = async (data: {
    selectedTier?: string;
    tierPrice?: number;
    message: string;
  }) => {
    if (!freelancer?.freelancer_id) {
      throw new Error("Freelancer not found");
    }
    await freelancerService.contactFreelancer(freelancer.freelancer_id, {
      message: data.message,
      selected_tier: (data.selectedTier as "basic" | "standard" | "premium" | undefined),
      tier_price: data.tierPrice,
    });
  };

  const openContactDialog = (packageType?: string) => {
    setSelectedPackageForContact(packageType);
    setContactDialogOpen(true);
  };

  const isOwnFreelancerProfile =
    !!user?.user_id && !!freelancer?.user_id && user.user_id === freelancer.user_id;

  const uniqueSkills = Array.from(
    new Set((freelancer?.skills || []).map((skill) => (skill || "").trim()).filter(Boolean))
  );

  const handleSubmitReview = async () => {
    if (!freelancer?.freelancer_id) return;
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      toast.error("Please enter a meaningful review comment.");
      return;
    }

    try {
      setSubmittingReview(true);
      await freelancerService.createFreelancerReview(freelancer.freelancer_id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        project_title: reviewProjectTitle.trim() || undefined,
      });
      toast.success("Review submitted successfully.");
      setReviewComment("");
      setReviewProjectTitle("");
      setReviewRating(5);
      await loadFreelancer();
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePortfolioSync = async () => {
    if (!freelancer?.freelancer_id) return;
    setPortfolioActionLoading(true);
    try {
      const result = await freelancerService.syncPortfolio(freelancer.freelancer_id);
      toast.success(result.message || "Portfolio synced successfully.");
      await loadFreelancer();
    } catch (error: any) {
      toast.error(error?.message || "Failed to sync portfolio.");
    } finally {
      setPortfolioActionLoading(false);
    }
  };

  const handleEnhancePortfolioImages = async () => {
    if (!freelancer?.freelancer_id) return;
    setPortfolioActionLoading(true);
    try {
      const result = await freelancerService.enhancePortfolioImages(freelancer.freelancer_id);
      toast.success(result.message || "Portfolio images enhanced.");
      await loadFreelancer();
    } catch (error: any) {
      toast.error(error?.message || "Failed to enhance portfolio images.");
    } finally {
      setPortfolioActionLoading(false);
    }
  };

  const handleSavePricing = async (pricingData: any) => {
    if (!freelancer?.freelancer_id) return;
    await freelancerService.updateFreelancerPricing(freelancer.freelancer_id, pricingData);
    await loadFreelancer();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="h-[200px] w-full mb-8" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!freelancer) {
    return (
      <Layout>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">Freelancer Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The profile you are looking for does not exist.
          </p>
          <Button onClick={() => navigate("/freelancers")}>
            Return to Freelancers
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-32 w-32 rounded-lg">
                <AvatarImage
                  src={freelancer.profile_image_url}
                  alt={freelancer.name}
                />
                <AvatarFallback className="text-3xl bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {getInitials(freelancer.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {freelancer.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                      {freelancer.title}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">
                          {freelancer.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-gray-500">
                          ({freelancer.total_reviews || 0} reviews)
                        </span>
                      </div>
                      {freelancer.location && (
                        <span className="text-gray-500">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {freelancer.location}
                        </span>
                      )}
                      <span className="text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Joined {formatDate(freelancer.member_since)}
                      </span>
                    </div>

                    <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl">
                      {freelancer.bio}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {freelancer.email}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3">
                    {isOwnFreelancerProfile ? (
                      <Button size="lg" onClick={() => navigate("/freelancer/edit-profile")}>
                        Edit Profile
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => openContactDialog()}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {uniqueSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {uniqueSkills.slice(0, 4).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {uniqueSkills.length > 4 && (
                      <Badge
                        variant="outline"
                        className="px-3 py-1 text-gray-500"
                      >
                        +{uniqueSkills.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          >
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-8">
              <TabsTrigger value="portfolio" className="px-8">
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="pricing" className="px-8">
                Pricing
              </TabsTrigger>
              <TabsTrigger value="reviews" className="px-8">
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="mt-0">
              {isOwnFreelancerProfile && (
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    onClick={handlePortfolioSync}
                    disabled={portfolioActionLoading}
                  >
                    Sync Portfolio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEnhancePortfolioImages}
                    disabled={portfolioActionLoading}
                  >
                    Enhance Images
                  </Button>
                </div>
              )}
              {freelancer.portfolio_items &&
                freelancer.portfolio_items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freelancer.portfolio_items.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No portfolio items yet
                  </h3>
                  <p className="text-gray-500">
                    This freelancer hasn't added any portfolio items.
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-0">
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-gray-700 dark:text-gray-300">
                  <span className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Hourly Rate
                  </span>
                  <div className="text-3xl font-bold mt-1">
                    {freelancer.hourly_rate ? `$${freelancer.hourly_rate}/hr` : "Not set"}
                  </div>
                </div>
                {isOwnFreelancerProfile && (
                  <Button onClick={() => setPricingDialogOpen(true)}>
                    Manage Pricing
                  </Button>
                )}
              </div>
              {freelancer.pricing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Package */}
                  {freelancer.pricing.basic_package && (
                    <Card className="relative">
                      <CardHeader className="text-center pb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Basic
                        </p>
                        <CardTitle className="text-2xl mt-2">
                          {freelancer.pricing.basic_package.name}
                        </CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            ${freelancer.pricing.basic_package.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {freelancer.pricing.basic_package.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-center mb-6 space-y-1">
                          <p className="text-sm">
                            {freelancer.pricing.basic_package.delivery_days}{" "}
                            days delivery
                          </p>
                          <p className="text-sm">
                            {freelancer.pricing.basic_package.revisions}{" "}
                            revisions
                          </p>
                        </div>
                        <div className="space-y-3 mb-6">
                          {freelancer.pricing.basic_package.features?.map(
                            (feature, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            )
                          )}
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => openContactDialog("basic")}
                        >
                          Continue (${freelancer.pricing.basic_package.price})
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Standard Package */}
                  {freelancer.pricing.standard_package && (
                    <Card className="relative border-2 border-primary">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="px-3 py-1">Most Popular</Badge>
                      </div>
                      <CardHeader className="text-center pb-4 pt-8">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Standard
                        </p>
                        <CardTitle className="text-2xl mt-2">
                          {freelancer.pricing.standard_package.name}
                        </CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            ${freelancer.pricing.standard_package.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {freelancer.pricing.standard_package.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-center mb-6 space-y-1">
                          <p className="text-sm">
                            {freelancer.pricing.standard_package.delivery_days}{" "}
                            days delivery
                          </p>
                          <p className="text-sm">
                            {freelancer.pricing.standard_package.revisions}{" "}
                            revisions
                          </p>
                        </div>
                        <div className="space-y-3 mb-6">
                          {freelancer.pricing.standard_package.features?.map(
                            (feature, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            )
                          )}
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => openContactDialog("standard")}
                        >
                          Continue (${freelancer.pricing.standard_package.price}
                          )
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Premium Package */}
                  {freelancer.pricing.premium_package && (
                    <Card className="relative">
                      <CardHeader className="text-center pb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Premium
                        </p>
                        <CardTitle className="text-2xl mt-2">
                          {freelancer.pricing.premium_package.name}
                        </CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            ${freelancer.pricing.premium_package.price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {freelancer.pricing.premium_package.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-center mb-6 space-y-1">
                          <p className="text-sm">
                            {freelancer.pricing.premium_package.delivery_days}{" "}
                            days delivery
                          </p>
                          <p className="text-sm">
                            {freelancer.pricing.premium_package.revisions}{" "}
                            revisions
                          </p>
                        </div>
                        <div className="space-y-3 mb-6">
                          {freelancer.pricing.premium_package.features?.map(
                            (feature, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            )
                          )}
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => openContactDialog("premium")}
                        >
                          Continue (${freelancer.pricing.premium_package.price})
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No pricing information
                  </h3>
                  <p className="text-gray-500">
                    This freelancer hasn't set up their pricing packages yet.
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold">
                          {freelancer.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-gray-500">
                          ({freelancer.total_reviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!isOwnFreelancerProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Leave a Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your rating</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              className="p-1"
                              onClick={() => setReviewRating(value)}
                              aria-label={`Rate ${value} stars`}
                            >
                              <Star
                                className={`w-6 h-6 ${value <= reviewRating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Project title (optional)</p>
                        <Input
                          value={reviewProjectTitle}
                          onChange={(e) => setReviewProjectTitle(e.target.value)}
                          placeholder="e.g. Selenium test suite setup"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your review</p>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience working with this freelancer"
                          rows={4}
                        />
                      </div>

                      <Button onClick={handleSubmitReview} disabled={submittingReview || !reviewComment.trim()}>
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review, index) => (
                      <Card key={review.review_id || `${review.reviewer_name || "review"}-${index}`}>
                        <CardContent className="pt-6 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">
                              {review.reviewer_name || "Client"}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={`${review.review_id || index}-star-${s}`}
                                    className={`w-4 h-4 ${s <= (review.rating || 0)
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium">{review.rating || 0}.0</span>
                            </div>
                          </div>
                          {review.project_title && (
                            <p className="text-sm text-gray-500">{review.project_title}</p>
                          )}
                          <p className="text-gray-700 dark:text-gray-300">
                            {review.comment || "No review comment provided."}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-gray-500">
                      This freelancer hasn't received any reviews yet.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PricingDialog
        open={pricingDialogOpen}
        onOpenChange={setPricingDialogOpen}
        currentHourlyRate={freelancer.hourly_rate}
        currentPricing={freelancer.pricing}
        onSave={handleSavePricing}
      />

      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSendMessage={handleSendMessage}
        freelancerName={freelancer.name}
        pricing={freelancer.pricing}
        initialSelectedTier={selectedPackageForContact as
          | "basic"
          | "standard"
          | "premium"
          | undefined}
      />
    </Layout>
  );
}
