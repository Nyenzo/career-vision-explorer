// src/pages/founder/FounderDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  MessageCircle,
  Bell,
  Sparkles,
  Heart,
  X,
  MapPin,
  Briefcase,
  Clock,
  Star,
  Zap,
  Building,
  Users,
  Award,
  Settings,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NotificationsFeed } from "@/components/founder-matching/NotificationsFeed";
import { ConnectionsList } from "@/components/founder-matching/ConnectionsList";
import { MessagingInterface } from "@/components/founder-matching/MessagingInterface";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface FounderProfile {
  profile_id: string;
  id: string;
  user_id: string;
  name: string;
  current_role: string;
  years_experience: number;
  technical_skills: string[];
  soft_skills: string[];
  seeking_roles: string[];
  industries: string[];
  commitment_level: string;
  location_preference: string;
  preferred_locations: string[];
  achievements: string[];
  education: string[];
  certifications: string[];
  bio: string;
  linkedin_url: string;
  portfolio_url: string;
  profile_image_url?: string;
  photo_urls?: string[]; // Array of photo URLs
  views_count: number;
  matches_count: number;
  interested_count: number;
  created_at: string;
  updated_at: string;
  profile_completion_percentage?: number;
}

interface Match {
  match_id: string; // Changed from 'id' to 'match_id' to match backend
  overall_score: number;
  skill_compatibility_score?: number;
  experience_match_score?: number;
  role_alignment_score?: number;
  location_compatibility_score?: number;
  profile_similarity_score?: number;
  matched_profile: FounderProfile;
  created_at: string;
  status: "pending" | "accepted" | "rejected" | "connected";
}

const FounderDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [potentialMatches, setPotentialMatches] = useState<Match[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasCofounderProfile, setHasCofounderProfile] = useState(false);
  const [myProfile, setMyProfile] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [stats, setStats] = useState({
    total_views: 0,
    total_matches: 0,
    pending_matches: 0,
  });

  // Read URL search params (e.g. ?tab=messages&match_id=xxx)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const matchId = searchParams.get('match_id');
    if (tab) {
      setActiveTab(tab);
    }
    if (matchId) {
      setSelectedMatchId(matchId);
    }
    // Clean up search params from URL after reading
    if (tab || matchId) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Check if user has a cofounder profile
        const profileCheck = await apiClient
          .get<FounderProfile>("/cofounder-matching/profile")
          .catch(() => null);
        setHasCofounderProfile(!!profileCheck);
        
        if (profileCheck) {
          setMyProfile(profileCheck);
          console.log("Founder profile loaded:", profileCheck);
          console.log("Intent type:", profileCheck.intent_type);
          console.log("Onboarding completed:", profileCheck.onboarding_completed);
          
          // Fetch potential matches using discover endpoint (no min_score to get all users)
          const matchesResponse = await apiClient.post<{ matches: Match[] }>(
            "/cofounder-matching/discover",
            { limit: 50 }
          );
          console.log("Discover matches response:", matchesResponse);
          setPotentialMatches(matchesResponse?.matches || []);

          // Fetch pending interests count (not total profiles)
          const pendingInterestsResponse = await apiClient.get<{ pending_matches: Match[] }>("/cofounder-matching/matches/pending-interests");
          const pendingInterests = pendingInterestsResponse?.pending_matches || [];
          setPendingCount(pendingInterests.length);

          // Fetch cofounder matching statistics
          const statsData = await apiClient.get<{ profile_views: number; total_matches: number; pending_actions: number }>("/cofounder-matching/statistics");
          setStats({
            total_views: statsData.profile_views || 0,
            total_matches: statsData.total_matches || 0,
            pending_matches: pendingInterests.length
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentMatch = potentialMatches[currentProfileIndex];
  const matchedProfile = currentMatch?.matched_profile;

  const handleSwipeLeft = useCallback(async () => {
    if (!currentMatch || swiping) return;

    setSwiping(true);
    try {
      // Send decline via discover action endpoint
      await apiClient.post(`/cofounder-matching/discover/action`, {
        candidate_profile_id: currentMatch.matched_profile?.profile_id || currentMatch.profile_2_id,
        action: "declined"
      });

      toast.info("Passed", {
        description: `You passed on ${matchedProfile?.name}`,
      });

      // Move to next profile
      if (currentProfileIndex < potentialMatches.length - 1) {
        setCurrentProfileIndex(currentProfileIndex + 1);
      } else {
        setCurrentProfileIndex(0);
        toast("✨ Back to first profile!");
      }
    } catch (error) {
      console.error("Failed to reject match:", error);
      toast.error("Failed to process action");
    } finally {
      setSwiping(false);
    }
  }, [
    currentProfileIndex,
    currentMatch,
    matchedProfile,
    potentialMatches.length,
    swiping,
  ]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentMatch || swiping) return;

    setSwiping(true);
    try {
      // Send interest via discover action endpoint
      await apiClient.post(`/cofounder-matching/discover/action`, {
        candidate_profile_id: currentMatch.matched_profile?.profile_id || currentMatch.profile_2_id,
        action: "interested"
      });

      toast.success("Interest sent!", {
        description: `${matchedProfile?.name} will be notified of your interest`,
      });

      // Move to next profile
      if (currentProfileIndex < potentialMatches.length - 1) {
        setCurrentProfileIndex(currentProfileIndex + 1);
      } else {
        setCurrentProfileIndex(0);
        toast("✨ Back to first profile!");
      }
    } catch (error) {
      console.error("Failed to like match:", error);
      toast.error("Failed to process action");
    } finally {
      setSwiping(false);
    }
  }, [
    currentProfileIndex,
    currentMatch,
    matchedProfile,
    potentialMatches.length,
    swiping,
  ]);

  const handleSuperLike = useCallback(async () => {
    if (!currentMatch || swiping) return;

    setSwiping(true);
    try {
      // Send super like to API (same as interested action for now)
      await apiClient.post(
        `/cofounder-matching/matches/${currentMatch.match_id}/action`,
        { action: "interested" }
      );

      toast.success("Super Like!", {
        description: `${matchedProfile?.name} will get a special notification`,
      });

      // Move to next profile
      if (currentProfileIndex < potentialMatches.length - 1) {
        setCurrentProfileIndex(currentProfileIndex + 1);
      } else {
        setCurrentProfileIndex(0);
        toast("✨ Back to first profile!");
      }
    } catch (error) {
      console.error("Failed to super like:", error);
      toast.error("Failed to process action");
    } finally {
      setSwiping(false);
    }
  }, [
    currentProfileIndex,
    currentMatch,
    matchedProfile,
    potentialMatches.length,
    swiping,
  ]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "discover" || !currentMatch || swiping) return;

      if (e.key === "ArrowLeft") handleSwipeLeft();
      if (e.key === "ArrowRight") handleSwipeRight();
      if (e.key === " ") handleSuperLike();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, currentMatch, swiping, handleSwipeLeft, handleSwipeRight, handleSuperLike]);

  const handleCreateProfile = () => {
    navigate("/founder/onboarding");
  };

  // Reset photo index when card changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [currentProfileIndex]);

  const handleEditProfile = () => {
    navigate("/founder/profile");
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/founder/profile/${profileId}`);
  };

  const refreshMatches = async () => {
    setLoading(true);
    try {
      const matchesResponse = await apiClient.post<{ matches: Match[] }>(
        "/cofounder-matching/discover",
        { limit: 50 }
      );
      setPotentialMatches(matchesResponse?.matches || []);
      setCurrentProfileIndex(0);
      toast.success("Matches refreshed!");
    } catch (error) {
      console.error("Failed to refresh matches:", error);
      toast.error("Failed to refresh matches");
    } finally {
      setLoading(false);
    }
  };

  const renderMainProfileView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading potential matches...</p>
          </div>
        </div>
      );
    }

    if (!hasCofounderProfile) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Create Your Founder Profile
          </h3>
          <p className="text-slate-600 mb-6">
            Build your profile to start matching with potential co-founders
          </p>
          <Button
            onClick={handleCreateProfile}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Founder Profile
          </Button>
        </div>
      );
    }

    if (!currentMatch || !matchedProfile) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            No potential co-founders found
          </h3>
          <p className="text-slate-600 mb-6">
            Check back later for more matches
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={refreshMatches} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                "Refresh Matches"
              )}
            </Button>
            <Button variant="outline" onClick={handleEditProfile}>
              Edit My Profile
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_views || 0}
              </div>
              <div className="text-sm text-slate-500">Profile Views</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.total_matches || 0}
              </div>
              <div className="text-sm text-slate-500">Connections</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.pending_matches || 0}
              </div>
              <div className="text-sm text-slate-500">Interested in You</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Card */}
        <Card className="overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="relative h-80 bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Profile photo carousel or placeholder */}
            <div className="absolute inset-0">
              {matchedProfile.photo_urls && matchedProfile.photo_urls.length > 0 ? (
                <div className="relative w-full h-full">
                  <img
                    src={matchedProfile.photo_urls[currentPhotoIndex]}
                    alt={`${matchedProfile.name} - Photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Photo navigation dots */}
                  {matchedProfile.photo_urls.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                      {matchedProfile.photo_urls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex(idx);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentPhotoIndex 
                              ? 'bg-white w-6' 
                              : 'bg-white/50 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Left/Right nav arrows */}
                  {matchedProfile.photo_urls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPhotoIndex((prev) => 
                            prev > 0 ? prev - 1 : matchedProfile.photo_urls!.length - 1
                          );
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors z-10"
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPhotoIndex((prev) => 
                            (prev + 1) % matchedProfile.photo_urls!.length
                          );
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors z-10"
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>
                    </>
                  )}
                </div>
              ) : matchedProfile.profile_image_url ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={matchedProfile.profile_image_url}
                    alt={matchedProfile.name}
                    className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Users className="h-20 w-20 text-blue-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Match Score Badge - Clickable */}
            <Badge 
              className="absolute top-4 right-4 px-4 py-2 font-semibold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base cursor-pointer hover:scale-105 transition-transform z-10"
              onClick={() => setShowScoreModal(true)}
            >
              {Math.round(currentMatch.overall_score * 100)}% Match
            </Badge>

            {/* View Profile Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 bg-white/80 hover:bg-white"
              onClick={() => handleViewProfile(matchedProfile.profile_id || matchedProfile.id)}
            >
              View Full Profile
            </Button>
          </div>

          <CardContent className="p-6">
            {/* Name and Role */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">
                {matchedProfile.name},{" "}
                <span className="text-slate-600">
                  {matchedProfile.years_experience} years
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Briefcase className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-medium text-slate-700">
                  {matchedProfile.current_role}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-lg text-blue-800 font-medium leading-relaxed">
                  {matchedProfile.bio || "No bio provided"}
                </p>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">
                      Location Preference
                    </p>
                    <p className="font-medium text-slate-900">
                      {matchedProfile.location_preference || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Industry</p>
                    <p className="font-medium text-slate-900">
                      {matchedProfile.industries?.slice(0, 2).join(", ") ||
                        "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Commitment</p>
                    <p className="font-medium text-slate-900">
                      {matchedProfile.commitment_level || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Experience</p>
                    <p className="font-medium text-slate-900">
                      {matchedProfile.years_experience || 0} years
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {matchedProfile.technical_skills &&
              matchedProfile.technical_skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {matchedProfile.technical_skills
                      .slice(0, 6)
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-4 py-2 text-base border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

            {/* Seeking */}
            {matchedProfile.seeking_roles &&
              matchedProfile.seeking_roles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Looking for a co-founder who is
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {matchedProfile.seeking_roles.map((role, index) => (
                      <Badge
                        key={index}
                        className="px-4 py-2 text-base bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-8">
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-slate-300 hover:bg-slate-50 shadow-lg"
            onClick={handleSwipeLeft}
            disabled={swiping}
          >
            {swiping ? (
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            ) : (
              <X className="h-8 w-8 text-slate-500" />
            )}
          </Button>

          <Button
            size="lg"
            className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            onClick={handleSwipeRight}
            disabled={swiping}
          >
            {swiping ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Check className="h-8 w-8" />
            )}
          </Button>
        </div>

        {/* Quick Tips & Progress */}
        <div className="text-center pt-4 space-y-2">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-red-600">← Pass</span> •{" "}
            <span className="font-medium text-emerald-600">✓ Connect</span>
          </p>
          <p className="text-xs text-slate-400">
            Profile {currentProfileIndex + 1} of {potentialMatches.length} •
            Press arrow keys
          </p>
        </div>
      </div>
    );
  };

  if (loading && !hasCofounderProfile) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {myProfile?.name ? `Welcome, ${myProfile.name}` : "Founder Match"}
              </h1>
              <p className="text-sm md:text-lg text-slate-600">
                Find your perfect co-founder
              </p>
              {myProfile?.profile_completion_percentage !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${myProfile.profile_completion_percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {myProfile.profile_completion_percentage}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Settings/Profile Button */}
              {hasCofounderProfile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProfile}
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Settings className="h-5 w-5" />
                  <span className="hidden md:inline">My Profile</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateProfile}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Create Profile</span>
                </Button>
              )}

              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setActiveTab("interests")}
              >
                <Bell className="h-5 w-5 md:h-6 md:w-6 text-slate-700" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-blue-600 text-white text-[10px] md:text-xs flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Navigation */}
            <div className="md:mb-6">
              <TabsList className="w-full md:w-auto grid grid-cols-4 md:grid-cols-4 md:inline-flex">
                <TabsTrigger
                  value="discover"
                  className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 data-[state=active]:text-blue-600"
                >
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Discover</span>
                </TabsTrigger>
                <TabsTrigger
                  value="interests"
                  className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 relative data-[state=active]:text-blue-600"
                >
                  <Heart className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Interests</span>
                  {pendingCount > 0 && (
                    <span className="absolute top-2 md:top-1 right-8 md:right-1 h-2 w-2 rounded-full bg-pink-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="matches"
                  className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 data-[state=active]:text-blue-600"
                >
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Matches</span>
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 data-[state=active]:text-blue-600"
                >
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-sm">Messages</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="pb-20 md:pb-0">
              <TabsContent value="discover" className="mt-0">
                {renderMainProfileView()}
              </TabsContent>

              <TabsContent value="interests" className="mt-0">
                <NotificationsFeed />
              </TabsContent>

              <TabsContent value="matches" className="mt-0">
                <ConnectionsList />
              </TabsContent>

              <TabsContent value="messages" className="mt-0">
                <MessagingInterface initialMatchId={selectedMatchId || undefined} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Match Score Modal */}
      {currentMatch && (
        <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Match Score Breakdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Overall Score */}
              <div className="text-center pb-4 border-b">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {Math.round(currentMatch.overall_score * 100)}%
                </div>
                <p className="text-sm text-slate-500 mt-2">Overall Match Score</p>
              </div>
              
              {/* Score breakdown bars */}
              <div className="space-y-4">
                {[
                  { label: 'Skills Compatibility', score: currentMatch.skill_compatibility_score, icon: '🎯' },
                  { label: 'Experience Match', score: currentMatch.experience_match_score, icon: '💼' },
                  { label: 'Role Alignment', score: currentMatch.role_alignment_score, icon: '🎭' },
                  { label: 'Location Match', score: currentMatch.location_compatibility_score, icon: '📍' },
                  { label: 'Profile Similarity', score: currentMatch.profile_similarity_score, icon: '👥' },
                ].map((item) => {
                  const score = item.score;
                  if (score === undefined || score === null) return null;
                  
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="font-semibold text-blue-600">
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info text */}
              <p className="text-xs text-slate-400 text-center pt-4">
                Match scores are calculated based on profile compatibility across multiple factors
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default FounderDashboard;
