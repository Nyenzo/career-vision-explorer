import React, { useState } from "react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import Layout from "@/components/layout/Layout";
import { DashboardBackground } from "@/components/jobseeker/dashboard/DashboardBackground";
import { ProfileCompletionCard } from "@/components/jobseeker/dashboard/ProfileCompletionCard";
import { RecentActivityCard } from "@/components/jobseeker/dashboard/RecentActivityCard";

import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { useAuth } from "@/hooks/use-auth";
import { useJobApplications } from "@/hooks/use-job-applications";
import {
  JobSeekerDashboardSkeleton,
} from "@/components/ui/skeleton-loaders";
import {
  Bell,
  MessageSquare,
  Edit3,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Users,
  Target,
  TrendingUp,
  Loader2,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const JobSeekerDashboard = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isLoading: applicationsLoading } = useJobApplications();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [isFounderLoading, setIsFounderLoading] = useState(false);
  const navigate = useNavigate();
  const minPhotosRequired = 3;

  const handleCofounderClick = async () => {
    setIsFounderLoading(true);
    try {
      const founderProfile = await cofounderMatchingService.getProfile();
      if (founderProfile.onboarding_completed && (founderProfile.photo_urls?.length ?? 0) >= minPhotosRequired) {
        navigate("/founder/dashboard");
      } else {
        navigate("/founder/onboarding");
      }
    } catch {
      toast.error("Failed to load co-founder profile. Please try again.");
    } finally {
      setIsFounderLoading(false);
    }
  };

  // If critical dependencies are loading, show ONE unified page loader.
  if (authLoading || applicationsLoading) {
    return (
      <Layout>
        <JobSeekerDashboardSkeleton />
      </Layout>
    );
  }

  const handleSaveProfile = async (data: {
    name: string;
    email: string;
    role: string;
    education?: string;
    experience?: string;
    location?: string;
    phone?: string;
    bio?: string;
    profileImage?: string;
  }) => {
    console.log("Saving profile:", data);
  };

  const handleEditProfile = () => {
    navigate("/profile");
  };

  const handleMessagesClick = () => {
    // TODO: Implement messaging feature
    toast.info("Messages", {
      description: "Messaging feature coming soon!",
    });
  };


  return (
    <Layout>
      <div className="min-h-screen bg-[#f1f5f9]">
        <main className="pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
          {/* Hero Section / Editorial Header */}
          <header className="mb-12">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface mb-4">
              Welcome back, {profile?.name?.split(" ")[0] || user?.name?.split(" ")[0] || (profile?.email ? profile.email.split('@')[0] : 'there')}.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl">
              Your career architecture is evolving. Here is your current standing and recent activity within the Visiondrill ecosystem.
            </p>
          </header>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile & Sidebar Actions */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Profile Card */}
              <section className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/15">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <Avatar className="w-32 h-32 ring-4 ring-surface-container flex-shrink-0">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-3xl">
                        {profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ||
                          user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "PN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 bg-tertiary w-6 h-6 rounded-full border-4 border-surface-container-lowest flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px] text-white">check</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold font-headline mb-1">
                    {profile?.name || user?.name || (profile?.email ? profile.email.split('@')[0] : 'Profile Name')}
                  </h2>
                  <p className="text-on-surface-variant font-medium mb-6">
                    {profile?.active_role === 'job_seeker' ? 'Job Seeker' : 'Professional'}
                  </p>
                  <div className="flex flex-col w-full gap-3">
                    <button onClick={handleEditProfile} className="w-full py-3 px-6 bg-primary-container text-on-primary rounded-full font-semibold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate("/jobseeker/saved-jobs")}
                      className="w-full py-3 px-6 bg-surface-container-low text-primary font-semibold text-sm rounded-full hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      View Saved Jobs
                    </button>
                    <RoleSwitcher />
                  </div>
                </div>
              </section>

              {/* Recent Activity */}
              <RecentActivityCard />
            </div>

            {/* Right Column: Profile Completion (Bento Main) & Quick Stats */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <ProfileCompletionCard />
              {/* Co-Founder Matching CTA */}
              <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold font-headline text-on-surface">Find Co-Founders</h3>
                  <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider">NEW</Badge>
                </div>
                <p className="text-gray-500 mb-6">
                  Connect with potential co-founders for your startup.
                </p>

                <div className="bg-[#f8f9fa] rounded-2xl p-6 relative">
                  <button className="absolute right-4 top-4 text-blue-600 w-6 h-6 rounded flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors">
                    <span className="text-sm font-bold">?</span>
                  </button>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Build Your Dream Team</h4>
                  <p className="text-gray-500 text-sm mb-6">
                    Find technical, business, and marketing co-founders who match your skills and vision.
                  </p>

                  <button
                    onClick={!isFounderLoading ? handleCofounderClick : undefined}
                    disabled={isFounderLoading}
                    className="bg-[#1a56db] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {isFounderLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                    Explore Co-Founder Matching
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          userData={{
            name: user?.name || "",
            email: user?.email || "",
            role: profile?.active_role || user?.account_type || "job_seeker",
            education: Array.isArray(profile?.education)
              ? profile.education
                .map((edu) => `${edu.institution} - ${edu.degree}`)
                .join(", ")
              : "",
            experience: profile?.experience_years?.toString() || "",
            location: profile?.location || "",
            phone: profile?.phone_number || "",
            bio: profile?.bio || "",
            profileImage: profile?.avatar_url || "",
          }}
          onSave={handleSaveProfile}
        />


      </div>
    </Layout>
  );
};

export default JobSeekerDashboard;
