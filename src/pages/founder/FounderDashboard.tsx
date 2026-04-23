import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Compass,
  Users,
  Network,
  MessageCircle,
  User,
  LayoutDashboard,
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
import { cn } from "@/lib/utils";
import type { MatchStatistics } from "@/types/founder-matching";

const MIN_PHOTOS_REQUIRED = 3;

type TabKey = "discover" | "matches" | "network" | "messages";

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
  const [stats, setStats] = useState<MatchStatistics | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | undefined>();
  const [mutualCount, setMutualCount] = useState(0);
  const [founderName, setFounderName] = useState<string>("");

  useEffect(() => {
    cofounderMatchingService
      .getProfile()
      .then((profile) => {
        if (profile.name) {
          setFounderName(profile.name.split(" ")[0]);
        }
        if (!profile.onboarding_completed || (profile.photo_urls?.length ?? 0) < MIN_PHOTOS_REQUIRED) {
          navigate("/founder/onboarding", { replace: true });
        }
      })
      .catch(() => { })
      .finally(() => setIsLoadingProfile(false));
  }, [navigate]);

  const loadStats = useCallback(async () => {
    try {
      const [dashboardStats, mutual] = await Promise.all([
        cofounderMatchingService.getStatistics(),
        cofounderMatchingService.getMutualMatches().catch(() => ({ mutual_matches: [] })),
      ]);
      setStats(dashboardStats);
      setMutualCount(mutual.mutual_matches.length);
    } catch {
      // Non-critical dashboard metadata
    }
  }, []);

  useEffect(() => {
    if (!isLoadingProfile) {
      loadStats();
    }
  }, [isLoadingProfile, loadStats]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const openConversation = (conversationId: string, profileName: string) => {
    setActiveConversation({ conversationId, profileName });
    switchTab("messages");
  };

  if (isLoadingProfile) {
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

          {stats && (
            <div className="mt-8 flex items-center gap-4 overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex min-w-[220px] flex-col items-center rounded-full bg-white py-4 px-6 shadow-sm border border-gray-100 relative">
                <div className="text-xl font-bold text-blue-600">{stats.matches_count ?? 0}</div>
                <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Profile Views</div>
                <Eye className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
              </div>
              <div className="flex min-w-[220px] flex-col items-center rounded-full bg-white py-4 px-6 shadow-sm border border-gray-100 relative">
                <div className="text-xl font-bold text-blue-600">{stats.mutual_interest_count ?? 0}</div>
                <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Connections</div>
                <Activity className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
              </div>
              <div className="flex min-w-[220px] flex-col items-center rounded-full bg-white py-4 px-6 shadow-sm border border-gray-100 relative">
                <div className="text-xl font-bold text-blue-600">{stats.pending_matches ?? 0}</div>
                <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Interested</div>
                <Star className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
              </div>
            </div>
          )}

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
      </main>
    </div>
  );
}
