import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Compass,
  Users,
  Network,
  MessageCircle,
  FolderKanban,
  User,
  Loader2,
  Eye,
  Star,
  Activity
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { cofounderMatchingService } from "@/services/founder-matching.service";
import { MatchDiscovery } from "@/components/founder-matching/MatchDiscovery";
import { MatchesFeed } from "@/components/founder-matching/MatchesFeed";
import { NotificationsFeed } from "@/components/founder-matching/NotificationsFeed";
import { MessagingInterface } from "@/components/founder-matching/MessagingInterface";
import { ProjectsTab } from "@/components/founder-matching/ProjectsTab";
import {
  useCofounderMutualMatches,
  useCofounderProfile,
  useCofounderStatistics,
} from "@/hooks/use-cofounder-matching";
import { cn } from "@/lib/utils";

const MIN_PHOTOS_REQUIRED = 3;

type TabKey = "discover" | "matches" | "network" | "messages" | "projects";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { key: "discover", label: "Discover", icon: <Compass className="h-4 w-4" /> },
  { key: "matches", label: "Matches", icon: <Users className="h-4 w-4" /> },
  { key: "network", label: "Network", icon: <Network className="h-4 w-4" /> },
  { key: "messages", label: "Messages", icon: <MessageCircle className="h-4 w-4" /> },
  { key: "projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
];

interface ActiveConversation {
  conversationId: string;
  profileName: string;
}

export default function FounderDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam ?? "discover");
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | undefined>();
  const profileQuery = useCofounderProfile();
  const statsQuery = useCofounderStatistics();
  const mutualMatchesQuery = useCofounderMutualMatches();

  const founderName = useMemo(() => {
    const name = profileQuery.data?.name;
    return name ? name.split(" ")[0] : "";
  }, [profileQuery.data?.name]);

  const mutualCount = mutualMatchesQuery.data?.mutual_matches.length ?? 0;
  const statistics = useMemo(() => ({
    profileViews: statsQuery.data?.profile_views ?? profileQuery.data?.views_count ?? 0,
    mutualInterestCount: statsQuery.data?.mutual_interest_count ?? profileQuery.data?.mutual_interest_count ?? mutualCount,
    pendingMatches: statsQuery.data?.pending_matches ?? 0,
  }), [mutualCount, profileQuery.data?.mutual_interest_count, profileQuery.data?.views_count, statsQuery.data?.mutual_interest_count, statsQuery.data?.pending_matches, statsQuery.data?.profile_views]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) {
      return;
    }

    if (!profile.onboarding_completed || (profile.photo_urls?.length ?? 0) < MIN_PHOTOS_REQUIRED) {
      navigate("/founder/onboarding", { replace: true });
    }
  }, [navigate, profileQuery.data]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const openConversation = (conversationId: string, profileName: string) => {
    setActiveConversation({ conversationId, profileName });
    switchTab("messages");
  };

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <section className="bg-gray-50 pt-8 pb-4 border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
                Welcome, <span className="text-blue-600">{founderName || "Founder"}</span>.
              </h1>
              <p className="text-sm text-gray-500">
                Find your perfect co-founder.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/founder/profile")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <User className="h-4 w-4" />
                View profile
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex min-w-[220px] flex-col items-center rounded-full bg-white py-4 px-6 shadow-sm border border-gray-100 relative">
              <div className="text-xl font-bold text-blue-600">{statistics.profileViews}</div>
              <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Profile Views</div>
              <Eye className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
            </div>
            <div className="flex min-w-[220px] flex-col items-center rounded-full bg-white py-4 px-6 shadow-sm border border-gray-100 relative">
              <div className="text-xl font-bold text-blue-600">{statistics.mutualInterestCount}</div>
              <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Connections</div>
              <Activity className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
            </div>
            <div className="flex min-w-[220px] flex-col items-center rounded-full bg-white py-4 px-6 shadow-sm border border-gray-100 relative">
              <div className="text-xl font-bold text-blue-600">{statistics.pendingMatches}</div>
              <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Interested</div>
              <Star className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "network" && mutualCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                    {mutualCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {activeTab === "discover" && (
          <MatchDiscovery onViewAllMatches={() => switchTab("matches")} />
        )}
        {activeTab === "matches" && (
          <MatchesFeed onOpenConversation={openConversation} />
        )}
        {activeTab === "network" && (
          <NotificationsFeed onOpenConversation={openConversation} />
        )}
        {activeTab === "messages" && (
          <MessagingInterface
            initialConversationId={activeConversation?.conversationId}
            initialConversationName={activeConversation?.profileName}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsTab onOpenConversation={openConversation} currentProfile={profileQuery.data ?? null} />
        )}
      </main>
    </div>
  );
}
