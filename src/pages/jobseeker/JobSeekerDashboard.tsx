import React, { useState } from "react";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import Layout from "@/components/layout/Layout";
import { DashboardBackground } from "@/components/jobseeker/dashboard/DashboardBackground";
import { ProfileCompletionCard } from "@/components/jobseeker/dashboard/ProfileCompletionCard";
import { RecentActivityCard } from "@/components/jobseeker/dashboard/RecentActivityCard";
import { QuickStatsCards } from "@/components/jobseeker/dashboard/QuickStatsCards";

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
              <QuickStatsCards />
              {/* Co-Founder Matching CTA */}
              <section
                className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={!isFounderLoading ? handleCofounderClick : undefined}
              >
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">New</p>
                  <h3 className="text-xl font-bold text-white mb-2">Find Your Co-Founder</h3>
                  <p className="text-sm text-blue-100 mb-4 max-w-sm">
                    Connect with technically strong co-founders and collaborators who match your vision, skills, and ambition.
                  </p>
                  <button disabled={isFounderLoading} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-70">
                    {isFounderLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...</> : "Get Started →"}
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-9xl font-black text-white select-none pointer-events-none">
                  ✦
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
