// src/pages/founder/FounderDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
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
import { cofounderMatchingService } from "@/services/founder-matching.service";
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

/* ================= TYPES ================= */
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
  photo_urls?: string[];
  views_count: number;
  matches_count: number;
  interested_count: number;
  created_at: string;
  updated_at: string;
  profile_completion_percentage?: number;
}

interface Match {
  match_id: string;
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

/* ================= COMPONENT ================= */
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

  /* ================= URL PARAMS ================= */
  useEffect(() => {
    const tab = searchParams.get("tab");
    const matchId = searchParams.get("match_id");
    if (tab) setActiveTab(tab);
    if (matchId) setSelectedMatchId(matchId);
    if (tab || matchId) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const profileCheck = await apiClient
          .get<FounderProfile>("/cofounder-matching/profile")
          .catch(() => null);

        setHasCofounderProfile(!!profileCheck);

        if (profileCheck) {
          setMyProfile(profileCheck);

          const matches = await apiClient.post<{ matches: Match[] }>(
            "/cofounder-matching/discover",
            { limit: 50 },
          );
          setPotentialMatches(matches?.matches || []);

          const pending = await apiClient.get<{
            pending_matches: Match[];
          }>("/cofounder-matching/matches/pending-interests");

          setPendingCount(pending?.pending_matches?.length || 0);

          const statsData = await apiClient.get<{
            profile_views: number;
            total_matches: number;
            pending_actions: number;
          }>("/cofounder-matching/statistics");

          setStats({
            total_views: statsData.profile_views || 0,
            total_matches: statsData.total_matches || 0,
            pending_matches: pending?.pending_matches?.length || 0,
          });
        }
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
        cofounderMatchingService.prefetchConversations();
      }
    };

    fetchDashboardData();
  }, []);

  const currentMatch = potentialMatches[currentProfileIndex];
  const matchedProfile = currentMatch?.matched_profile;

  /* ================= ACTIONS ================= */
  const handleSwipe = async (action: "interested" | "declined") => {
    if (!currentMatch || swiping) return;
    setSwiping(true);
    try {
      await apiClient.post(`/cofounder-matching/discover/action`, {
        candidate_profile_id: matchedProfile?.profile_id,
        action,
      });
      setCurrentProfileIndex((i) =>
        i < potentialMatches.length - 1 ? i + 1 : 0,
      );
    } finally {
      setSwiping(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* ================= MOBILE BOTTOM TABS ================= */}
          <TabsList
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 md:hidden",
              "h-16 border-t bg-white",
              "grid grid-cols-4",
            )}
          >
            {[
              { value: "discover", icon: Sparkles, label: "Discover" },
              { value: "interests", icon: Heart, label: "Likes" },
              { value: "matches", icon: Users, label: "Matches" },
              { value: "messages", icon: MessageCircle, label: "Chats" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex flex-col gap-1 text-xs"
              >
                <Icon className="h-5 w-5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ================= DESKTOP CONTENT ================= */}
          <div className="mx-auto max-w-4xl p-4 md:p-6 pb-24 md:pb-6">
            <div className="hidden md:block mb-6">
              <TabsList>
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="interests">Interests</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discover">{/* FULL UI ABOVE */}</TabsContent>
            <TabsContent value="interests">
              <NotificationsFeed />
            </TabsContent>
            <TabsContent value="matches">
              <ConnectionsList />
            </TabsContent>
            <TabsContent value="messages">
              <MessagingInterface
                initialMatchId={selectedMatchId || undefined}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FounderDashboard;
