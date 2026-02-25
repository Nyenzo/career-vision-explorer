// src/services/founder-matching.service.ts
import { apiClient } from "../lib/api-client";

/* ============================== */
/* ========= INTERFACES ========= */
/* ============================== */

export interface CofounderProfile {
  profile_id?: string;
  user_id?: string;
  current_role: string;
  years_experience: number;
  technical_skills: string[];
  soft_skills: string[];
  seeking_roles: string[];
  industries: string[];
  commitment_level: "Full-time" | "Part-time" | "Flexible" | "Contract";
  location_preference: "Remote" | "Hybrid" | "On-site";
  preferred_locations: string[];
  achievements: string[];
  education: string[];
  certifications: string[];
  linkedin_url?: string;
  portfolio_url?: string;
  bio: string;
  is_active?: boolean;
  created_at?: string;
  views_count?: number;
  matches_count?: number;
  interested_count?: number;
  mutual_interest_count?: number;
  photos?: string[];
}

export interface MatchProfile {
  match_id: string;
  matched_profile: {
    profile_id: string;
    current_role: string;
    years_experience: number;
    technical_skills: string[];
    seeking_roles: string[];
    education: string[];
    bio: string;
    linkedin_url?: string;
    portfolio_url?: string;
    achievements?: string[];
    soft_skills?: string[];
    industries?: string[];
    commitment_level?: string;
    location_preference?: string;
    photos?: string[];
  };
  overall_score: number;
  score_breakdown: {
    skill_compatibility: number;
    experience_match: number;
    role_alignment: number;
  };
  status: "suggested" | "interested" | "declined" | "mutual_interest" | "skipped";
  mutual_interest_at?: string;
}

export interface DiscoverMatchesRequest {
  limit?: number;
  min_score?: number;
  filters?: {
    industries?: string[];
    location_preferences?: string[];
    commitment_level?: string[];
    min_experience?: number;
    max_experience?: number;
  };
}

export interface MatchActionResponse {
  match_id: string;
  status: string;
  user_action: string;
  mutual_interest: boolean;
  message: string;
}

export interface Statistics {
  total_matches: number;
  mutual_interests: number;
  profile_views: number;
  average_match_score: number;
  top_matching_industries: Array<{ industry: string; count: number }>;
  engagement_score: number;
}

export interface PhotoUploadResponse {
  photo_url: string;
  photo_count: number;
}

export interface PhotoUploadStatus {
  uploaded: boolean;
  photos: string[];
}

export interface ConversationListResponse {
  conversations: Array<{
    conversation_id: string;
    match_profile: CofounderProfile;
    last_message: string;
    unread_count: number;
  }>;
}

export interface Message {
  message_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
}

/* ============================== */
/* ========= SERVICE ============ */
/* ============================== */

class CofounderMatchingService {
  private readonly base = "/api/v1/cofounder-matching";

  /* ================= Profile ================= */

  async createProfile(
    profileData: Omit<CofounderProfile, "profile_id" | "user_id">
  ): Promise<CofounderProfile> {
    return apiClient.post(`${this.base}/profile`, profileData);
  }

  async getProfile(): Promise<CofounderProfile> {
    return apiClient.get(`${this.base}/profile`);
  }

  async updateProfile(
    profileData: Partial<CofounderProfile>
  ): Promise<CofounderProfile> {
    return apiClient.put(`${this.base}/profile`, profileData);
  }

  async deleteProfile(): Promise<void> {
    return apiClient.delete(`${this.base}/profile`);
  }

  /* ================= Photos ================= */

  async uploadPhoto(file: File): Promise<PhotoUploadResponse> {
    return apiClient.uploadFile(`${this.base}/profile/photos`, file);
  }

  async getPhotoStatus(): Promise<PhotoUploadStatus> {
    return apiClient.get(`${this.base}/profile/photos`);
  }

  async deletePhoto(photoUrl: string): Promise<PhotoUploadStatus> {
    return apiClient.delete(
      `${this.base}/profile/photos?photo_url=${encodeURIComponent(photoUrl)}`
    );
  }

  /* ================= Discovery ================= */

  async discoverMatches(
    request: DiscoverMatchesRequest
  ): Promise<{ matches_found: number; matches: MatchProfile[] }> {
    return apiClient.post(`${this.base}/discover`, request);
  }

  /* ================= Swipe Actions ================= */

  async swipeRight(matchId: string): Promise<MatchActionResponse> {
    return apiClient.post(`${this.base}/matches/${matchId}/action`, {
      action: "interested",
    });
  }

  async swipeLeft(matchId: string): Promise<MatchActionResponse> {
    return apiClient.post(`${this.base}/matches/${matchId}/action`, {
      action: "declined",
    });
  }

  /* ================= Matches ================= */

  async getMutualMatches(): Promise<{ mutual_matches: MatchProfile[] }> {
    return apiClient.get(`${this.base}/matches/mutual`);
  }

  async getPendingInterests(): Promise<{
    pending_matches: MatchProfile[];
    total: number;
  }> {
    return apiClient.get(`${this.base}/matches/pending-interests`);
  }

  /* ================= Messaging ================= */

  async getConversations(
    limit = 20,
    offset = 0
  ): Promise<ConversationListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return apiClient.get(
      `${this.base}/conversations?${params.toString()}`
    );
  }

  async getMessages(
    conversationId: string,
    limit = 50
  ): Promise<Message[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    return apiClient.get(
      `${this.base}/conversations/${conversationId}/messages?${params.toString()}`
    );
  }

  async sendMessage(
    matchId: string,
    messageText: string
  ): Promise<Message> {
    return apiClient.post(
      `${this.base}/conversations/${matchId}/messages`,
      { text: messageText }
    );
  }

  /* ================= Statistics ================= */

  async getStatistics(): Promise<Statistics> {
    return apiClient.get(`${this.base}/statistics`);
  }

  async getQuickStats(): Promise<{
    total_matches: number;
    mutual_interests: number;
    profile_views: number;
    profile_completeness: number;
  }> {
    const stats = await this.getStatistics();
    const profile = await this.getProfile().catch(() => null);

    let profileCompleteness = 0;

    if (profile) {
      const requiredFields: (keyof CofounderProfile)[] = [
        "current_role",
        "years_experience",
        "technical_skills",
        "soft_skills",
        "seeking_roles",
        "industries",
        "commitment_level",
        "location_preference",
        "preferred_locations",
        "bio",
      ];

      const filledFields = requiredFields.filter((field) => {
        const value = profile[field];
        return (
          value !== undefined &&
          value !== null &&
          (Array.isArray(value)
            ? value.length > 0
            : value.toString().trim().length > 0)
        );
      }).length;

      profileCompleteness = Math.round(
        (filledFields / requiredFields.length) * 100
      );
    }

    return {
      total_matches: stats.total_matches,
      mutual_interests: stats.mutual_interests,
      profile_views: stats.profile_views,
      profile_completeness: profileCompleteness,
    };
  }
}

export const cofounderMatchingService =
  new CofounderMatchingService();